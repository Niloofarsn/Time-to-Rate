import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { StudiesProvider } from "./context/StudiesContext";
import { App } from "./App";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <StudiesProvider>
        <App />
      </StudiesProvider>
    </BrowserRouter>
  </StrictMode>,
);
