import * as console from "node:console";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import * as path from "node:path";
import { URL } from "node:url";

import { app, BrowserWindow, ipcMain } from "electron";
import serveHandler from "serve-handler";
import { WebSocketServer } from "ws";

app.whenReady().then(async () => {
  const sessions: Record<number, string> = {};
  const ws = new WebSocketServer({ noServer: true });
  const server = createServer((request, response) => {
    const url = new URL(request.url!, "https://localhost");
    if (url.pathname !== "/start-session") {
      serveHandler(request, response, {
        public: "dist",
      });
    }
  });

  ipcMain.handle("get-session-id", (event) => {
    return sessions[event.sender.id];
  });
  
  server.on("upgrade", function (request, socket, head) {
    const url = new URL(request.url!, "https://localhost");
    if (url.pathname === "/start-session") {
      ws.handleUpgrade(request, socket, head, (client) => {
        ws.emit("connection", client, request);
      });
    }
  });

  ws.on("connection", (socket, request) => {
    const sessionId = randomUUID();
    const url = new URL(request.url!, "https://localhost");
    const target = url.searchParams.get("url");
    const initialWidth = parseInt(url.searchParams.get("width")!);
    const initialHeight = parseInt(url.searchParams.get("height")!);

    console.log("new session", { sessionId });

    const window = new BrowserWindow({
      width: initialWidth,
      height: initialHeight,
      darkTheme: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        partition: sessionId,
      },
    });

    sessions[window.id] = sessionId;

    setTimeout(async () => {
      await window.loadURL(target!);
    });

    ipcMain.handle(sessionId, (_, payload) => {
      socket.send(JSON.stringify(payload));
    });

    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case "resize": {
          console.log("resizing window", message.event);
          window.setSize(message.event.width, message.event.height);
          break;
        }
        case "click": {
          window.webContents.executeJavaScript("ipc.handleInternalMessage(`" + JSON.stringify(message) + "`)");
          break;
        }
        case "input": {
          window.webContents.executeJavaScript("ipc.handleInternalMessage(`" + JSON.stringify(message) + "`)");
          break;
        }
        default: {
          console.error("unhandled message", message);
          break;
        }
      }
    });

    socket.on("close", (code, reason) => {
      console.log("session closed", sessionId, code, reason.toString());
      ipcMain.removeHandler(sessionId);
      delete sessions[window.id];
      window.close();
    });
  });

  server.listen(8080, () => {
    console.log("server listening");
  });
});

app.on("window-all-closed", () => {
  console.log("window-all-closed");
  // app.quit();
})
