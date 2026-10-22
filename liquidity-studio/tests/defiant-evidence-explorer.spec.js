// Hosted CI only: actual Studio authentication and HTTP evidence service, invented records.
import {test,expect} from '@playwright/test';
import {randomBytes} from 'node:crypto';
import {createPlatform} from '../server/platform.js';
import {DurableStore} from '../server/storage.js';
import {createHttpServer} from '../server/index.js';
import {DefiantStrategyService} from '../server/defiant-strategy.js';
test('evidence explorer follows real scoped selections to escaped original cells and rejects stale snapshots',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;
 const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'receipt-founder',password,role:'founder'});
 const actor=(await platform.identity.login('receipt-founder',password)).user,org=await platform.identity.createOrganization(actor,'Receipt fixture');
 await new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:org.id}).enable(actor,{});
 const sourceHash='a'.repeat(64),hostile='<img src=x onerror="alert(1)">';let coverage='Invented source coverage';
 const receipt=record=>({id:'r'+record,sourceHash,member:'example.csv',record,cells:{Title:hostile,'Total Earned':'1.000001'}});
 const snapshot=()=>({schemaVersion:1,organizationId:org.id,coverage,months:[{month:'2025-01',currency:'USD',amount:'26.000026',metric:'source-total-earned',sourceHash,receiptIds:['r2']}],receipts:[receipt(2)],selections:[{id:'all_rows',label:'All supplied rows',amount:'26.000026',currency:'USD',sourceHash,sourceRecords:Array.from({length:26},(_,i)=>i+2)},{id:'missing_id',label:'Missing source identity',amount:'1',currency:'USD',sourceHash,sourceRecords:[28]}],identityGroups:[{id:'group_one',artist:'Example artist',title:'Example title',reviewStatus:'needs-review',rankingBasis:'absolute-net-reported-amount-within-currency',provenance:{upstreamSnapshotRevision:'b'.repeat(64),upstreamArtifactHash:'c'.repeat(64),observedPeriod:'2025-01'},members:[{id:'member_one',sourceSystem:'example-source',accountScope:'unverified-example-delivery',sourceId:null,releaseTitle:'Example release',upc:null,selectionIds:['all_rows']}]}]});
 const server=createHttpServer(null,{platform,defiantEvidenceProvider:async()=>({loadSnapshot:async()=>snapshot(),loadSourceRecords:async({sourceRecords})=>sourceRecords.map(receipt)})});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=evidence`);await page.getByLabel('Username',{exact:true}).fill('receipt-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();
  const explorer=page.getByRole('region',{name:'Earnings and receipts'});
  await expect(explorer).toContainText('26.000026 USD');await expect(explorer).toContainText('they do not prove a monthly total');
  await explorer.getByRole('button',{name:'Show example receipt r2',exact:true}).click();await expect(explorer.getByRole('heading',{name:'Original source cells',exact:true})).toBeVisible();
  await expect(explorer.getByText(hostile,{exact:true})).toBeVisible();await expect(explorer.locator('img')).toHaveCount(0);await explorer.getByLabel('Highlight source field',{exact:true}).selectOption('Title');await expect(explorer.locator('mark')).toHaveText(hostile);
  await explorer.getByRole('button',{name:'Identity review',exact:true}).click();await explorer.getByRole('button',{name:'Review Example title',exact:true}).click();await expect(explorer).toContainText('Missing source ID');
  await explorer.getByRole('button',{name:'Inspect selection all_rows',exact:true}).click();await expect(page).not.toHaveURL(/evidenceGroup=/);await expect(explorer).toContainText('1–25 of 26');
  await explorer.getByRole('button',{name:'Next page',exact:true}).click();await expect(explorer).toContainText('26–26 of 26');const saved=page.url();await page.reload();await expect(page).toHaveURL(saved);await expect(explorer).toContainText('example.csv · record 27');
  await page.setViewportSize({width:768,height:800});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  coverage='Changed source coverage';await explorer.getByRole('button',{name:'Previous page',exact:true}).click();await expect(explorer.getByRole('alert')).toContainText('Evidence changed');await expect(explorer.getByRole('heading',{name:'Original source cells',exact:true})).toHaveCount(0);
  await explorer.getByRole('button',{name:'Refresh evidence',exact:true}).click();await expect(explorer).toContainText('Changed source coverage');await expect(explorer).toContainText('Missing source identity');
  coverage='Refreshed unchanged root';await explorer.getByRole('button',{name:'Refresh evidence',exact:true}).click();await expect(explorer).toContainText('Refreshed unchanged root');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await platform.store.close();}
});
