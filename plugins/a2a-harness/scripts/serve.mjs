#!/usr/bin/env node
import { readFileSync, statSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Operator-owned checkout and configuration. Never resolve code from the host's cwd.
// The runtime owns stdio, tool schemas, CLI workers, credentials and journals.
try {
  if (Number(process.versions.node.split('.')[0]) !== 24) throw new Error();
  const root = process.env.AGENT_RUNTIME_ROOT;
  const config = process.env.A2A_COORDINATOR_CONFIG;
  if (!root || !isAbsolute(root) || !config || !isAbsolute(config)) throw new Error();
  const metadata = JSON.parse(readFileSync(join(root, 'packages/mcp/package.json'), 'utf8'));
  if (metadata.name !== '@squad-agent-runtime/mcp') throw new Error();
  const entry = join(root, 'packages/mcp/dist/client-cli.js');
  if (!statSync(entry).isFile()) throw new Error();

  // This plugin explicitly selects coordinator-only mode. Inherited legacy gateway
  // variables must neither add provider-specific tools nor break partial config.
  for (const key of ['A2A_GATEWAY_URL', 'A2A_PROJECT_ID', 'A2A_ENVIRONMENT_ID',
    'A2A_DATA_DIR', 'A2A_TOKEN', 'A2A_TOKEN_FILE', 'A2A_REQUEST_TIMEOUT_MS',
    'A2A_ALLOW_INPUT_RESPONSE']) delete process.env[key];
  await import(pathToFileURL(entry).href);
} catch {
  process.stderr.write('A2A_HARNESS_STARTUP_FAILED: use Node 24, a built AGENT_RUNTIME_ROOT checkout and an absolute A2A_COORDINATOR_CONFIG path.\n');
  process.exitCode = 1;
}
