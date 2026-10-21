# Spec-Anchored

Plugin local do Cursor para [Spec-Anchored Agentic Development](https://raphamoura.dev/en/blog/spec-anchored-agentic-development/), a partir do bundle [w00fx/spec-anchored-agentic-development](https://github.com/w00fx/spec-anchored-agentic-development) (MIT).

Uma spec permanente por capability ancora testes, revisão e conformidade. A máquina produz o primeiro não. Autonomia começa estreita e só alarga com evidência. O texto que o agente lê está em inglês. Os comandos deste plugin são a superfície no Cursor; o procedimento em si não depende de um harness.

## Instalação

O plugin já está em:

```text
~/.cursor/plugins/local/spec-anchored/
```

O Cursor carrega plugins locais sem um passo de install. Se os comandos não aparecerem, recarregue a janela.

Este plugin não altera o repositório aberto. As regras têm `alwaysApply: false`. O trabalho começa quando você invoca um comando, ou quando edita um arquivo em `specs/**/*.md` (a regra da camada de verdade).

## Trajetória mínima

1. Escolha a próxima capability e escreva meia página: regras, casos de borda e non-goals. O template está em `templates/capability-spec.md`.
2. `/shape` entrevista. Não grava a spec.
3. `/to-spec` materializa `specs/<capability>/<capability>.md`. Lacuna vira pergunta aberta.
4. Um humano ratifica a spec no merge do PR dela.
5. `/spec-to-tickets` quebra a spec ratificada em tarefas de entrega.
6. `/prep` uma vez, para a interface de verificação do repositório.
7. `/implement` roda o fluxo supervisionado de uma fatia: plano com gate, testes no trecho, revisão em worktree isolado, PR parado em `PR_READY_AWAITING_HUMAN`.

O playbook de alargamento da autonomia não entra nesta versão. O começo estreito é: classes triviais numa allowlist, CI verde, humano em todo PR.

## Comandos

| Comando | O que faz |
|---|---|
| `/shape` | Entrevista. Não escreve a spec. |
| `/to-spec` | Escreve ou atualiza a spec a partir da entrevista. |
| `/spec-to-tickets` | Rascunha tickets de entrega e só publica com confirmação humana. |
| `/prep` | Prepara `check`, `golden` e o piso de CI. Não mexe em código de aplicação. |
| `/implement` | Implementação supervisionada (alias de `implement-feature`). |
| `/review-spec-drift` | Relatório de drift spec versus código. Não corrige. |

Skills sem comando, carregadas pelo fluxo: `implementation-protocol`, `implement-feature`, `implement-orchestrated`, `implement-backlog`, `general-code-review`, `ticket-readiness-review`, `explain`.

## Agentes internos

Os dois agentes editam só num worktree isolado e devolvem um commit local. O Owner inspeciona e aceita ou rejeita. Nenhum dos dois aprova o próprio trabalho.

- `general-code-reviewer` — correção de corretude, simplicidade, tipos, testes e desenho local.
- `mutation-hardener` — cobertura de linha e ramo em 100% no alvo elegível, zero mutante sobrevivente acionável.

Conformidade com a spec, segurança, performance e arquitetura sistêmica ficam fora deste fluxo: PR, CI ou humano.

## O que este plugin não inclui

O kernel `scripts/spec-anchored`, a suíte de contratos adversariais e os hooks de um harness específico continuam no repositório upstream. `prep` aponta essa instalação como opcional no repo alvo. Sem o kernel, o fingerprint de aprovação é um SHA-256 de um JSON canônico, com o comando e a saída registrados.

Estado de run vai para `.agent-runs/<run-id>/`, nunca para `.cursor/`, `.claude/` ou `.codex/`.

## Licença

MIT. Ver [LICENSE](LICENSE). O método é de Raphael Moura.
