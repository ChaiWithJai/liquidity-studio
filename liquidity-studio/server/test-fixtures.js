// Explicit synthetic fixtures for isolated contract tests; never used by production startup.
export function approveTestSources(container) {
  for (const story of container.ports.repo.backlog) {
    story.sourceClaims = ['First synthetic contract fixture.', 'Second synthetic contract fixture.', 'Third synthetic contract fixture.'].map((text, index) => ({
      id: `fixture_${index}`,
      text,
      sourceUrl: `https://example.test/source/${index}`,
      status: "approved",
      kind: "general",
    }));
    story.verifiedFacts = story.sourceClaims.map(claim => claim.text);
  }
  return container;
}
