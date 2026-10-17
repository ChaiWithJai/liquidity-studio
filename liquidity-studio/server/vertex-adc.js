import { GoogleAuth } from 'google-auth-library';

const missing = () => Object.assign(new Error('Local Vertex ADC credentials are unavailable'), {code:'PROVIDER_CREDENTIALS_MISSING'});

// Trusted constructor injection is only for tests. No environment-provided verifier/token code.
export function createLocalADCTokenProvider({keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS, GoogleAuthClass = GoogleAuth} = {}) {
  // Explicit file selection prevents local ADC discovery from falling back to cloud metadata.
  if (!keyFilename || typeof keyFilename !== 'string') throw missing();
  const auth = new GoogleAuthClass({keyFilename, scopes:['https://www.googleapis.com/auth/cloud-platform']});
  return async ({signal} = {}) => {
    signal?.throwIfAborted();
    let token;
    try {
      // The SDK caches credentials and refreshes an expired access token itself.
      token = await auth.getAccessToken();
    } catch {
      signal?.throwIfAborted();
      throw missing();
    }
    signal?.throwIfAborted();
    if (typeof token !== 'string' || !token) throw missing();
    return token;
  };
}
