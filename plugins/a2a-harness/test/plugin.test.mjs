import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';
import { mkdtemp, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';

const plugin = dirname(dirname(fileURLToPath(import.meta.url)));
const runtime = process.env.AGENT_RUNTIME_ROOT;
assert.ok(isAbsolute(runtime ?? ''), 'Set AGENT_RUNTIME_ROOT to the built runtime checkout');
const require = createRequire(join(runtime, 'packages/mcp/package.json'));
const { Client } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/client')).href);
const { StdioClientTransport } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/client/stdio')).href);
const names = ['list_conversation_agents', 'inspect_conversation_agent', 'start_conversation',
  'get_conversation', 'get_conversation_result', 'stop_conversation', 'resume_conversation'];
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const cleanEnv = () => Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('A2A_') && key !== 'AGENT_RUNTIME_ROOT'));

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'a2a-harness-'));
  const requests = []; const tasks = new Map(); let origin;
  const server = createServer(async (req, res) => {
    res.setHeader('content-type', 'application/a2a+json');
    requests.push({ method: req.method, url: req.url });
    const alias = req.url.split('/')[1];
    if (req.method === 'GET' && req.url === `/${alias}/card`) {
      res.end(JSON.stringify({ name: alias, description: 'Independent fixture', version: '1',
        supportedInterfaces: [{ protocolBinding: 'JSONRPC', protocolVersion: '1.0', url: `${origin}/${alias}/rpc` }],
        capabilities: {}, defaultInputModes: ['text/plain'], defaultOutputModes: ['text/plain'],
        skills: [{ id: 'discuss', name: 'Discuss', description: 'Review', tags: ['review'] }] })); return;
    }
    if (req.method !== 'POST' || req.url !== `/${alias}/rpc`) { res.writeHead(404).end('{}'); return; }
    let body = ''; for await (const chunk of req) body += chunk;
    const wire = JSON.parse(body); let task;
    if (wire.method === 'SendMessage') {
      task = { id: `${alias}:task/${tasks.size+1}`, contextId: wire.params.message.contextId,
        status: { state: 'TASK_STATE_COMPLETED' },
        artifacts: [{ artifactId: 'answer', parts: [{ text: `Answer from ${alias}` }] }] };
      tasks.set(task.id, task);
    } else if (wire.method === 'GetTask') task = tasks.get(wire.params.id);
    else { res.writeHead(400).end('{}'); return; }
    res.end(JSON.stringify({ jsonrpc:'2.0', id:wire.id, result:wire.method === 'SendMessage' ? {task} : task }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  origin = `http://127.0.0.1:${server.address().port}`;
  const config = join(dir, 'coordinator.json');
  await writeFile(config, JSON.stringify({ dataDir:join(dir,'state'), participants:['first','second'],
    agents:Object.fromEntries(['first','second'].map(alias => [alias, { cardUrl:`${origin}/${alias}/card`, contextId:`${alias}-retained`, principal:'test-operator' }])) }), {mode:0o600});
  t.after(async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); await rm(dir,{recursive:true,force:true}); });
  return {dir,config,requests,tasks};
}

async function connect(f, path = plugin, extra = {}) {
  const client = new Client({name:'a2a-harness-test',version:'1.0.0'});
  const transport = new StdioClientTransport({command:process.execPath, args:[join(path,'scripts/serve.mjs')], cwd:f.dir,
    env:{...cleanEnv(), AGENT_RUNTIME_ROOT:runtime, A2A_COORDINATOR_CONFIG:f.config,...extra}, stderr:'pipe'});
  let stderr = '';
  const connected = client.connect(transport);
  transport.stderr?.on('data',chunk=>{stderr+=chunk;});
  await connected;
  return {client,close:()=>client.close(),stderr:()=>stderr};
}
async function call(client,name,args={}) {
  const result = await client.callTool({name,arguments:args});
  assert.notEqual(result.isError,true,JSON.stringify(result));
  return result.structuredContent;
}

test('portable and host manifests share identity and resolve the same entrypoint',async()=>{
  const root = await json(join(plugin,'plugin.json'));
  assert.equal(root.$schema,'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.ok(root.extensions['com.openai'].interface.shortDescription.length<=30);
  assert.deepEqual(Object.keys(root).filter(key=>['skills','mcpServers','apps','interface'].includes(key)),[]);
  for(const host of ['codex','claude','cursor']) {
    const manifest = await json(join(plugin,`.${host}-plugin/plugin.json`));
    for(const key of ['name','version','description']) assert.equal(manifest[key],root[key]);
  }
  const configs = [['mcp.json','${PLUGIN_ROOT}'],['.mcp.json','${CLAUDE_PLUGIN_ROOT}'],['mcp.cursor.json','${CURSOR_PLUGIN_ROOT}'],['mcp.codex.json','.']];
  for(const [path,token] of configs) {
    const definition = (await json(join(plugin,path))).mcpServers['a2a-harness'];
    assert.equal(definition.command,'node');
    assert.equal(definition.args[0].replace(token,plugin),join(plugin,'scripts/serve.mjs'));
  }
  const skill = await readFile(join(plugin,'skills/a2a-harness/SKILL.md'),'utf8');
  assert.match(skill,/^---\nname: a2a-harness\ndescription: .+\n---\n/);
});

test('relocated plugin discovers only seven neutral tools and performs Agent Card discovery',async t=>{
  const f = await fixture(t);
  const relocated = join(f.dir,'copied plugin');
  await cp(plugin,relocated,{recursive:true});
  // Deliberate partial legacy config and nonexistent token file must not activate legacy mode.
  const s = await connect(f,relocated,{A2A_GATEWAY_URL:'http://127.0.0.1:1',A2A_TOKEN_FILE:'/missing/NEVER_READ',A2A_ALLOW_INPUT_RESPONSE:'true'});
  try {
    assert.deepEqual((await s.client.listTools()).tools.map(tool=>tool.name),names);
    const agents = await call(s.client,'list_conversation_agents');
    assert.equal(agents.agents.length,2); assert.ok(agents.agents.every(agent=>agent.available));
    assert.equal((await call(s.client,'inspect_conversation_agent',{alias:'first'})).name,'first');
    assert.deepEqual(f.requests.map(req=>req.url),['/first/card','/second/card','/first/card']);
  } finally {await s.close();}
});

test('background conversation survives MCP restart, preserves contexts and deduplicates repeated start', {timeout:60000}, async t=>{
  const f = await fixture(t);
  const input = {conversationId:'retained-test',objective:'Review without modifying files',rounds:1,durationMs:20000};
  const s = await connect(f);
  const started = await call(s.client,'start_conversation',input);
  assert.equal(started.worker.status,'running');
  // Kill only this test worker if the test fails; never inspect or signal real lab PIDs.
  t.after(()=>{try{process.kill(started.worker.pid,'SIGTERM');}catch{}});
  await s.close();
  const next = await connect(f);
  try {
    await call(next.client,'start_conversation',input);
    let status;
    for(let i=0;i<100;i++) {
      status = await call(next.client,'get_conversation',{conversationId:input.conversationId});
      if(status.status!=='running') break;
      await sleep(200);
    }
    assert.equal(status.status,'completed'); assert.equal(status.turns.length,3); assert.equal(f.tasks.size,3);
    assert.deepEqual(status.turns.map(turn=>turn.contextId),['first-retained','second-retained','first-retained']);
    assert.ok(status.turns.every(turn=>turn.state==='TASK_STATE_COMPLETED'));
    const result = await call(next.client,'get_conversation_result',{conversationId:input.conversationId});
    assert.equal(result.final,true); assert.match(result.result.output,/Answer from first/);
    assert.ok(f.requests.every(req=>/^\/(first|second)\/(card|rpc)$/.test(req.url)));
  } finally {await next.close();}
});

test('host authority cannot be overridden by tool arguments and unavailable config is sanitized',async t=>{
  const f = await fixture(t);
  const s = await connect(f);
  try {
    const invalid = await s.client.callTool({name:'start_conversation',arguments:{conversationId:'invalid',objective:'Hi',rounds:1,durationMs:1000,configPath:'/private/SECRET_SENTINEL'}});
    assert.equal(invalid.isError,true); assert.doesNotMatch(JSON.stringify(invalid),/SECRET_SENTINEL/);
    await rm(f.config);
    const result = await s.client.callTool({name:'list_conversation_agents',arguments:{}});
    assert.equal(result.isError,true); assert.match(JSON.stringify(result),/INVALID_CONFIG/);
    assert.equal(f.requests.length,0);
  } finally {await s.close();}
});

test('missing or relative checkout fails without printing environment credentials',async()=>{
  for(const root of [undefined,'relative','/nonexistent/SECRET_SENTINEL']) {
    const env={...cleanEnv(),A2A_COORDINATOR_CONFIG:'/tmp/unused',A2A_TOKEN:'SECRET_SENTINEL',...(root===undefined?{}:{AGENT_RUNTIME_ROOT:root})};
    const child=spawn(process.execPath,[join(plugin,'scripts/serve.mjs')],{env,stdio:['ignore','pipe','pipe']});
    let out='';let err='';child.stdout.on('data',chunk=>{out+=chunk;});child.stderr.on('data',chunk=>{err+=chunk;});
    const [status]=await once(child,'close');
    assert.equal(status,1);assert.equal(out,'');assert.match(err,/A2A_HARNESS_STARTUP_FAILED/);assert.doesNotMatch(err,/SECRET_SENTINEL/);
  }
});
