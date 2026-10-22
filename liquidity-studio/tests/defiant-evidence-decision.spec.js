// Hosted only: real Studio HTTP/service and invented source records.
import {test,expect} from '@playwright/test';
import {randomBytes} from 'node:crypto';
import {createPlatform} from '../server/platform.js';
import {DurableStore} from '../server/storage.js';
import {createHttpServer} from '../server/index.js';
import {DefiantStrategyService} from '../server/defiant-strategy.js';
const periods=['2024-01','2024-06','2025-01','2025-06'];
const hashes=periods.map((_,i)=>String(i+1).repeat(64));
function snapshot(){return {schemaVersion:1,organizationId:'org',coverage:'Invented store coverage fixture',receipts:[],selections:[{id:'june',label:'Invented June',sourceHash:hashes[3],amount:'0',currency:'USD',sourceRecords:[2]}],months:periods.map((month,i)=>({month,currency:'USD',amount:['10','0','5','0'][i],sourceHash:hashes[i],metric:'source-total-earned',receiptIds:[]})),comparisons:[{id:'stores',dimension:'store',sourceSystem:'invented',accountScope:'invented-account',currency:'USD',periodBasis:'filename-declared',beforeMonths:periods.slice(0,2),afterMonths:periods.slice(2),sourceReferences:periods.map((month,i)=>({month,sourceHash:hashes[i]})),groups:[{id:'store_one',key:'Example',label:'Example',beforeAmount:'10',afterAmount:'5',sourceReferences:[]}]}],storePeriodCoverage:[{schemaVersion:1,id:'coverage_one',comparisonId:'stores',storeKey:'Example',observations:periods.map((month,i)=>({month,sourceHash:hashes[i],rowCount:i===3?0:1,amount:['10','0','5',null][i],postingWindow:{first:'2025-07-01',last:'2025-07-31'}}))}]};}
test('June review preserves page and evidence through reload with qualified and unavailable actions',async({page})=>{
 const platform=createPlatform({store:new DurableStore(':memory:'),authMode:'password'});await platform.ready;
 const password=randomBytes(24).toString('base64url');await platform.identity.provision({username:'decision-founder',password,role:'founder'});
 const actor=(await platform.identity.login('decision-founder',password)).user,org=await platform.identity.createOrganization(actor,'Decision fixture');
 await new DefiantStrategyService({store:platform.store,identity:platform.identity,organizationId:org.id}).enable(actor,{});
 let observed=false;const hostile='<img src=x onerror="alert(1)">';
 const data=()=>{const d=snapshot();d.organizationId=org.id;d.selections[0].sourceRecords=Array.from({length:26},(_,i)=>i+2);d.selections.push({id:'older',label:'Older source',sourceHash:hashes[0],currency:'USD',amount:'10',sourceRecords:[2]});if(observed){d.storePeriodCoverage[0].observations[3].rowCount=1;d.storePeriodCoverage[0].observations[3].amount='0';}return d;};
 const server=createHttpServer(null,{platform,defiantEvidenceProvider:async()=>({loadSnapshot:data,loadSourceRecords:async({sourceHash,sourceRecords})=>sourceRecords.map(record=>({id:'row_'+record,sourceHash,member:'invented.csv',record,cells:{Title:hostile,Amount:'0'}}))})});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  await page.goto(base+`/?org=${org.id}&tab=strategy&view=evidence`);await page.getByLabel('Username',{exact:true}).fill('decision-founder');await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in →',exact:true}).click();
  const explorer=page.getByRole('region',{name:'Earnings and receipts',exact:true});await expect(explorer).toHaveAttribute('aria-busy','false');await expect(explorer).toContainText('4 reported periods');
  await explorer.getByRole('button',{name:'Source selections',exact:true}).click();await expect(page).toHaveURL(/evidenceMode=selections/);await explorer.getByRole('button',{name:'Inspect selection june',exact:true}).click();await page.getByRole('button',{name:'Next page',exact:true}).click();
  await page.getByRole('button',{name:'Open June evidence review',exact:true}).click();const review=page.getByRole('region',{name:'June evidence review',exact:true});await expect(review.getByRole('heading',{name:'Action',exact:true})).toBeVisible();await expect(review).toContainText('Commercial recommendation: not-ready');await expect(review).toContainText('Unknown analyst effort');await expect(review).toContainText('Unset');await expect(page).toHaveURL(/evidenceOffset=25/);
  await page.reload();await expect(review).toContainText('Hypothesis · untested');await review.getByRole('button',{name:'Inspect original selection cells'}).click();await expect(page.getByRole('heading',{name:'invented.csv · record 27'})).toBeVisible();await expect(page.getByRole('region',{name:'Earnings and receipts'}).locator('img')).toHaveCount(0);await expect(page).toHaveURL(/evidenceOffset=25/);
  await page.getByRole('button',{name:'Open June evidence review',exact:true}).click();await expect(review).toBeVisible();await page.setViewportSize({width:390,height:844});await expect(review.getByRole('heading',{name:'Cost',exact:true})).toBeVisible();
  observed=true;await page.reload();await expect(page.getByRole('alert')).toContainText('Evidence changed');await page.getByRole('button',{name:'Refresh evidence',exact:true}).click();await page.getByRole('button',{name:'Inspect selection june',exact:true}).click();await page.getByRole('button',{name:'Open June evidence review',exact:true}).click();await expect(review).toContainText('No reporting-absence action');await expect(review.getByRole('heading',{name:'Action',exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:'Source selections',exact:true}).click();await page.getByRole('button',{name:'Inspect selection older',exact:true}).click();await expect(page.getByRole('button',{name:'Open June evidence review',exact:true})).toHaveCount(0);
 }finally{await new Promise(resolve=>server.close(resolve));await platform.close?.();}
});
