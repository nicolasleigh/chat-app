import { useEffect, useRef } from "react";

export default function useWebsocket({ url }: { url: string }) {
  const ws = useRef<WebSocket>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log("WebSocket opened");
    };
    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return ws.current;
}
