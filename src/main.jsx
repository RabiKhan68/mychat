import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ✅ Register Firebase Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then((registration) => {
      console.log("✅ Service Worker registered:", registration.scope);
    })
    .catch((err) => {
      console.error("❌ Service Worker registration failed:", err);
    });
}

// ✅ PWA Install Prompt
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  // Prevent duplicate buttons
  if (document.querySelector(".install-btn")) return;

  const installBtn = document.createElement("button");
  installBtn.textContent = "📥 Download App";
  installBtn.className = "install-btn";
  document.body.appendChild(installBtn);

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      console.log("✅ App installed successfully");
    } else {
      console.log("❌ App installation dismissed");
    }

    deferredPrompt = null;
    installBtn.remove();
  });
});

// ✅ Mount React App
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
