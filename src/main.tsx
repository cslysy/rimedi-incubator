import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const requiresOnlineAvailability = import.meta.env.VITE_DISTRIBUTION !== "app-store";

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

interface AvailabilityScreenProps {
  checking?: boolean;
}

function AvailabilityScreen({ checking = false }: AvailabilityScreenProps) {
  if (checking) {
    return (
      <main className="startupSplash" aria-label="Uruchamianie Rimedi">
        <strong className="startupLogo">Rimedi</strong>
        <span className="startupTagline">Leki bez tajemnic</span>
        <span className="startupLoader" aria-hidden="true" />
      </main>
    );
  }

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
}

let availabilityCheckSequence = 0;

async function enforceTestAvailability(): Promise<void> {
  const checkSequence = ++availabilityCheckSequence;

  if (!navigator.onLine) {
    root.render(<AvailabilityScreen />);
    return;
  }

  root.render(<AvailabilityScreen checking />);

  const isAvailable = await isTestVersionAvailable();

  if (checkSequence !== availabilityCheckSequence) {
    return;
  }

  if (isAvailable) {
    registerOfflineShell();
    renderApplication();
  } else {
    root.render(<AvailabilityScreen />);
  }
}

function blockUnavailableApplication(): void {
  availabilityCheckSequence += 1;
  root.render(<AvailabilityScreen />);
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
