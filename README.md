# agent-plugins

Marketplace pessoal de plugins para Cursor, Claude Code e Codex.

Cada plugin mantém um conteúdo compartilhado entre hosts. Em `spec-anchored`, ele fica em `lib/`; em `a2a-harness`, a skill fica em `skills/` e o launcher MCP em `scripts/`. Os manifestos adaptam a descoberta de cada host.

| Vendor | Marketplace | Formato próprio |
|---|---|---|
| Cursor | `.cursor-plugin/marketplace.json` | `.cursor-plugin/plugin.json` e `rules/*.mdc` |
| Claude Code | `.claude-plugin/marketplace.json` | `.claude-plugin/plugin.json`, `commands/` e `agents/` |
| Codex | `.agents/plugins/marketplace.json` | `.codex-plugin/plugin.json` (`skills`) |

## Plugins

| Plugin | Caminho | O que faz |
|---|---|---|
| spec-anchored | `plugins/spec-anchored` | Uma spec permanente por capability, gates de máquina antes da revisão humana. Adaptação harness-neutra do método de Raphael Moura ([artigo](https://raphamoura.dev/en/blog/spec-anchored-agentic-development/), [bundle MIT](https://github.com/w00fx/spec-anchored-agentic-development)). |
| a2a-harness | `plugins/a2a-harness` | Cliente do CLI A2A do `agent-runtime`: descoberta por Cards e conversas duráveis independentes de provedor. |
| ci-diet | `plugins/ci-diet` | Acha tempo de runner desperdiçado em GitHub/Gitea Actions e prepara patches YAML para revisão humana. Fork [risaddex/dsh-ci-diet](https://github.com/risaddex/dsh-ci-diet) com Gitea; skill + CLI empacotado em `bin/cli.mjs`. |

## Instalar

Adicione `https://github.com/risaddex/agent-plugins` como marketplace no Cursor, no Claude Code ou no Codex. Os catálogos apontam para as pastas de cada plugin em `plugins/`. Em `spec-anchored`, skills, agentes, comandos e templates são links para `lib/`. Instale sempre o diretório inteiro de cada plugin, não um subdiretório de vendor.

A cópia local do Cursor fica em `~/.cursor/plugins/local/spec-anchored/`.

## Editar uma regra

A prosa mora em `plugins/spec-anchored/lib/rules/`. O formato `.mdc` do Cursor é gerado:

```bash
python3 plugins/spec-anchored/render.py
```

## Harness A2A

O [A2A Harness](plugins/a2a-harness/README.md) consome um checkout externo do
`agent-runtime` via `AGENT_RUNTIME_ROOT`, com Node 24 e configuração privada em
`A2A_COORDINATOR_CONFIG`. Consulte o README do plugin para preparar e verificar.

## CI Diet

`plugins/ci-diet` é uma cópia gerada: rode `bun run bundle:plugin` no fork `dsh-ci-diet` e copie `plugin/` para cá. Para Gitea, exporte `GITEA_URL` e `GITEA_TOKEN` antes de abrir o host.
