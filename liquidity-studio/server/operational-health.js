/** Readiness checks local serving dependencies without making billable provider calls. */
export async function checkReadiness({ ports }, { timeoutMs = 1000 } = {}) {
  let timer;
  const repository = await Promise.race([
    Promise.resolve().then(() => ports.repo.listBacklog()).then(
      () => 'available',
      () => 'unavailable'
    ),
    new Promise((resolve) => { timer = setTimeout(() => resolve('timeout'), timeoutMs); })
  ]).finally(() => clearTimeout(timer));

  // A configured model is not evidence of provider connectivity. Do not expose URLs or keys.
  return {
    status: repository === 'available' ? 'ready' : 'not_ready',
    checks: { repository, generationProvider: 'not_checked' },
    scope: 'studio_repository_access'
  };
}
