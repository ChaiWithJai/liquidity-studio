import fs from 'node:fs';
import path from 'node:path';
import {PenpotProfilePairing} from '../server/penpot-profile-pairing.js';

export function loadNativePairingConfiguration(filename) {
  if (!path.isAbsolute(filename || '')) throw Error('Absolute private native pairing configuration required');
  const stat = fs.lstatSync(filename);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 16384 || (stat.mode & 0o077))
    throw Error('Native pairing configuration must be a private regular file');
  const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
  const keys = ['schemaVersion', 'nativeInstanceId', 'nativeOrigin', 'studioOrigin', 'pairingKey', 'gatewayKey'];
  if (Object.keys(value).sort().join(',') !== keys.sort().join(',') || value.schemaVersion !== 1 ||
      !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(value.nativeInstanceId || '') ||
      value.nativeOrigin !== 'http://localhost:39008' ||
      !/^[A-Za-z0-9_-]{43}$/.test(value.pairingKey || '') ||
      !/^[a-f0-9]{64}$/.test(value.gatewayKey || '') ||
      value.pairingKey === value.gatewayKey)
    throw Error('Exact native pairing configuration required');
  const studio = new URL(value.studioOrigin);
  if (studio.protocol !== 'http:' || studio.hostname !== '127.0.0.1' ||
      studio.username || studio.password || studio.pathname !== '/' || studio.search || studio.hash ||
      !Number.isInteger(Number(studio.port)) || Number(studio.port) < 1024 || Number(studio.port) > 65535 ||
      studio.origin !== value.studioOrigin)
    throw Error('Fixed local Studio origin required');
  return value;
}

export function localNativePairing({configurationPath, store, identity, origin} = {}) {
  if (!configurationPath) return null;
  if (process.env.NODE_ENV !== 'development' || process.env.K_SERVICE || process.env.K_REVISION || identity.mode !== 'password')
    throw Error('Native pairing developer setup requires the local password launcher');
  const configuration = loadNativePairingConfiguration(configurationPath);
  if (configuration.studioOrigin !== origin) throw Error('Native pairing configuration belongs to another local origin');
  return new PenpotProfilePairing({store, identity, ...configuration});
}
