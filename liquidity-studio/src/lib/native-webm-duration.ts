/** Correct webm-muxer 5.1.4's last-timestamp duration without moving any bytes.
 * Only our finalized, finite WebM layout is supported. Recording-header insertion
 * remains a separate path. Missing/ambiguous metadata fails rather than guessing.
 */
const IDS = { ebml: 0x1a45dfa3, segment: 0x18538067, info: 0x1549a966, scale: 0x2ad7b1, duration: 0x4489 }
interface Element { id: number; start: number; end: number; size: number }
function numberAt(bytes: Uint8Array, at: number, id: boolean): { value: number | null; length: number } {
  const first = bytes[at]
  if (!first) throw new Error('Invalid WebM EBML integer')
  const length = Math.clz32(first) - 23
  if (length > (id ? 4 : 8) || at + length > bytes.length) throw new Error('Truncated WebM EBML integer')
  let value = id ? first : first & (0xff >> length)
  let unknown = !id && value === (0xff >> length)
  for (let i = 1; i < length; i++) {
    value = value * 256 + bytes[at + i]
    unknown &&= bytes[at + i] === 0xff
  }
  if (unknown) return { value: null, length }
  if (!Number.isSafeInteger(value)) throw new Error('Unsafe WebM EBML size')
  return { value, length }
}
function elements(bytes: Uint8Array, start: number, end: number, root = false): Element[] {
  const result: Element[] = []
  for (let at = start; at < end;) {
    const id = numberAt(bytes, at, true), size = numberAt(bytes, at + id.length, false)
    const body = at + id.length + size.length
    if (body > end || (size.value === null && !(root && id.value === IDS.segment))) throw new Error('Unsupported WebM unknown size')
    const stop = size.value === null ? end : body + size.value
    if (!Number.isSafeInteger(stop) || stop < body || stop > end) throw new Error('WebM element exceeds its parent')
    result.push({ id: id.value!, start: body, end: stop, size: stop - body })
    at = stop
  }
  return result
}
/** Input is never mutated; the returned buffer has exactly the same length. */
export function correctMuxedWebmDuration(buffer: ArrayBuffer, endUs: number): ArrayBuffer {
  if (!Number.isSafeInteger(endUs) || endUs <= 0) throw new Error('A positive actual chunk end is required')
  const bytes = new Uint8Array(buffer), root = elements(bytes, 0, bytes.length, true)
  if (root.length !== 2 || root[0].id !== IDS.ebml || root[1].id !== IDS.segment) throw new Error('Expected one finalized WebM segment')
  const info = elements(bytes, root[1].start, root[1].end).filter(e => e.id === IDS.info)
  if (info.length !== 1) throw new Error('Expected one WebM Info element')
  const fields = elements(bytes, info[0].start, info[0].end)
  const durations = fields.filter(e => e.id === IDS.duration), scales = fields.filter(e => e.id === IDS.scale)
  if (durations.length !== 1 || durations[0].size !== 8 || scales.length > 1) throw new Error('Expected one Float64 WebM Duration')
  let scale = 1_000_000
  if (scales.length) {
    if (scales[0].size < 1 || scales[0].size > 6) throw new Error('Invalid WebM timestamp scale')
    scale = 0
    for (let i = scales[0].start; i < scales[0].end; i++) scale = scale * 256 + bytes[i]
    if (!Number.isSafeInteger(scale) || scale <= 0) throw new Error('Invalid WebM timestamp scale')
  }
  const duration = durations[0], old = new DataView(buffer).getFloat64(duration.start)
  const next = endUs * 1000 / scale
  if (!Number.isFinite(old) || old < 0 || !Number.isFinite(next) || next < old) throw new Error('WebM duration must not shrink')
  const output = buffer.slice(0)
  new DataView(output).setFloat64(duration.start, next)
  return output
}
