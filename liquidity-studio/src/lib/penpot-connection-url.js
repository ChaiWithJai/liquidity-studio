// The expected origin comes only from the authenticated Studio pairing response.
export function checkedPenpotConnectionUrl(value, nativeOrigin) {
  try {
    if (typeof nativeOrigin !== 'string' || typeof value !== 'string') throw new Error();
    const expected = new URL(nativeOrigin);
    const url = new URL(value);
    if (expected.origin !== nativeOrigin || !['http:', 'https:'].includes(expected.protocol) ||
        url.origin !== nativeOrigin || url.pathname !== '/studio-connect' ||
        url.username || url.password || url.hash ||
        [...url.searchParams.keys()].length !== 1 ||
        !/^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get('challenge') || '')) throw new Error();
    return url.href;
  } catch {
    throw new Error('The Penpot connection link is unavailable. Start again.');
  }
}
