/** Deterministic fictional portfolio for hosted generation. No provider, model or real-person data. */
const ARTISTS = ['Harbor Lantern', 'Juniper Static', 'Copper Atlas', 'Velvet Orchard', 'Paper Comet', 'Cedar Frequency'];
const REGIONS = [['region:nj', 'New Jersey'], ['region:ca', 'California'], ['region:ga', 'Georgia'], ['region:ny', 'New York'], ['region:tx', 'Texas'], ['region:il', 'Illinois']];
function random(seed) {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length;
export function generateDefiantSyntheticDataset({ seed = 'defiant-fictional-portfolio-v1', asOf = '2026-10-01', months = 12 } = {}) {
  if (typeof seed !== 'string' || !seed.length || seed.length > 100 || !/^\d{4}-\d{2}-\d{2}$/.test(asOf) || !Number.isInteger(months) || months < 6 || months > 24) throw new TypeError('Invalid synthetic generation parameters');
  const end = Date.parse(`${asOf}T00:00:00.000Z`);
  if (!Number.isFinite(end) || new Date(end).toISOString().slice(0, 10) !== asOf || !asOf.endsWith('-01')) throw new TypeError('Invalid synthetic date');
  const next = random(seed), provenance = 'synthetic';
  const regions = REGIONS.map(([id, name]) => ({ id, name, country: 'US', provenance }));
  const artists = ARTISTS.map((name, index) => ({ id: `artist:fictional-${index + 1}`, name, homeRegionId: regions[index % regions.length].id, profile: { summary: 'Independent artist in the demonstration portfolio.', genres: [['alternative soul'], ['indie electronic'], ['instrumental hip-hop']][index % 3], homeRegionId: regions[index % regions.length].id }, provenance }));
  const tracks = artists.flatMap((artist, index) => Array.from({ length: 6 }, (_, number) => ({ id: `track:fictional-${index + 1}-${number + 1}`, artistId: artist.id, title: `${artist.name} / Study ${number + 1}`, genre: ['alternative soul', 'indie electronic', 'instrumental hip-hop'][index % 3], releaseDate: '2025-01-01', rightsStatus: 'unknown', provenance })));
  const collaborators = artists.map((artist, index) => ({ id: `collaborator:fictional-${index + 1}`, name: `Producer ${index + 1}`, role: 'producer', artistIds: [artist.id, artists[(index + 1) % artists.length].id], trackIds: tracks.filter(track => track.artistId === artist.id).map(track => track.id), provenance }));
  const sources = artists.map((artist, index) => ({ id: `source:fictional-${index + 1}`, title: `Creative brief for ${artist.name}`, url: `https://example.org/fictional-portfolio/${index + 1}`, trackIds: tracks.filter(track => track.artistId === artist.id).map(track => track.id), provenance, rightsStatus: 'unknown' }));
  const demand = [], royalties = [], forecasts = [], rights = [];
  for (const [trackIndex, track] of tracks.entries()) {
    const series = new Map(regions.map(region => [region.id, []]));
    const rateMicros = 3000 + (trackIndex % 4) * 500;
    for (let month = 0; month < months; month++) {
      const date = new Date(Date.UTC(new Date(end).getUTCFullYear(), new Date(end).getUTCMonth() - months + month, 1)).toISOString().slice(0, 10);
      let total = 0;
      for (const [regionIndex, region] of regions.entries()) {
        const base = 3000 + (trackIndex % 6) * 450 + regionIndex * 300;
        // Deliberately planted, labelled signal: first two fictional artists grow in NJ.
        const boost = region.id === 'region:nj' && trackIndex < 12 && month >= months - 3 ? (trackIndex < 6 ? 4 : 2.5) : 1;
        const streams = Math.round(base * (0.95 + next() * 0.1) * boost);
        series.get(region.id).push(streams); total += streams;
        demand.push({ id: `demand:${track.id}:${region.id}:${date}`, date, regionId: region.id, artistId: track.artistId, trackId: track.id, streams, period: 'month', method: 'synthetic-observation', provenance });
      }
      const amountMicros = total * rateMicros, royaltyCents = Math.round(amountMicros / 10000);
      const artistCents = Math.floor(royaltyCents * 0.8), collaboratorCents = royaltyCents - artistCents;
      royalties.push({ id: `royalty:${track.id}:${date}`, date, trackId: track.id, artistId: track.artistId, streams: total, period: 'month', rate: rateMicros / 1000000, rateMicros, amountMicros, royaltyCents, amount: royaltyCents / 100, splits: [{ partyId: track.artistId, shareBps: 8000, amountCents: artistCents }, { partyId: collaborators[Math.floor(trackIndex / 6)].id, shareBps: 2000, amountCents: collaboratorCents }], currency: 'USD', method: 'synthetic-ledger', provenance });
    }
    for (const region of regions) {
      const values = series.get(region.id), baselineMonthlyStreams = mean(values.slice(-3));
      forecasts.push({ id: `forecast:${track.id}:${region.id}`, trackId: track.id, regionId: region.id, asOf, horizonMonths: 3, baselineMonthlyStreams, projectedStreams: Math.round(baselineMonthlyStreams * 3), method: 'trailing-3-month-baseline', explanation: 'Next three months equal the last three synthetic monthly observations; no trend model or causal lift.', trained: false, provenance });
    }
    rights.push({ id: `rights:${track.id}`, trackId: track.id, territory: 'US', status: trackIndex < 6 ? 'simulated-clear' : trackIndex < 12 ? 'simulated-review' : 'simulated-restricted', method: 'simulation', actualApproval: false, provenance });
  }

  const campaigns = artists.map((artist, index) => ({ id: `campaign:fictional-${index + 1}`, title: `Regional listening plan / ${artist.name}`, trackId: tracks[index * 6].id, sourceIds: [sources[index].id], stage: 'scenario-planning', regionId: 'region:nj', scenario: { budget: 500, spend: 0 }, provenance }));
  const opportunities = tracks.map((track, index) => {
    const rows = demand.filter(row => row.trackId === track.id && row.regionId === 'region:nj');
    const baseline = mean(rows.slice(0, 3).map(row => row.streams)), recent = mean(rows.slice(-3).map(row => row.streams));
    const growthRatio = recent / baseline;
    return { id: `opportunity:${track.id}:nj`, title: `Review NJ signal / ${track.title}`, artistId: track.artistId, trackId: track.id, regionId: 'region:nj', sourceIds: [sources[Math.floor(index / 6)].id], ...(index % 6 === 0 ? { campaignId: campaigns[Math.floor(index / 6)].id } : {}), score: Math.min(100, Math.max(0, Math.round((growthRatio - 1) * 25))), reasons: [`Last three synthetic NJ months average ${recent.toFixed(1)} streams versus ${baseline.toFixed(1)} in the first three.`, 'Growth is deliberately planted for demonstration; rights scenario is separate and requires human review.'], method: 'scenario', status: 'proposed', signal: { baselineMonthlyStreams: baseline, recentMonthlyStreams: recent, growthRatio, baselineMonths: 3, recentMonths: 3 }, provenance, rightsStatus: 'unknown' };
  }).sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const output = { artists, tracks, regions, collaborators, sources, campaigns, opportunities, demand, royalties, rights, forecasts };
  return { dataset: { id: 'defiant-fictional-portfolio-v1', label: 'Media and entertainment portfolio', provenance, asOf: `${asOf}T00:00:00.000Z`, seed, reason: 'Owner-requested synthetic solution-accelerator demonstration. No real artist metrics, clearance, earned revenue or trained forecast.', generationVersion: 1, months, plantedSignal: { regionId: 'region:nj', artistIds: artists.slice(0, 2).map(artist => artist.id), description: 'Deliberately amplified last-three-month regional streams.' }, counts: Object.fromEntries(Object.entries(output).map(([key, rows]) => [key, rows.length])) }, ...output };
}
