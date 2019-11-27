import { Server } from "ws";
import { Subscription } from "../../index";

export const Port = 10000;

export function WSS(): Server {
  const wss = new Server({ port: Port });
  wss.on("connection", ws => {
    ws.on("message", (data: string) => {
      const { type, channels }: Subscription = JSON.parse(data);
      if (type === "subscribe") {
        ws.send(JSON.stringify({ type: "subscriptions", channels }));
      } else if (type === "unsubscribe") {
        ws.send(JSON.stringify({ type: "subscriptions", channels: [] }));
      }
    });
  });
  return wss;
}
