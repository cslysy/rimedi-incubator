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
  return (
    <main className="availabilityScreen">
      <h1>Rimedi</h1>
      <p>
        {checking
          ? "Sprawdzanie dostępności wersji testowej…"
          : "Wersja testowa jest obecnie niedostępna."}
      </p>
      {!checking && (
        <button type="button" onClick={() => window.location.reload()}>
          Spróbuj ponownie
        </button>
      )}
    </main>
  );
}

function registerOfflineShell(): void {
  if ("serviceWorker" in navigator && import.meta.env.PROD) {
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

async function startApplication(): Promise<void> {
  if (requiresOnlineAvailability) {
    root.render(<AvailabilityScreen checking />);

    if (!(await isTestVersionAvailable())) {
      root.render(<AvailabilityScreen />);
      return;
    }

    registerOfflineShell();
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void startApplication();
