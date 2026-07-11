import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("root") as HTMLElement;
const root = createRoot(rootElement);
const requiresOnlineAvailability = import.meta.env.VITE_DISTRIBUTION !== "app-store";
const startupStartedAt = window.performance.now();
let startupDismissalStarted = false;

function dismissStartupSplash(): void {
  if (startupDismissalStarted) {
    return;
  }

  startupDismissalStarted = true;
  const splash = document.getElementById("startup-splash");
  const remainingDisplayTime = Math.max(0, 650 - (window.performance.now() - startupStartedAt));

  window.setTimeout(() => {
    window.requestAnimationFrame(() => {
      rootElement.classList.add("appEntering");
      splash?.classList.add("isLeaving");

      window.setTimeout(() => {
        splash?.remove();
        rootElement.classList.remove("appEntering");
      }, 430);
    });
  }, remainingDisplayTime);
}

function updateVisualViewportPosition(): void {
  const viewport = window.visualViewport;
  const offsetTop = viewport?.offsetTop ?? 0;
  const obscuredBottom = viewport
    ? Math.max(0, window.innerHeight - viewport.offsetTop - viewport.height)
    : 0;

  document.documentElement.style.setProperty("--visual-viewport-top", `${offsetTop}px`);
  document.documentElement.style.setProperty("--visual-viewport-bottom", `${obscuredBottom}px`);
}

updateVisualViewportPosition();
window.visualViewport?.addEventListener("resize", updateVisualViewportPosition, { passive: true });
window.visualViewport?.addEventListener("scroll", updateVisualViewportPosition, { passive: true });
window.addEventListener("resize", updateVisualViewportPosition, { passive: true });

function AvailabilityScreen() {
  return (
    <main className="availabilityScreen">
      <h1>Rimedi</h1>
      <p>Wersja testowa jest obecnie niedostępna.</p>
      <button type="button" onClick={() => window.location.reload()}>
        Spróbuj ponownie
      </button>
    </main>
  );
}

let offlineShellRegistrationStarted = false;

function registerOfflineShell(): void {
  if (!offlineShellRegistrationStarted && "serviceWorker" in navigator && import.meta.env.PROD) {
    offlineShellRegistrationStarted = true;
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js?v=online-gated-1`)
      .catch(() => undefined);
  }
}

async function isTestVersionAvailable(): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}availability.json?t=${Date.now()}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );

    if (!response.ok) {
      return false;
    }

    const availability = (await response.json()) as { enabled?: unknown };
    return availability.enabled === true;
  } catch {
    return false;
  }
}

function renderApplication(): void {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  dismissStartupSplash();
}

let availabilityCheckSequence = 0;

async function enforceTestAvailability(): Promise<void> {
  const checkSequence = ++availabilityCheckSequence;

  if (!navigator.onLine) {
    root.render(<AvailabilityScreen />);
    dismissStartupSplash();
    return;
  }

  const isAvailable = await isTestVersionAvailable();

  if (checkSequence !== availabilityCheckSequence) {
    return;
  }

  if (isAvailable) {
    registerOfflineShell();
    renderApplication();
  } else {
    root.render(<AvailabilityScreen />);
    dismissStartupSplash();
  }
}

function blockUnavailableApplication(): void {
  availabilityCheckSequence += 1;
  root.render(<AvailabilityScreen />);
  dismissStartupSplash();
}

if (requiresOnlineAvailability) {
  window.addEventListener("offline", blockUnavailableApplication);
  window.addEventListener("online", () => void enforceTestAvailability());
  window.addEventListener("pageshow", () => void enforceTestAvailability());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void enforceTestAvailability();
    }
  });
  void enforceTestAvailability();
} else {
  renderApplication();
}
