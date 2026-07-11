import { createReadStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { parseRplXml, validateRplCatalog } from "./rplParser.mjs";

const DEFAULT_SOURCE =
  "https://rejestry.ezdrowie.gov.pl/api/rpl/medicinal-products/public-pl-report/6.0.0/overall.xml";
const DEFAULT_OUTPUT = "src/data/rpl-drugs.json";

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

async function openSource(source) {
  if (!source.startsWith("http://") && !source.startsWith("https://")) {
    return createReadStream(resolve(source));
  }

  const response = await fetch(source);
  if (!response.ok || !response.body) {
    throw new Error(`Nie udało się pobrać RPL: HTTP ${response.status}.`);
  }

  return response.body;
}

const source = readArgument("--input", DEFAULT_SOURCE);
const output = resolve(readArgument("--output", DEFAULT_OUTPUT));
const parsed = await parseRplXml(await openSource(source));
const errors = validateRplCatalog(parsed.catalog);

if (errors.length > 0) {
  throw new Error(`Walidacja RPL nie powiodła się:\n${errors.slice(0, 20).join("\n")}`);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(parsed.catalog)}\n`, "utf8");

console.log(`RPL na dzień: ${parsed.reportDate || "brak daty"}`);
console.log(`Zaimportowane produkty: ${parsed.productCount}`);
console.log(`Grupy leków: ${parsed.catalog.drugs.length}`);
console.log(`Nierozpoznane drogi podania: ${parsed.unknownRoutes.length}`);
console.log(`Zapisano: ${output}`);
