import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCHEMA_VERSION = 1;
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const sourcePath = join(projectRoot, "src/data/rpl-drugs.json");
const outputDirectory = join(projectRoot, "public/catalog");
const manifestPath = join(outputDirectory, "rpl-catalog-manifest.json");

const sourceText = await readFile(sourcePath, "utf8");
const sourceCatalog = JSON.parse(sourceText);

if (!sourceCatalog || !Array.isArray(sourceCatalog.drugs)) {
  throw new Error("Katalog RPL nie zawiera tablicy drugs.");
}

const sourceHash = createHash("sha256").update(sourceText).digest("hex");
const catalogVersion = sourceHash.slice(0, 16);
const catalogEnvelope = JSON.stringify({
  schemaVersion: SCHEMA_VERSION,
  catalogVersion,
  drugs: sourceCatalog.drugs
});
const catalogHash = createHash("sha256").update(catalogEnvelope).digest("hex");
const catalogFileName = `rpl-drugs.${catalogHash.slice(0, 16)}.json`;
const catalogPath = join(outputDirectory, catalogFileName);

await mkdir(outputDirectory, { recursive: true });

for (const fileName of await readdir(outputDirectory)) {
  if (/^rpl-drugs\.[a-f0-9]+\.json$/.test(fileName) && fileName !== catalogFileName) {
    await unlink(join(outputDirectory, fileName));
  }
}

await writeFile(catalogPath, catalogEnvelope, "utf8");
await writeFile(
  manifestPath,
  `${JSON.stringify(
    {
      schemaVersion: SCHEMA_VERSION,
      catalogVersion,
      catalogUrl: catalogFileName,
      sha256: catalogHash
    },
    null,
    2
  )}\n`,
  "utf8"
);

console.log(`Wygenerowano katalog ${catalogFileName}.`);
