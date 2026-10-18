const button = document.querySelector("#apply");
const status = document.querySelector("#status");
const input = document.querySelector("#capability");
let active = null;
const send = (message) => parent.postMessage(message, "http://localhost:39008");
async function api(path, body) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${active.capability}`,
    },
    body: JSON.stringify(body),
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Native action rejected");
  return data;
}
button.addEventListener("click", () => {
  if (active) return;
  const capability = input.value.trim();
  input.value = "";
  if (!/^[\w-]{43}$/.test(capability)) {
    status.textContent = "Enter a valid current action capability.";
    return;
  }
  active = { capability };
  button.disabled = true;
  send({ type: "context" });
});
window.addEventListener("message", async (event) => {
  if (
    event.origin !== "http://localhost:39008" ||
    event.source !== parent ||
    !active
  )
    return;
  const message = event.data;
  try {
    if (message?.type === "context") {
      status.textContent =
        "Checking current Studio scope, source and native owner…";
      const intent = await api("/claim", {
        fileId: message.fileId,
        ownerPrincipal: message.ownerPrincipal,
      });
      active.intent = intent;
      send({ type: "apply", intent });
    } else if (message?.type === "applied" && active.intent) {
      status.textContent =
        active.intent.operation === "import-private-raster"
          ? "Image added; checking saved image and existing content…"
          : "Native action applied; verifying saved token values and bound paint…";
      let receipt;
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          receipt = await api("/acknowledge", {
            acknowledgement: active.intent.acknowledgement,
          });
          break;
        } catch (error) {
          if (attempt === 9) throw error;
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      status.textContent = `${receipt.status}. Native revision ${receipt.nativeRevision}. Screenshot/export review is still required.`;
      active = null;
      button.disabled = false;
    } else if (message?.type === "failed") throw new Error(message.error);
  } catch (error) {
    status.textContent = `Not accepted: ${error.message}`;
    active = null;
    button.disabled = false;
  }
});
