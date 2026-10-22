# agent-plugins

Marketplace pessoal de plugins para Cursor, Claude Code e Codex.

O texto que o agente lê fica em `plugins/spec-anchored/lib/`. Cada vendor só acrescenta o manifesto e o formato que ele descobre sozinho.

| Vendor | Marketplace | Formato próprio |
|---|---|---|
| Cursor | `.cursor-plugin/marketplace.json` | `.cursor-plugin/plugin.json` e `rules/*.mdc` |
| Claude Code | `.claude-plugin/marketplace.json` | `.claude-plugin/plugin.json`, `commands/` e `agents/` |
| Codex | `.agents/plugins/marketplace.json` | `.codex-plugin/plugin.json` (`skills`) |

## Plugins

| Plugin | Caminho | O que faz |
|---|---|---|
| spec-anchored | `plugins/spec-anchored` | Uma spec permanente por capability, gates de máquina antes da revisão humana. Adaptação harness-neutra do método de Raphael Moura ([artigo](https://raphamoura.dev/en/blog/spec-anchored-agentic-development/), [bundle MIT](https://github.com/w00fx/spec-anchored-agentic-development)). |

## Instalar

Adicione `https://github.com/risaddex/agent-plugins` como marketplace no Cursor, no Claude Code ou no Codex. Os três apontam para `plugins/spec-anchored`. Skills, agentes, comandos e templates são links para `lib/`, então a instalação precisa do diretório inteiro do plugin, não de um subdiretório de vendor.

A cópia local do Cursor fica em `~/.cursor/plugins/local/spec-anchored/`.

## Editar uma regra

A prosa mora em `plugins/spec-anchored/lib/rules/`. O formato `.mdc` do Cursor é gerado:

```bash
python3 plugins/spec-anchored/render.py
```
