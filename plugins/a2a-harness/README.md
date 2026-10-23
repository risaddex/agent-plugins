# A2A Harness

Plugin cliente independente de provedor para o `agent-runtime`. Um único MCP
reutiliza o CLI e o coordenador durável existentes; descobre os Agent Cards
configurados e conversa via **A2A 1.0 JSON-RPC**. Não duplica a orquestração.

## Preparar o runtime

Requer Node **24**, um checkout confiável do `agent-runtime` com dependências e
build, e a configuração privada do coordenador. No checkout do runtime, quando
ainda não estiver preparado, execute `npm ci` e `npm run build`.

Antes de abrir o host, configure:

```sh
export AGENT_RUNTIME_ROOT="/caminho/absoluto/agent-runtime"
export A2A_COORDINATOR_CONFIG="/caminho/absoluto/coordinator.json"
```

O executável `node` no PATH do host precisa ser Node 24. Hosts gráficos podem
não herdar o ambiente do terminal: configure as mesmas variáveis no ambiente
do servidor MCP. O launcher resolve o checkout explicitamente, mesmo se o plugin
for copiado para um cache ou o host mudar de diretório. Não baixa nem instala
código automaticamente; usa `packages/mcp/dist/client-cli.js` do checkout.
Contrato verificado com `agent-runtime` no commit `389fe20`.

Para um ambiente novo, adapte `examples/coordinator.json` fora deste repositório
e use permissão `0600`. Os URLs `.example.test` e caminhos são exemplos, não
endpoints reais. `tokenFile` é opcional e também exige `0600`; o CLI o relê a cada
requisição. Não coloque tokens no plugin, no objetivo ou no Git.

Para continuar um ambiente existente, aponte para **o mesmo arquivo de configuração**,
com os mesmos `dataDir`, identidades, par ordenado e `contextId`. O runtime aceita
a configuração legada do laboratório. Não copie o exemplo por cima dela e não
crie um journal paralelo para os mesmos contextos. O plugin não gerencia leases,
não altera sessões nativas e não reinicia servidores.

## Carregar no host

O catálogo `agent-plugins` inclui `a2a-harness` nos três formatos. Esta pasta
contém a fonte; não é um bundle do runtime, e o checkout externo continua necessário.

| Host | Manifesto | MCP |
|---|---|---|
| Agent Plugins 1.0 | `plugin.json` | `mcp.json` |
| Claude Code | `.claude-plugin/plugin.json` | `.mcp.json` |
| Codex | `.codex-plugin/plugin.json` | `mcp.codex.json` |
| Cursor | `.cursor-plugin/plugin.json` | `mcp.cursor.json` (declarado explicitamente) |

Cada formato adapta apenas descoberta e caminhos; todos executam `scripts/serve.mjs`.
As configurações não devem ser mescladas. Cursor usa `${CURSOR_PLUGIN_ROOT}` em
seu overlay porque não expande `${PLUGIN_ROOT}`. Em um cliente que priorize o
manifesto portátil e ignore o overlay, registre `mcp.cursor.json` explicitamente
com o caminho da instalação, em vez de carregar as duas definições.
Referências: [Cursor](https://prod.cursor.com/docs/reference/plugins) e
[Claude Code](https://code.claude.com/docs/en/plugins-reference).

Para testar o carregamento no Claude, depois de exportar as duas variáveis:

```sh
claude --plugin-dir /caminho/absoluto/agent-plugins/plugins/a2a-harness
```

Se estiver retomando uma sessão existente, mantenha os parâmetros de resume e
Channels do launcher atual e acrescente este plugin ao carregamento. O comando
acima sozinho não retoma a sessão anterior nem habilita o Channels.

Qualquer host MCP stdio também pode executar `node /caminho/absoluto/a2a-harness/scripts/serve.mjs`
com as duas variáveis. Não depende de Claude, Codex, Cursor ou de um gateway
proprietário. O launcher seleciona exclusivamente as ferramentas do coordenador,
ignorando variáveis herdadas do cliente antigo `A2A_GATEWAY_*`/token/escopo.

## Ferramentas

| Ferramenta | Uso |
|---|---|
| `list_conversation_agents` | Descobrir disponibilidade e Cards |
| `inspect_conversation_agent` | Consultar Card por alias |
| `start_conversation` | Iniciar worker durável e retornar prontamente |
| `get_conversation` | Consultar estado e turnos |
| `get_conversation_result` | Consultar resultado registrado |
| `stop_conversation` | Impedir novos turnos; não cancela tarefa remota já aceita |
| `resume_conversation` | Recuperar a mesma conversa dentro dos limites originais |

O catálogo pode conter vários agentes, mas cada journal fixa um par ordenado.
`rounds: 2` permite até cinco turnos. O plugin não expõe o host como servidor A2A:
os participantes precisam ter servidores/adapters de entrada funcionando.
Assim, uma sessão Claude que recebe turnos continua precisando do Channels.

Prompt de exemplo:

> Use a2a-harness para descobrir os participantes configurados. Inicie a conversa
> revisao-001, com 2 rodadas e duração máxima de 300000 ms, para propor e revisar
> uma estratégia de testes sem alterar arquivos. Preserve os contextos existentes.
> Retorne após iniciar, para continuar disponível aos eventos de entrada.

Para testar memória, use um ID novo e objetivo como: “Cada participante deve
relatar o que lembra das sessões anteriores, distinguindo lembrança própria de
informações recebidas agora. Não consultem arquivos nem alterem o ambiente.”
Não coloque os códigos esperados no objetivo.

## Verificar

```sh
AGENT_RUNTIME_ROOT=/caminho/absoluto/agent-runtime npm test --prefix plugins/a2a-harness
claude plugin validate ./plugins/a2a-harness
```

Os testes usam o MCP e o CLI reais com servidores A2A de teste em loopback e
diretório temporário. Validam descoberta, conversa em background, reconexão,
deduplicação, preservação dos contextos e falhas sanitizadas. Não acessam o
laboratório, credenciais reais ou sessões de provedores. O carregamento nativo
em cada interface precisa ser verificado separadamente da integração MCP.

### Validação desta versão

Em 2026-10-23, com Node 24.21.0 e runtime `389fe20`:

- 5/5 testes passaram; conversa de três turnos completou após reconexão MCP,
  sem duplicar tarefas e mantendo os contextos configurados nas fixtures.
- `plugin.json` e `mcp.json` passaram pelos schemas oficiais Agent Plugins 1.0.0;
  todos os JSON e o frontmatter YAML da skill foram parseados.
- `claude plugin validate` aprovou o manifesto, com aviso opcional de ícone ausente.
- Nenhuma instalação nativa em Claude/Codex/Cursor, publicação ou conversa com
  provedores reais foi executada nesta validação. O laboratório foi preservado.
