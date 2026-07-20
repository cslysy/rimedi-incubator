import { describe, expect, it } from "vitest";
import {
  parseAndValidateCatalog,
  validateCatalogManifest,
  type CatalogManifest
} from "../services/catalogLoader";

const manifest: CatalogManifest = {
  schemaVersion: 1,
  catalogVersion: "catalog-v1",
  catalogUrl: "rpl-drugs.1234567890abcdef.json",
  sha256: "a".repeat(64)
};

describe("catalog version validation", () => {
  it("accepts a supported manifest and matching catalog", () => {
    expect(validateCatalogManifest(manifest)).toEqual(manifest);
    expect(
      parseAndValidateCatalog(
        JSON.stringify({ schemaVersion: 1, catalogVersion: "catalog-v1", drugs: [] }),
        manifest
      ).drugs
    ).toEqual([]);
  });

  it("rejects an unsupported schema before installing the catalog", () => {
    expect(() =>
      validateCatalogManifest({ ...manifest, schemaVersion: 2 })
    ).toThrow(/nie jest obsługiwana/);

    expect(() =>
      parseAndValidateCatalog(
        JSON.stringify({ schemaVersion: 2, catalogVersion: "catalog-v1", drugs: [] }),
        manifest
      )
    ).toThrow(/niezgodny/);
  });

  it("rejects a catalog whose version differs from the manifest", () => {
    expect(() =>
      parseAndValidateCatalog(
        JSON.stringify({ schemaVersion: 1, catalogVersion: "catalog-v0", drugs: [] }),
        manifest
      )
    ).toThrow(/niezgodny/);
  });
});
