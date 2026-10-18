import fs from 'node:fs';
import path from 'node:path';

// Host-side gate only. It never contacts Docker or starts a process/container.
const target = path.resolve(process.argv[2] || process.cwd());
const requiredGiB = Number(process.argv[3] || 12);
try {
  if (!Number.isFinite(requiredGiB) || requiredGiB <= 0) {
    throw new Error('Required free GiB must be a finite positive number');
  }
  const stat = fs.statfsSync(target, { bigint: true });
  const availableBytes = stat.bavail * stat.bsize;
  const requiredBytes = BigInt(Math.ceil(requiredGiB * 1024 ** 3));
  const passed = availableBytes >= requiredBytes;
  console.log(JSON.stringify({
    status: passed ? 'passed' : 'blocked',
    target,
    availableBytes: availableBytes.toString(),
    requiredBytes: requiredBytes.toString(),
    requiredFreeGiB: requiredGiB,
    boundary: 'Host filesystem only; Docker VM disk capacity and daemon health require separate verification',
  }, null, 2));
  if (!passed) process.exitCode = 1;
} catch (error) {
  console.error(`Capacity preflight failed: ${error.message}`);
  process.exitCode = 1;
}
