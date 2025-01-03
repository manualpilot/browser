import { contextBridge, ipcRenderer } from "electron";
import { record } from "rrweb";

window.addEventListener("DOMContentLoaded", async () => {
  const sessionId = await ipcRenderer.invoke("get-session-id") as string;
  console.log({ sessionId });

  record({
    // TODO: we have to record inside the iframe as well for this to work
    recordCrossOriginIframes: true,
    emit: (event) => ipcRenderer.invoke(sessionId, { type: "recording", event }),
  });
});

contextBridge.exposeInMainWorld("ipc", {
  // hack to get around having to inject a renderer to every page we navigate to
  handleInternalMessage: (data: string) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "click": {
        document.querySelector(message.event.selector).click();
        break;
      }

      case "input": {
        const element = document.querySelector(message.event.selector) as HTMLInputElement;
        element.value = message.event.value;
        element.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        break;
      }
    }
  },
});
