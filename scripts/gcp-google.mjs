export function googleDeploymentEnv(env, project) {
  const keys = ['STUDIO_FIREBASE_PROJECT_ID', 'STUDIO_FIREBASE_API_KEY', 'STUDIO_FIREBASE_AUTH_DOMAIN', 'STUDIO_FIREBASE_APP_ID', 'STUDIO_GOOGLE_FOUNDER_EMAIL', 'STUDIO_GOOGLE_MARKETER_EMAIL'];
  const values = Object.fromEntries(keys.map(key => [key, env[key]]));
  if (Object.values(values).some(value => typeof value !== 'string' || !value.trim() || /[\r\n]/.test(value))) throw new Error('Explicit Google public SDK configuration and two principal emails required');
  if (values.STUDIO_FIREBASE_PROJECT_ID !== project) throw new Error('Firebase project must match the deployed project');
  if (!/^[a-z0-9.-]+\.firebaseapp\.com$/.test(values.STUDIO_FIREBASE_AUTH_DOMAIN) || !/^1:\d+:web:[a-f0-9]+$/.test(values.STUDIO_FIREBASE_APP_ID)) throw new Error('Invalid Firebase web configuration');
  const emails = keys.slice(-2).map(key => values[key].trim().toLowerCase());
  if (emails.some(value => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) || emails[0] === emails[1]) throw new Error('Two distinct Google principal emails required');
  return { ...values, STUDIO_AUTH_MODE: 'google' };
}
export async function verifyGoogleProvider({ project, token, fetchImpl = fetch }) {
  const response = await fetchImpl(`https://identitytoolkit.googleapis.com/admin/v2/projects/${project}/defaultSupportedIdpConfigs/google.com`, { headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': project }, signal: AbortSignal.timeout(15000), redirect: 'error' });
  if (!response.ok) throw new Error('Google provider configuration could not be verified');
  const provider = await response.json();
  if (!provider.name?.endsWith('/defaultSupportedIdpConfigs/google.com') || provider.enabled !== true || !/^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(provider.clientId || '')) throw new Error('Google provider must be enabled with a configured web client');
  // Never return provider data: the API may include its OAuth client secret.
  return true;
}
