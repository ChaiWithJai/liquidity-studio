import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDefiantSyntheticDataset } from './defiant-synthetic-dataset.js';

test('fictional generator is reproducible, bounded and explicitly separate from recovered facts', () => {
 const first=generateDefiantSyntheticDataset(),same=generateDefiantSyntheticDataset(),other=generateDefiantSyntheticDataset({seed:'different-fictional-seed'});
 assert.deepEqual(first,same);assert.notDeepEqual(first.demand,other.demand);
 assert.equal(first.dataset.provenance,'synthetic');assert.equal(first.dataset.asOf,'2026-10-01T00:00:00.000Z');assert.match(first.dataset.reason,/No real artist metrics/);
 assert.deepEqual(first.dataset.counts,{artists:6,tracks:36,regions:6,collaborators:6,sources:6,campaigns:6,opportunities:36,demand:2592,royalties:432,rights:36,forecasts:216});
 assert.ok(Buffer.byteLength(JSON.stringify({organizationId:'fictional_local',dataset:first}))<4*1024*1024);
 assert.equal(first.demand[0].date,'2025-10-01');assert.equal(first.royalties.at(-1).date,'2026-09-01');
 for(const rows of Object.values(first).filter(Array.isArray)){assert.equal(new Set(rows.map(row=>row.id)).size,rows.length);assert.ok(rows.every(row=>row.provenance==='synthetic'));}
 for(const options of [{months:1},{months:25},{asOf:'2026-02-30'},{asOf:'2026-10-02'},{seed:''}])assert.throws(()=>generateDefiantSyntheticDataset(options));
});
test('all domain joins are coherent and monthly royalty units, cents and payout splits conserve', () => {
 const data=generateDefiantSyntheticDataset(),artists=new Set(data.artists.map(row=>row.id)),tracks=new Map(data.tracks.map(row=>[row.id,row])),regions=new Set(data.regions.map(row=>row.id)),parties=new Set([...artists,...data.collaborators.map(row=>row.id)]);
 for(const row of data.demand){assert.equal(tracks.get(row.trackId).artistId,row.artistId);assert.ok(regions.has(row.regionId));assert.ok(Number.isSafeInteger(row.streams)&&row.streams>0);assert.equal(row.period,'month');}
 const totals=new Map();for(const row of data.demand){const key=row.trackId+'|'+row.date;totals.set(key,(totals.get(key)||0)+row.streams);}
 for(const row of data.royalties){assert.equal(row.streams,totals.get(row.trackId+'|'+row.date));assert.equal(row.royaltyCents,Math.round(row.streams*row.rateMicros/10000));assert.equal(row.amount,row.royaltyCents/100);assert.equal(row.amountMicros,row.streams*row.rateMicros);assert.equal(row.splits.reduce((sum,split)=>sum+split.amountCents,0),row.royaltyCents);assert.equal(row.splits.reduce((sum,split)=>sum+split.shareBps,0),10000);assert.ok(row.splits.every(split=>parties.has(split.partyId)));}
 for(const row of data.collaborators){assert.ok(row.artistIds.every(id=>artists.has(id)));assert.ok(row.trackIds.every(id=>tracks.has(id)));}
 for(const opportunity of data.opportunities){assert.ok(tracks.has(opportunity.trackId));assert.ok(opportunity.sourceIds.every(id=>data.sources.find(source=>source.id===id).trackIds.includes(opportunity.trackId)));if(opportunity.campaignId)assert.equal(data.campaigns.find(campaign=>campaign.id===opportunity.campaignId).trackId,opportunity.trackId);}
});
test('planted NJ cohort is demonstrable while baseline forecast and rights remain simulations', () => {
 const data=generateDefiantSyntheticDataset();
 for(const [index,artist] of data.artists.entries()){
  const aggregate=region=>Array.from({length:12},(_,month)=>data.demand.filter(row=>row.artistId===artist.id&&row.regionId===region&&row.date===data.demand[month*6].date).reduce((sum,row)=>sum+row.streams,0));
  const nj=aggregate('region:nj'),ca=aggregate('region:ca');const ratio=values=>values.slice(-3).reduce((a,b)=>a+b,0)/values.slice(-6,-3).reduce((a,b)=>a+b,0);
  if(index<2)assert.ok(ratio(nj)>(index===0?3.5:2.2));else assert.ok(ratio(nj)<1.2);
  assert.ok(ratio(ca)<1.2);
 }
 for(const forecast of data.forecasts){const last=data.demand.filter(row=>row.trackId===forecast.trackId&&row.regionId===forecast.regionId).slice(-3);assert.equal(forecast.projectedStreams,last.reduce((sum,row)=>sum+row.streams,0));assert.equal(forecast.trained,false);assert.equal(forecast.method,'trailing-3-month-baseline');}
 for(const right of data.rights){assert.equal(right.actualApproval,false);assert.equal(right.method,'simulation');assert.match(right.status,/^simulated-/);}
 assert.ok(data.tracks.every(track=>track.rightsStatus==='unknown'));
});
