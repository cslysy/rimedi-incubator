import { describe, expect, it } from "vitest";
import catalog from "../data/rpl-drugs.json";
import calculatorData from "../metadata/calculators.json";
import productIndicationData from "../metadata/productIndications.json";
import productMetadataData from "../metadata/productMetadata.json";
import routeData from "../metadata/routes.json";
import type {
  AdministrationRoute,
  CalculatorDefinition,
  DrugCatalog,
  ProductIndicationMetadata,
  ProductMetadata
} from "../types";
import { validateCatalog } from "../utils/catalogValidation";

describe("catalog validation", () => {
  it("akceptuje aktualne lokalne dane i metadane", () => {
    expect(
      validateCatalog({
        catalog: catalog as DrugCatalog,
        productIndications: productIndicationData as ProductIndicationMetadata[],
        productMetadata: productMetadataData as ProductMetadata[],
        routes: routeData as AdministrationRoute[],
        calculators: calculatorData as CalculatorDefinition[]
      })
    ).toEqual([]);
  });

  it("wykrywa metadane wskazujące nieznany preparat", () => {
    const errors = validateCatalog({
      catalog: { drugs: [] },
      productMetadata: [
        {
          productId: "brak",
          calculators: ["DOSE_TO_ML"],
          highRisk: false,
          sourceNote: "Dane testowe."
        }
      ],
      routes: routeData as AdministrationRoute[],
      calculators: calculatorData as CalculatorDefinition[]
    });

    expect(errors).toContain("Metadane wskazują nieznany preparat: brak.");
  });
});
