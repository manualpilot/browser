import { finder } from "@medv/finder";
import { Replayer } from "rrweb";

const WINDOW_MARGIN = 24;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

setTimeout(async () => {
  // noinspection InfiniteLoopJS
  while (true) {
    await delay(200);

    const playerFrame: HTMLIFrameElement = document.querySelector("#player iframe")!;
    if (!playerFrame) {
      continue;
    }

    const iter = playerFrame.contentDocument!.querySelectorAll("a[href]:not([href='#'])");

    if (iter.length > 0) {
      console.log("cleaning up anchors", iter.length);
    }

    iter.forEach((el) => {
      (el as HTMLAnchorElement).href = "#";
      (el as HTMLAnchorElement).target = "_self"
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {

  const browseElement = document.getElementById("browse") as HTMLButtonElement;
  const urlElement = document.getElementById("url") as HTMLInputElement;

  const player = new Replayer([], {
    root: document.getElementById("player")!,
    liveMode: true,
    mouseTail: false,
    logger: console,
  });

  player.enableInteract();
  player.startLive();

  browseElement.onclick = (ev) => {
    ev.preventDefault();

    browseElement.disabled = true;
    urlElement.disabled = true;

    const url = new URL(
      [
        document.location.protocol === "http:" ? "ws://" : "wss://",
        document.location.host,
        "/start-session"
      ].join("")
    );

    url.searchParams.set("url", urlElement.value);
    url.searchParams.set("width", (window.innerWidth - WINDOW_MARGIN).toString());
    url.searchParams.set("height", (window.innerHeight - WINDOW_MARGIN).toString());

    const ws = new WebSocket(url.toString());

    function send(_type: string, event: Record<string, any>) {
      ws.send(JSON.stringify({ type: _type, event }));
    }

    window.addEventListener("resize", () => {
      send("resize", {
        width: window.innerWidth - WINDOW_MARGIN,
        height: window.innerHeight - WINDOW_MARGIN,
      });
    });

    // TODO: do we need to remove event listeners
    const onPageLoad = () => {
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
    };

    ws.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "recording": {
          player.addEvent(data.event);
          break;
        }
        case "navigation": {
          urlElement.value = data.event.url;
          break;
        }
        case "loaded": {
          onPageLoad();
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
