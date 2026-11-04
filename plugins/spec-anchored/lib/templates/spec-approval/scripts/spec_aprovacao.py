#!/usr/bin/env python3
"""Aprovação de capability spec (specs/<capability>/<capability>.md).

Usado por .github/workflows/spec-approve.yml (comando /approve no PR) e
.github/workflows/spec-approval-guard.yml (invalidação de aprovação velha).
Só stdlib: roda no python3 do runner sem setup.

Subcomandos:
  alteradas --base REF                 lista as specs alteradas no PR (merge-base de REF..HEAD)
  aprovar --login L --em TS ARQ...     preenche approved_by/approved_at e promove status a ratified
  verificar --base REF                 falha se alguma spec alterada mudou depois da aprovação

Ratificação: o /approve grava status: ratified junto com a aprovação, no branch do PR.
Ela só passa a valer quando o PR é mergeado no branch default (é lá que spec-to-tickets
e implement leem o status).

Regra de invalidação (verificar), por spec alterada no PR:
  - approved_by e approved_at vazios: spec ainda não aprovada; passa com aviso,
    a menos que status seja ratified (ratificada sem /approve: falha).
  - aprovada com status diferente de ratified: falha.
  - só um dos dois preenchido, ou approved_at fora de AAAA-MM-DDTHH:MM:SSZ: falha.
  - o commit de aprovação é o último commit do PR (merge-base..HEAD) que mexe na
    linha approved_at desse arquivo. Falha se:
      * não existe (aprovação herdada da base, mas a spec mudou neste PR);
      * não foi feito pelo workflow (autor github-actions[bot]);
      * mexe em outras linhas da spec além de approved_by/approved_at/status;
      * o arquivo no HEAD difere do arquivo nesse commit (mudou depois da aprovação).
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

CAMPOS_APROVACAO = ("approved_by", "approved_at", "status")
STATUS_RATIFICADO = "ratified"
EMAIL_BOT = "41898282+github-actions[bot]@users.noreply.github.com"
RE_TIMESTAMP = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
# Login do GitHub: alfanumérico e hífen, até 39 caracteres.
RE_LOGIN = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")
RE_LINHA_APROVACAO = re.compile(r"^[+-](approved_by|approved_at|status):")


class ErroSpec(Exception):
    pass


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], check=True, capture_output=True, text=True
    ).stdout


def eh_caminho_de_spec(caminho: str) -> bool:
    partes = caminho.split("/")
    return len(partes) == 3 and partes[0] == "specs" and partes[2].endswith(".md")


def separar_front_matter(linhas: list[str]) -> tuple[int, int]:
    """Índices (abertura, fechamento) das linhas '---' do front matter."""
    if not linhas or linhas[0].rstrip("\r\n") != "---":
        raise ErroSpec("sem front matter (a primeira linha não é '---')")
    for i in range(1, len(linhas)):
        if linhas[i].rstrip("\r\n") == "---":
            return 0, i
    raise ErroSpec("front matter sem '---' de fechamento")


def ler_campos(texto: str) -> dict[str, str]:
    """Campos escalares de nível zero do front matter (chave: valor)."""
    linhas = texto.splitlines(keepends=True)
    inicio, fim = separar_front_matter(linhas)
    campos: dict[str, str] = {}
    for linha in linhas[inicio + 1 : fim]:
        m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*):(.*)$", linha.rstrip("\r\n"))
        if m:
            campos[m.group(1)] = m.group(2).strip()
    return campos


def eh_spec(texto: str) -> bool:
    try:
        return bool(ler_campos(texto).get("capability_id"))
    except ErroSpec:
        return False


def preencher_aprovacao(texto: str, login: str, em: str) -> str:
    """Troca só as linhas approved_by/approved_at/status do front matter; o resto fica byte a byte."""
    linhas = texto.splitlines(keepends=True)
    inicio, fim = separar_front_matter(linhas)
    valores = {"approved_by": login, "approved_at": em, "status": STATUS_RATIFICADO}
    encontrados: dict[str, int] = {}
    for i in range(inicio + 1, fim):
        for campo in CAMPOS_APROVACAO:
            if re.match(rf"^{campo}:", linhas[i]):
                if campo in encontrados:
                    raise ErroSpec(f"'{campo}' aparece mais de uma vez no front matter")
                encontrados[campo] = i
    faltando = [c for c in CAMPOS_APROVACAO if c not in encontrados]
    if faltando:
        raise ErroSpec(f"front matter sem o(s) campo(s) {', '.join(faltando)}")
    for campo, i in encontrados.items():
        fim_de_linha = linhas[i][len(linhas[i].rstrip("\r\n")) :]
        linhas[i] = f"{campo}: {valores[campo]}{fim_de_linha}"
    return "".join(linhas)


def specs_alteradas(base: str) -> list[str]:
    merge_base = git("merge-base", base, "HEAD").strip()
    nomes = git(
        "diff", "--name-only", "--diff-filter=AMR", merge_base, "HEAD", "--", "specs/"
    ).splitlines()
    return [n for n in nomes if eh_caminho_de_spec(n) and eh_spec(Path(n).read_text(encoding="utf-8"))]


def cmd_alteradas(args: argparse.Namespace) -> int:
    for caminho in specs_alteradas(args.base):
        print(caminho)
    return 0


def cmd_aprovar(args: argparse.Namespace) -> int:
    if not RE_LOGIN.match(args.login):
        print(f"login inválido: {args.login!r}", file=sys.stderr)
        return 2
    if not RE_TIMESTAMP.match(args.em):
        print(f"timestamp fora de AAAA-MM-DDTHH:MM:SSZ: {args.em!r}", file=sys.stderr)
        return 2
    erros = 0
    for caminho in args.arquivos:
        arquivo = Path(caminho)
        # newline="" preserva CRLF/LF do arquivo como está.
        with arquivo.open(encoding="utf-8", newline="") as f:
            texto = f.read()
        try:
            novo = preencher_aprovacao(texto, args.login, args.em)
        except ErroSpec as e:
            print(f"{caminho}: {e}", file=sys.stderr)
            erros += 1
            continue
        with arquivo.open("w", encoding="utf-8", newline="") as f:
            f.write(novo)
        print(f"{caminho}: approved_by={args.login} approved_at={args.em} status={STATUS_RATIFICADO}")
    return 1 if erros else 0


def problema_de_aprovacao(caminho: str, merge_base: str) -> str | None:
    """None se a aprovação da spec está válida (ou ausente); senão, o motivo."""
    try:
        campos = ler_campos(Path(caminho).read_text(encoding="utf-8"))
    except ErroSpec as e:
        return str(e)
    por, em = campos.get("approved_by", ""), campos.get("approved_at", "")
    status = campos.get("status", "")
    if not por and not em:
        if status == STATUS_RATIFICADO:
            return "status ratified sem aprovação; só o /approve promove a spec"
        return None
    if not por or not em:
        return "approved_by e approved_at devem estar ambos preenchidos ou ambos vazios"
    if not RE_TIMESTAMP.match(em):
        return f"approved_at fora de AAAA-MM-DDTHH:MM:SSZ: {em!r}"
    if status != STATUS_RATIFICADO:
        return f"spec aprovada com status {status!r}; o /approve grava status: {STATUS_RATIFICADO}"

    commit = git(
        "log", "-1", "--format=%H", "-G", r"^approved_at:", f"{merge_base}..HEAD", "--", caminho
    ).strip()
    if not commit:
        return (
            "a spec mudou neste PR, mas a aprovação veio da base; "
            "a aprovação anterior não cobre o conteúdo novo"
        )
    curto = commit[:12]
    email = git("log", "-1", "--format=%ae", commit).strip()
    if email != EMAIL_BOT:
        return f"a aprovação ({curto}) não foi registrada pelo /approve (autor {email})"
    diff = git("diff", "--unified=0", f"{commit}^", commit, "--", caminho).splitlines()
    outras = [
        l for l in diff
        if l[:1] in "+-" and not l.startswith(("+++", "---")) and not RE_LINHA_APROVACAO.match(l)
    ]
    if outras:
        return f"o commit de aprovação {curto} altera outras linhas da spec além de approved_by/approved_at/status"
    if subprocess.run(["git", "diff", "--quiet", commit, "HEAD", "--", caminho]).returncode != 0:
        depois = git("log", "--format=%h %s", f"{commit}..HEAD", "--", caminho).strip()
        return (
            f"a spec mudou depois da aprovação registrada em {curto}"
            + (f" (commits: {'; '.join(depois.splitlines())})" if depois else "")
        )
    return None


def cmd_verificar(args: argparse.Namespace) -> int:
    merge_base = git("merge-base", args.base, "HEAD").strip()
    specs = specs_alteradas(args.base)
    if not specs:
        print("Nenhuma capability spec alterada neste PR.")
        return 0
    falhas = 0
    for caminho in specs:
        motivo = problema_de_aprovacao(caminho, merge_base)
        campos = ler_campos(Path(caminho).read_text(encoding="utf-8"))
        if motivo:
            falhas += 1
            print(f"::error file={caminho},line=1::Aprovação inválida: {motivo}. Revise e comente /approve no PR.")
        elif campos.get("approved_by"):
            print(f"{caminho}: ratificada por {campos['approved_by']} em {campos['approved_at']}; conteúdo inalterado desde então (vale após o merge).")
        else:
            print(f"::warning file={caminho},line=1::Spec ainda não aprovada (comente /approve no PR).")
    return 1 if falhas else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="comando", required=True)
    p = sub.add_parser("alteradas")
    p.add_argument("--base", required=True)
    p.set_defaults(func=cmd_alteradas)
    p = sub.add_parser("aprovar")
    p.add_argument("--login", required=True)
    p.add_argument("--em", required=True)
    p.add_argument("arquivos", nargs="+")
    p.set_defaults(func=cmd_aprovar)
    p = sub.add_parser("verificar")
    p.add_argument("--base", required=True)
    p.set_defaults(func=cmd_verificar)
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
