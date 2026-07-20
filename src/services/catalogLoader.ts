import {
  installDrugCatalog,
  type RawDrugCatalog
} from "./DrugRepository";

export const SUPPORTED_CATALOG_SCHEMA_VERSION = 1;

export interface CatalogManifest {
  schemaVersion: number;
  catalogVersion: string;
  catalogUrl: string;
  sha256: string;
}

interface CatalogEnvelope extends RawDrugCatalog {
  schemaVersion: number;
  catalogVersion: string;
}

export interface LoadedCatalog {
  catalogVersion: string;
  drugCount: number;
}

let activeLoad: Promise<LoadedCatalog> | null = null;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export function validateCatalogManifest(value: unknown): CatalogManifest {
  if (!value || typeof value !== "object") {
    throw new Error("Manifest katalogu leków ma nieprawidłowy format.");
  }

  const manifest = value as Partial<CatalogManifest>;

  if (
    manifest.schemaVersion !== SUPPORTED_CATALOG_SCHEMA_VERSION ||
    !isNonEmptyString(manifest.catalogVersion) ||
    !isNonEmptyString(manifest.catalogUrl) ||
    !/^[a-f0-9]{64}$/i.test(manifest.sha256 ?? "")
  ) {
    throw new Error("Ta wersja katalogu leków nie jest obsługiwana przez aplikację.");
  }

  return manifest as CatalogManifest;
}

export function parseAndValidateCatalog(
  catalogText: string,
  manifest: CatalogManifest
): CatalogEnvelope {
  const catalog = JSON.parse(catalogText) as Partial<CatalogEnvelope>;

  if (
    catalog.schemaVersion !== SUPPORTED_CATALOG_SCHEMA_VERSION ||
    catalog.catalogVersion !== manifest.catalogVersion ||
    !Array.isArray(catalog.drugs)
  ) {
    throw new Error("Pobrany katalog leków jest niezgodny z aplikacją.");
  }

  return catalog as CatalogEnvelope;
}

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function notifyServiceWorker(catalogUrl: URL): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  void navigator.serviceWorker.ready.then((registration) => {
    registration.active?.postMessage({
      type: "RIMEDI_CATALOG_READY",
      catalogUrl: catalogUrl.href
    });
  });
}

async function fetchAndInstallCatalog(forceNetwork: boolean): Promise<LoadedCatalog> {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href);
  const manifestUrl = new URL("catalog/rpl-catalog-manifest.json", baseUrl);
  const manifestResponse = await fetch(manifestUrl, {
    cache: "no-store",
    headers: { Accept: "application/json" }
  });

  if (!manifestResponse.ok) {
    throw new Error("Nie udało się sprawdzić wersji bazy leków.");
  }

  const manifest = validateCatalogManifest(await manifestResponse.json());
  const catalogUrl = new URL(manifest.catalogUrl, manifestUrl);

  if (catalogUrl.origin !== window.location.origin || !catalogUrl.pathname.startsWith(baseUrl.pathname)) {
    throw new Error("Manifest wskazuje nieprawidłowy adres katalogu leków.");
  }

  const catalogResponse = await fetch(catalogUrl, {
    cache: forceNetwork ? "reload" : "default"
  });

  if (!catalogResponse.ok) {
    throw new Error("Nie udało się pobrać bazy leków.");
  }

  const catalogText = await catalogResponse.text();
  const actualHash = await sha256(catalogText);

  if (actualHash !== manifest.sha256.toLowerCase()) {
    throw new Error("Pobrana baza leków jest uszkodzona.");
  }

  const catalog = parseAndValidateCatalog(catalogText, manifest);

  // Repozytorium podmieniamy dopiero po pobraniu i pełnej walidacji katalogu.
  installDrugCatalog(catalog);
  notifyServiceWorker(catalogUrl);

  return {
    catalogVersion: catalog.catalogVersion,
    drugCount: catalog.drugs.length
  };
}

export function loadDrugCatalog(forceReload = false): Promise<LoadedCatalog> {
  if (forceReload) {
    activeLoad = null;
  }

  if (!activeLoad) {
    activeLoad = fetchAndInstallCatalog(forceReload).catch((error: unknown) => {
      activeLoad = null;
      throw error;
    });
  }

  return activeLoad;
}
