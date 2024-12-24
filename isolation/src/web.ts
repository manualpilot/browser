import { finder } from "@medv/finder";
import { Replayer } from "rrweb";

const WINDOW_MARGIN = 24;

document.addEventListener("DOMContentLoaded", () => {
  const player = new Replayer([], {
    root: document.getElementById("player")!,
    liveMode: true,
    mouseTail: false,
    logger: console,
  });

  player.enableInteract();
  player.startLive();

  document.getElementById("navigate")!.onclick = (ev) => {
    ev.preventDefault();

    const url = new URL(
      [
        document.location.protocol === "http:" ? "ws://" : "wss://",
        document.location.host,
        "/start-session"
      ].join("")
    );

    url.searchParams.set("url", (document.getElementById("url") as HTMLInputElement).value);
    url.searchParams.set("width", (window.innerWidth - WINDOW_MARGIN).toString());
    url.searchParams.set("height", (window.innerHeight - WINDOW_MARGIN).toString());

    const ws = new WebSocket(url.toString());

    function send(messageType: string, event: Record<string, any>) {
      ws.send(JSON.stringify({ type: messageType, event }));
    }

    window.addEventListener("resize", () => {
      send("resize", {
        width: window.innerWidth - WINDOW_MARGIN,
        height: window.innerHeight - WINDOW_MARGIN,
      });
    });

    // TODO: is there a better way? registering it at the start doesn't work
    //       also, if there's a navigation event inside the iframe, these stop working
    setTimeout(async () => {
      console.log("registering interaction handlers");
      const playerFrame: HTMLIFrameElement = document.querySelector("#player iframe")!;
      const frameDocument = playerFrame.contentDocument!

      frameDocument.addEventListener("click", (event) => {
        event.stopImmediatePropagation();
        event.stopPropagation();
        event.preventDefault();

        const element = event.target as HTMLElement;
        if (element.tagName in ["input", "textarea"]) {
          element.focus();
        }

        send("click", {
          selector: finder(element, { root: frameDocument.body }).replaceAll('"', "'"),
        });
      });

      frameDocument.addEventListener("input", (event) => {
        send("input", {
          selector: finder(event.target as HTMLElement, { root: frameDocument.body }).replaceAll('"', "'"),
          value: (event.target as HTMLInputElement).value,
        });
      });
    }, 3000);

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "recording": {
          player.addEvent(data.event);
          break;
        }
        default: {
          console.error("unhandled message", data);
          break;
        }
      }
    });
  };
});
