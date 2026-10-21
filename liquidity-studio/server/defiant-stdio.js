import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { registerDefiantTools } from './defiant-mcp.js';
import { createDefiantUnifiedData } from './defiant-unified-data.js';
import { loadDefiantPrivateDataset } from './defiant-private-dataset.js';
import {DEFIANT_DOMAIN_INSTRUCTIONS} from './defiant-domain-pathways.js';
import {open} from 'node:fs/promises';
import {constants} from 'node:fs';
async function adjacentDomainUi(){
  let file;
  try{
    file=await open(new URL('./defiant-domain-review.html',import.meta.url),constants.O_RDONLY|constants.O_NOFOLLOW);
    const stat=await file.stat();
    if(!stat.isFile()||stat.size<1||stat.size>512*1024)throw Error('Invalid adjacent domain UI');
    return await file.readFile('utf8');
  }catch(error){if(error.code==='ENOENT')return undefined;throw error;}
  finally{await file?.close();}
}
// Exactly one private input file. This process has no HTTP listener or Studio session.
async function start() {
  if (process.argv.length !== 3) throw new Error('Private input required');
  const { organizationId, dataset, isCurrent } = await loadDefiantPrivateDataset(process.argv[2]);
  const domainUiHtml=await adjacentDomainUi();
  const actor = Object.freeze({ kind: 'private-local-owner-process' });
  const service = createDefiantUnifiedData({ dataset, organizationId, authorize: candidate => candidate === actor ? isCurrent() : false });
  const handle = serveStdio(() => {
    const server = new McpServer({ name: 'defiant-private-research', version: '1.0.0' }, { instructions: `This private process is bound to organizationId ${organizationId}. Use that exact scope for all tools. ${DEFIANT_DOMAIN_INSTRUCTIONS}` });
    registerDefiantTools(server, { domainUiHtml, resolveService: async input => {
      if (input.organizationId !== organizationId) throw Object.assign(new Error('Private scope denied'), { status: 403 });
      return { service, actor };
    } });
    return server;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void handle.close(); });
}
start().catch(() => { console.error('Defiant private stdio could not start. Check the owner-only dataset envelope.'); process.exitCode = 1; });
