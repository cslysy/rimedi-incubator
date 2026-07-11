import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateRplCatalog } from "./rplParser.mjs";

const input = resolve(process.argv[2] ?? "src/data/rpl-drugs.json");
const catalog = JSON.parse(await readFile(input, "utf8"));
const errors = validateRplCatalog(catalog);

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Katalog RPL jest poprawny: ${catalog.drugs.length} grup leków.`);
}
