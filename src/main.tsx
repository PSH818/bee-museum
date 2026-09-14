import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
// 自托管字体(Fontsource,OFL 1.1):国内可达、不向 Google 发请求
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-serif-sc/600.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
