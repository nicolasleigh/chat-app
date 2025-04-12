let baseUrl = "http://localhost:8084";
let wsUrl = "ws://localhost:8084";

if (process.env.NODE_ENV === "production") {
  baseUrl = "https://back.chat.linze.pro";
  wsUrl = "wss://back.chat.linze.pro";
}

export { baseUrl, wsUrl };
