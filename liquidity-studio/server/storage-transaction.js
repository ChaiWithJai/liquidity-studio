const limit = 4 * 1024 * 1024;
function invalid(message) {
  return Object.assign(new Error(message), { code: "INVALID_TRANSACTION" });
}
export function transactionKeys(keys, callback) {
  if (!Array.isArray(keys) || keys.length < 1 || keys.length > 8 ||
      new Set(keys).size !== keys.length ||
      Array.from(keys).some(key => typeof key !== "string" || !key || Buffer.byteLength(key) > 512) ||
      typeof callback !== "function") throw invalid("Transaction requires 1–8 distinct bounded keys and a synchronous callback");
  return [...keys];
}
export function transactionValues(values, count) {
  // Invalid async callbacks must fail the transaction without leaving a rejected
  // native Promise to crash the process after rollback.
  if (values instanceof Promise) values.catch(() => {});
  if (!Array.isArray(values) || values.length !== count)
    throw invalid("Transaction must return one JSON value per key synchronously");
  let total = 0;
  return Array.from({ length: count }, (_, index) => {
    let encoded;
    try { encoded = JSON.stringify(values[index]); } catch { throw invalid("Transaction requires JSON values"); }
    if (typeof encoded !== "string") throw invalid("Transaction requires JSON values");
    total += Buffer.byteLength(encoded);
    if (total > limit) throw Object.assign(new Error("Transaction exceeds four MiB capacity"), { code: "STORE_CAPACITY" });
    return encoded;
  });
}
