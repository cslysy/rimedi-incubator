import { describe, expect, it } from "vitest";
import { drugRepository, DrugRepository } from "../services/DrugRepository";
import type { Drug } from "../types";

const sampleDrugs: Drug[] = [
  {
    id: "furosemid",
    name: "Furosemid",
    activeSubstance: "Furosemidum",
    products: [
      {
        id: "furosemid-amp",
        drugId: "furosemid",
        tradeName: "Furosemid Ampułka",
        activeSubstance: "Furosemidum",
        form: "ampułka",
        concentrationText: "20 mg / 2 ml",
        manufacturer: "Theramex Ireland Limited",
        routes: ["IV"],
        calculators: ["DOSE_TO_ML"],
        highRisk: false,
        sourceNote: "Dane demonstracyjne."
      }
    ]
  },
  {
    id: "enoksaparyna",
    name: "Enoksaparyna",
    activeSubstance: "Enoxaparinum natricum",
    products: [
      {
        id: "enoksaparyna-syringe",
        drugId: "enoksaparyna",
        tradeName: "Enoksaparyna Ampułkostrzykawka",
        activeSubstance: "Enoxaparinum natricum",
        form: "ampułkostrzykawka",
        concentrationText: "10000 j.m. / ml",
        routes: ["SC"],
        calculators: ["UNITS_TO_ML"],
        highRisk: true,
        sourceNote: "Dane demonstracyjne."
      }
    ]
  }
];

describe("DrugRepository", () => {
  it("wyszukuje lokalnie po nazwie bez polskich znaków", () => {
    const repository = new DrugRepository(sampleDrugs);

    expect(repository.searchDrugs("ampulka").map((drug) => drug.id)).toEqual(["furosemid"]);
  });

  it("wyszukuje po substancji czynnej", () => {
    const repository = new DrugRepository(sampleDrugs);

    expect(repository.searchDrugs("enoxa").map((drug) => drug.id)).toEqual(["enoksaparyna"]);
  });

  it("nie zwraca podpowiedzi dla jednego znaku", () => {
    const repository = new DrugRepository(sampleDrugs);

    expect(repository.searchDrugs("f")).toEqual([]);
  });

  it("nie wyszukuje po nazwie producenta ani innych metadanych produktu", () => {
    const repository = new DrugRepository(sampleDrugs);

    expect(repository.searchDrugs("relan")).toEqual([]);
  });

  it("składa dane produktu z metadanymi aplikacji", () => {
    const product = drugRepository.getProductById("rpl-product-100000014");

    expect(product?.tradeName).toBe("Zoledronic acid Fresenius Kabi");
    expect(product?.activeSubstance).toBe("Acidum zoledronicum");
  });

  it("filtruje kalkulatory zależnie od drogi podania", () => {
    const product = drugRepository.getProductById("rpl-product-100000014");

    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    const productCalculators = drugRepository
      .getCalculatorsForProduct(product, "IV")
      .map((calculator) => calculator.code);

    expect(productCalculators).toEqual([
      "DOSE_TO_ML",
      "MG_PER_KG_TO_ML",
      "MG_PER_KG_TO_MG",
      "ML_PER_HOUR",
      "DROPS_PER_MIN",
      "AMPULE_COUNT"
    ]);
  });
});

describe("RPL product metadata", () => {
  it("returns the manually assigned calculator for Apap", () => {
    const product = drugRepository.getProductById("rpl-product-100006494");

    expect(product).toBeDefined();
    if (!product) {
      return;
    }

    expect(
      drugRepository.getCalculatorsForProduct(product, "PO").map((calculator) => calculator.code)
    ).toEqual(["MG_PER_KG_TO_MG"]);
  });

  it("returns verified indications for Forxiga products", () => {
    const indications = drugRepository.getIndicationsForProduct("rpl-product-100279424");

    expect(indications?.tradeName).toBe("Forxiga");
    expect(indications?.conditionTags).toEqual([
      "cukrzyca typu 2",
      "objawowa przewlekła niewydolność serca",
      "przewlekła choroba nerek"
    ]);
  });

  it("returns verified indications for Captopril products", () => {
    const indications = drugRepository.getIndicationsForProduct("rpl-product-100201735");

    expect(indications?.activeSubstance).toBe("Captoprilum");
    expect(indications?.conditionTags).toContain("nadciśnienie tętnicze");
    expect(indications?.conditionTags).toContain("nefropatia cukrzycowa typu 1 z makroproteinurią");
  });
});
