import { compilePenpotSvgRestoreRepair } from "../../liquidity-studio/server/penpot-svg-restore.js";
const args = process.argv.slice(2);
if (args.length !== 2)
  throw new Error("Expected native version and current revision");
let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
  if (Buffer.byteLength(input) > 2 * 1024 * 1024)
    throw new Error("Native input exceeds2MiB");
}
const plan = compilePenpotSvgRestoreRepair({
  file: JSON.parse(input),
  nativeVersion: args[0],
  expectedRevision: Number(args[1]),
});
process.stdout.write(JSON.stringify(plan));
