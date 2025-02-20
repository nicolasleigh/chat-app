import { useEffect, useRef } from "react";

export default function useWebsocket({ url, token }: { url: string; token: string }) {
  const ws = useRef<WebSocket>(null);
  useEffect(() => {
    if (!token) {
      // If there's no valid token, don't create the WebSocket
      console.log("No token, WebSocket not initialized");
      return;
    }
    ws.current = new WebSocket(url, [token]);
    ws.current.onopen = () => {
      console.log("WebSocket opened");
    };
    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.current?.close();
    };
  }, [url, token]);

  return ws.current;
}
