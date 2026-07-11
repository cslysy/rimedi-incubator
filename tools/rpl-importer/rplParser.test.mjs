import { describe, expect, it } from "vitest";
import { parseRplXml, validateRplCatalog } from "./rplParser.mjs";

const XML = `<?xml version="1.0" encoding="UTF-8"?>
<produktyLecznicze stanNaDzien="2026-07-08">
  <produktLeczniczy id="100" rodzajPreparatu="ludzki" nazwaProduktu="Lek Testowy"
    nazwaPowszechnieStosowana="Substantia" moc="20 mg/2 ml"
    nazwaPostaciFarmaceutycznej="Roztwór do wstrzykiwań" podmiotOdpowiedzialny="Test S.A.">
    <kodyATC><kodATC>A01AA01</kodATC></kodyATC>
    <drogiPodania>
      <drogaPodania drogaPodaniaNazwa="dożylna"/>
      <drogaPodania drogaPodaniaNazwa="nieobsługiwana"/>
    </drogiPodania>
    <substancjeCzynne>
      <substancjaCzynna nazwaSubstancji="Substantia" iloscSubstancji="20"
        jednostkaMiaryIlosciSubstancji="mg" iloscPreparatu=""
        jednostkaMiaryIlosciPreparatu=""/>
    </substancjeCzynne>
    <opakowania>
      <opakowanie skasowane="NIE">
        <jednostkiOpakowania>
          <jednostkaOpakowania pojemnosc="2" jednostkaPojemnosci="ml"/>
        </jednostkiOpakowania>
      </opakowanie>
    </opakowania>
  </produktLeczniczy>
  <produktLeczniczy id="101" rodzajPreparatu="ludzki" nazwaProduktu="Lek Jednostkowy"
    nazwaPowszechnieStosowana="Unitas" moc="100 j.m./ml"
    nazwaPostaciFarmaceutycznej="Roztwór do wstrzykiwań" podmiotOdpowiedzialny="Test S.A.">
    <drogiPodania><drogaPodania drogaPodaniaNazwa="podskórna"/></drogiPodania>
  </produktLeczniczy>
  <produktLeczniczy id="200" rodzajPreparatu="weterynaryjny" nazwaProduktu="Pominięty"/>
</produktyLecznicze>`;

async function* xmlChunks() {
  yield XML.slice(0, 300);
  yield XML.slice(300);
}

describe("RPL importer", () => {
  it("maps the official XML fields to the local catalog", async () => {
    const result = await parseRplXml(xmlChunks());
    const product = result.catalog.drugs[0].products[0];

    expect(result.reportDate).toBe("2026-07-08");
    expect(result.productCount).toBe(2);
    expect(result.unknownRoutes).toEqual(["nieobsługiwana"]);
    expect(product).toMatchObject({
      id: "rpl-product-100",
      tradeName: "Lek Testowy",
      activeSubstance: "Substantia",
      strengthValue: 20,
      strengthUnit: "mg",
      concentrationPerMl: 10,
      concentrationUnit: "mg",
      packageVolumeMl: 2,
      atcCode: "A01AA01",
      routes: ["IV"]
    });
    expect(
      result.catalog.drugs
        .flatMap((drug) => drug.products)
        .find((candidate) => candidate.id === "rpl-product-101")
    ).toMatchObject({
      unitsPerMl: 100,
      routes: ["SC"]
    });
  });

  it("validates the generated catalog without adding application metadata", async () => {
    const result = await parseRplXml(xmlChunks());

    expect(validateRplCatalog(result.catalog)).toEqual([]);
    expect(result.catalog.drugs[0].products[0]).not.toHaveProperty("calculators");
  });
});
