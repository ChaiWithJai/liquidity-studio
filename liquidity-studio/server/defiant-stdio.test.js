import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, chmod, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
// Hosted-only execution of the actual canonical bundle; never uses operator data.
test('built standalone stdio bundle serves the same scoped tools and rejects revoked private input',async t=>{
 const dir=await mkdtemp(join(tmpdir(),'defiant-stdio-contract-'));await chmod(dir,0o700);t.after(()=>rm(dir,{recursive:true,force:true}));
 const file=join(dir,'dataset.json');
 const data={organizationId:'fictional_local',dataset:{dataset:{id:'fictional',label:'Fictional stdio contract',provenance:'synthetic',asOf:null},artists:[{id:'artist_a',name:'Fictional Artist'}],tracks:[],sources:[],campaigns:[],opportunities:[]}};
 await writeFile(file,JSON.stringify(data),{mode:0o600});
 const transport=new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../dist/mcp/defiant-stdio.mjs',import.meta.url)),file],env:{},stderr:'pipe'});
 const client=new Client({name:'fictional-stdio-contract',version:'1.0.0'});t.after(()=>client.close());await client.connect(transport);
 const list=await client.listTools();assert.deepEqual(list.tools.map(tool=>tool.name).sort(),['defiant_artist_overview', 'defiant_compare_campaign_scenarios', 'defiant_detect_regional_opportunities', 'defiant_explain_opportunity', 'defiant_inspect_rights_and_royalties', 'defiant_list_pathways', 'defiant_open_domain_review', 'defiant_open_guided_view', 'defiant_read_data']);
 const result=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'fictional_local',resource:'artists'}});assert.equal(result.structuredContent.items[0].name,'Fictional Artist');
 const wrong=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'other',resource:'manifest'}});assert.equal(wrong.isError,true);
 const resources=await client.listResources();assert.deepEqual(resources.resources.map(x=>x.uri),['ui://defiant/domain-review-v2.html']);
 const html=await readFile(new URL('../dist/mcp/defiant-domain-review.html',import.meta.url),'utf8');
 const resource=await client.readResource({uri:'ui://defiant/domain-review-v2.html'});assert.equal(resource.contents[0].text,html);assert.equal(resource.contents[0].mimeType,'text/html;profile=mcp-app');
 assert.ok(client.getServerCapabilities()?.prompts);
 const prompts=await client.listPrompts();assert.deepEqual(prompts.prompts.map(prompt=>prompt.name).sort(),['defiant_catalog_activation_review','defiant_opportunity_scenario_review','defiant_regional_talent_review']);
 const prompt=await client.getPrompt({name:'defiant_catalog_activation_review',arguments:{organizationId:'fictional_local',artistId:'artist_a',budgets:'0,500'}});assert.match(prompt.messages[0].content.text,/defiant_artist_overview/);assert.match(prompt.messages[0].content.text,/Mark review pending/);
 await chmod(file,0o644);const revoked=await client.callTool({name:'defiant_read_data',arguments:{organizationId:'fictional_local',resource:'artists'}});assert.equal(revoked.isError,true);assert.equal(revoked.structuredContent,undefined);
});
