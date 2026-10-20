import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerDefiantTools } from './defiant-mcp.js';
import { createDefiantUnifiedData } from './defiant-unified-data.js';
import { loadDefiantPrivateDataset } from './defiant-private-dataset.js';
// Exactly one private input file. This process has no HTTP listener or Studio session.
async function start() {
  if (process.argv.length !== 3) throw new Error('Private input required');
  const { organizationId, dataset, isCurrent } = await loadDefiantPrivateDataset(process.argv[2]);
  const actor = Object.freeze({ kind: 'private-local-owner-process' });
  const service = createDefiantUnifiedData({ dataset, organizationId, authorize: candidate => candidate === actor ? isCurrent() : false });
  const handle = serveStdio(() => {
    const server = new McpServer({ name: 'defiant-private-research', version: '1.0.0' }, { instructions: 'Read-only media and entertainment research: (1) inspect the data manifest and list pathways; (2) use bounded recording/source lookups to inspect evidence; (3) open a governed guided view and explain the next human review step. Keep synthetic scenarios, unknown rights and missing demand/royalty history explicit. These tools do not execute campaigns, approve claims or integrate Databricks/Foundry.' });
    registerDefiantTools(server, { resolveService: async input => {
      if (input.organizationId !== organizationId) throw Object.assign(new Error('Private scope denied'), { status: 403 });
      return { service, actor };
    } });
    return server;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void handle.close(); });
}
start().catch(() => { console.error('Defiant private stdio could not start. Check the owner-only dataset envelope.'); process.exitCode = 1; });
