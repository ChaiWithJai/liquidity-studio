import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { embedPenpotSvg } from "./penpot-svg-embed.js";

const id = "11111111-1111-4111-8111-111111111111";
const imageUrl = `http://localhost:39008/assets/by-file-media-id/${id}`;
const fontUrl = `http://localhost:39008/assets/by-id/${id}`;
const source = `<svg xmlns="http://www.w3.org/2000/svg"><style>@font-face {font-family: 'Mona Sans';font-style: normal;font-weight: 400;font-display: block;src: url(${fontUrl}) format('woff');}</style><image href="${imageUrl}" width="240" height="240"/><text x="80" y="581.5" style="font-family: &quot;Mona Sans&quot;; fill: rgb(1, 2, 3);">HUMAN ॐ &amp; text</text></svg>`;
const bytes = Buffer.from("original controlled bytes");
const sha256 = createHash("sha256").update(bytes).digest("hex");
const read = async ({ kind }) => ({
  bytes,
  sha256,
  contentType: kind === "font" ? "font/woff" : "image/png",
});

test("embeds exact authorized resources while preserving original editable text and attributes byte for byte", async () => {
  const input = Buffer.from(source);
  const result = await embedPenpotSvg(input, read);
  const expected = source
    .replace(imageUrl, `data:image/png;base64,${bytes.toString("base64")}`)
    .replace(fontUrl, `data:font/woff;base64,${bytes.toString("base64")}`);
  assert.equal(result.bytes.toString(), expected);
  assert.equal(input.toString(), source);
  assert.equal(result.resources.length, 2);
  assert.equal(result.decodedBytes, bytes.length * 2);
  assert.equal(
    (await embedPenpotSvg(input, read, result.resources)).bytes.toString(),
    expected,
  );
  await assert.rejects(
    embedPenpotSvg(input, read, [...result.resources].reverse()),
  );
});

test("rejects active, duplicate, malformed and unknown resource content before any resource read", async () => {
  let calls = 0;
  const forbidden = [
    source.replace("<image", "<script"),
    source.replace("<image", '<image onload="alert(1)"'),
    source.replace('width="240"', 'width="240" width="241"'),
    source.replace(imageUrl, "https://outside.invalid/image.png"),
    source.replace(imageUrl, `${imageUrl}?cache=1`),
    source.replace(
      "fill: rgb(1, 2, 3)",
      "fill: u\\72l(https://outside.invalid)",
    ),
    source.replace("fill: rgb(1, 2, 3)", "behavior: url(#known)"),
    source.replace(
      "<svg ",
      '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg ',
    ),
    source.replace(
      "font-display: block",
      "font-display: block; font-display: swap",
    ),
    source.replace("</svg>", ""),
    source.replace("</style>", "@import 'https://outside.invalid';</style>"),
  ];
  for (const value of forbidden)
    await assert.rejects(
      embedPenpotSvg(Buffer.from(value), async () => {
        calls++;
        return read({ kind: "image" });
      }),
    );
  assert.equal(calls, 0);
});

test("immutable bytes, MIME, decoded resource and final inventory limits fail closed", async () => {
  await assert.rejects(
    embedPenpotSvg(Buffer.from(source), async () => ({
      bytes,
      sha256: "0".repeat(64),
      contentType: "image/png",
    })),
  );
  await assert.rejects(
    embedPenpotSvg(Buffer.from(source), async () => ({
      bytes,
      sha256,
      contentType: "text/html",
    })),
  );
  await assert.rejects(
    embedPenpotSvg(Buffer.from(source), async () => {
      const large = Buffer.alloc(512 * 1024 + 1);
      return {
        bytes: large,
        sha256: createHash("sha256").update(large).digest("hex"),
        contentType: "image/png",
      };
    }),
  );
});
