// Explicit synthetic fixtures for isolated contract tests; never used by production startup.
export function approveTestSources(container) {
  for (const story of container.ports.repo.backlog) {
    story.sourceClaims = story.verifiedFacts.map((text, index) => ({
      id: `fixture_${index}`,
      text,
      sourceUrl: `https://example.test/source/${index}`,
      status: "approved",
      kind: "general",
    }));
  }
  return container;
}
