import { open, lstat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
const MAX_BYTES = 4 * 1024 * 1024;
/** Explicit local owner process input, not Studio identity or network authorization. */
export async function loadDefiantPrivateDataset(filePath) {
  if (typeof filePath !== 'string' || !filePath || !filePath.startsWith('/') || filePath !== resolve(filePath)) throw new Error('An absolute private dataset path is required');
  const uid = process.getuid?.();
  if (!Number.isInteger(uid)) throw new Error('Private dataset ownership checks are unavailable');
  const parent = await lstat(dirname(filePath));
  if (!parent.isDirectory() || parent.isSymbolicLink() || parent.uid !== uid || (parent.mode & 0o777) !== 0o700) throw new Error('Dataset parent must be owner-only directory mode 0700');
  const handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.uid !== uid || (stat.mode & 0o777) !== 0o600 || stat.size < 1 || stat.size > MAX_BYTES) throw new Error('Dataset must be owner-only regular file mode 0600 within size limit');
    const bytes = Buffer.alloc(stat.size + 1);
    let length = 0;
    while (length < bytes.length) {
      const read = await handle.read(bytes, length, bytes.length - length, null);
      if (!read.bytesRead) break;
      length += read.bytesRead;
    }
    if (length !== stat.size) throw new Error('Dataset changed during bounded read');
    const input = JSON.parse(bytes.subarray(0, length).toString('utf8'));
    if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(key => !['organizationId', 'dataset'].includes(key)) || typeof input.organizationId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(input.organizationId) || !input.dataset || typeof input.dataset !== 'object') throw new Error('Invalid private dataset envelope');
    const isCurrent = async () => {
      try {
        const current = await lstat(filePath), directory = await lstat(dirname(filePath));
        return current.isFile() && !current.isSymbolicLink() && current.uid === uid && (current.mode & 0o777) === 0o600 && current.dev === stat.dev && current.ino === stat.ino && current.size === stat.size && current.mtimeMs === stat.mtimeMs && current.ctimeMs === stat.ctimeMs && directory.isDirectory() && !directory.isSymbolicLink() && directory.uid === uid && (directory.mode & 0o777) === 0o700;
      } catch { return false; }
    };
    return { ...input, isCurrent };
  } finally { await handle.close(); }
}
