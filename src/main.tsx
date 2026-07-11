import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);
const requiresOnlineAvailability = import.meta.env.VITE_DISTRIBUTION !== "app-store";

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

async function removeOfflineCopies(): Promise<void> {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    const applicationScope = new URL(import.meta.env.BASE_URL, window.location.href).href;
    await Promise.all(
      registrations
        .filter((registration) => registration.scope === applicationScope)
        .map((registration) => registration.unregister())
    );
  }

  if ("caches" in window) {
    const cacheNames = await window.caches.keys().catch(() => []);
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("rimedi-"))
        .map((cacheName) => window.caches.delete(cacheName))
    );
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
    await removeOfflineCopies();

    if (!(await isTestVersionAvailable())) {
      root.render(<AvailabilityScreen />);
      return;
    }
  }

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

void startApplication();
