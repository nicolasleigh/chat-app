let baseUrl = "http://localhost:8084/api";
let wsUrl = "ws://localhost:8084/api";

if (process.env.NODE_ENV === "production") {
  baseUrl = "https://chat.linze.pro/api";
  wsUrl = "wss://chat.linze.pro/api";
}

export { baseUrl, wsUrl };
