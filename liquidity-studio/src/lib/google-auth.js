import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';

// Firebase owns persistence and token refresh; the application never stores tokens.
export function createGoogleAuth(config) {
  if (!config.firebase?.apiKey || !config.firebase?.projectId || !config.firebase?.authDomain || !config.firebase?.appId)
    throw new Error('Google sign-in is not configured. Contact your studio operator.');
  const auth = getAuth(initializeApp(config.firebase, 'liquidity-studio'));
  if (config.emulator) {
    const endpoint = new URL(config.emulator.url);
    const loopback = (host) => ['localhost', '127.0.0.1', '[::1]'].includes(host);
    if (!loopback(location.hostname) || !loopback(endpoint.hostname) || endpoint.protocol !== 'http:')
      throw new Error('Authentication emulator is restricted to local development.');
    connectAuthEmulator(auth, endpoint.origin);
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return {
    watch: (callback) => onAuthStateChanged(auth, callback),
    login: () => signInWithPopup(auth, provider),
    logout: () => signOut(auth),
    getToken: async () => {
      if (!auth.currentUser) throw new Error('Sign in with Google to continue.');
      return auth.currentUser.getIdToken();
    },
  };
}
