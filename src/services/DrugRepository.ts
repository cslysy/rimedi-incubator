import calculatorData from "../metadata/calculators.json";
import productIndicationData from "../metadata/productIndications.json";
import productMetadataData from "../metadata/productMetadata.json";
import routeData from "../metadata/routes.json";
import type {
  AdministrationRoute,
  AdministrationRouteCode,
  CalculatorDefinition,
  CalculatorType,
  Drug,
  DrugCatalog,
  DrugProduct,
  ProductIndication,
  ProductIndicationMetadata,
  ProductMetadata
} from "../types";
import { getCompatibleCalculatorCodes } from "../utils/calculatorCompatibility";
import { normalizeSearchText } from "../utils/search";

export type RawDrugProduct = Omit<
  DrugProduct,
  "calculators" | "highRisk" | "sourceNote" | "updatedAt" | "therapeuticIndications"
> &
  Partial<
    Pick<DrugProduct, "calculators" | "highRisk" | "sourceNote" | "updatedAt" | "therapeuticIndications">
  >;

export interface RawDrug extends Omit<Drug, "products"> {
  products: RawDrugProduct[];
}

export interface RawDrugCatalog {
  drugs: RawDrug[];
}

const calculators = calculatorData as CalculatorDefinition[];
const productIndications = productIndicationData as ProductIndicationMetadata[];
const productMetadata = productMetadataData as ProductMetadata[];
const routes = routeData as AdministrationRoute[];

interface DrugSearchIndexEntry {
  drug: Drug;
  searchText: string;
}

function buildSearchText(drug: Drug): string {
  return normalizeSearchText(
    [
      drug.name,
      drug.activeSubstance,
      ...drug.products.flatMap((product) => [
        product.tradeName,
        product.activeSubstance
      ])
    ].join(" ")
  );
}

function resolveProductMetadata(product: RawDrugProduct): ProductMetadata {
  const metadata = productMetadata.find((item) => item.productId === product.id);

  return {
    productId: product.id,
    calculators: product.calculators ?? metadata?.calculators ?? [],
    highRisk: product.highRisk ?? metadata?.highRisk ?? false,
    sourceNote: product.sourceNote ?? metadata?.sourceNote ?? "Dane lokalne.",
    updatedAt: product.updatedAt ?? metadata?.updatedAt
  };
}

function getProductMetadata(productId: string): ProductMetadata | undefined {
  return productMetadata.find((item) => item.productId === productId);
}

function getProductIndications(productId: string): ProductIndication | undefined {
  const indication = productIndications.find((item) => item.productIds.includes(productId));

  if (!indication) {
    return undefined;
  }

  const { productIds: _productIds, ...publicIndication } = indication;
  return publicIndication;
}

export function hydrateDrugCatalog(rawCatalog: RawDrugCatalog): Drug[] {
  return rawCatalog.drugs.map((drug) => ({
    ...drug,
    products: drug.products.map((product) => {
      const metadata = resolveProductMetadata(product);

      return {
        ...product,
        calculators: metadata.calculators,
        highRisk: metadata.highRisk,
        sourceNote: metadata.sourceNote,
        updatedAt: metadata.updatedAt,
        therapeuticIndications: product.therapeuticIndications ?? getProductIndications(product.id)
      };
    })
  }));
}

export class DrugRepository {
  private readonly drugs: Drug[];
  private readonly searchIndex: DrugSearchIndexEntry[];

  public constructor(drugs: Drug[] = []) {
    this.drugs = drugs;
    this.searchIndex = drugs.map((drug) => ({
      drug,
      searchText: buildSearchText(drug)
    }));
  }

  public getAllDrugs(): Drug[] {
    return this.drugs;
  }

  public searchDrugs(query: string): Drug[] {
    const normalizedQuery = normalizeSearchText(query);

    if (normalizedQuery.length < 2) {
      return [];
    }

    return this.searchIndex
      .filter((entry) => entry.searchText.includes(normalizedQuery))
      .map((entry) => entry.drug);
  }

  public getProductsForDrug(drugId: string): DrugProduct[] {
    return this.drugs.find((drug) => drug.id === drugId)?.products ?? [];
  }

  public getProductById(productId: string): DrugProduct | undefined {
    for (const drug of this.drugs) {
      const product = drug.products.find((candidate) => candidate.id === productId);

      if (product) {
        return product;
      }
    }

    return undefined;
  }

  public getRoutesForProduct(product: DrugProduct): AdministrationRoute[] {
    return product.routes
      .map((routeCode) => routes.find((route) => route.code === routeCode))
      .filter((route): route is AdministrationRoute => route !== undefined);
  }

  public getCalculatorsForProduct(
    product: DrugProduct,
    selectedRoute?: AdministrationRouteCode
  ): CalculatorDefinition[] {
    const routeAllowed = selectedRoute === undefined || product.routes.includes(selectedRoute);

    if (!routeAllowed) {
      return [];
    }

    const metadata = getProductMetadata(product.id);
    const routeCalculators =
      selectedRoute !== undefined ? metadata?.routeCalculators?.[selectedRoute] : undefined;
    const calculatorCodes =
      routeCalculators ??
      (metadata ? product.calculators : getCompatibleCalculatorCodes(product, selectedRoute));

    return calculatorCodes
      .map((calculatorCode) => calculators.find((calculator) => calculator.code === calculatorCode))
      .filter((calculator): calculator is CalculatorDefinition => calculator !== undefined);
  }

  public getCalculatorDefinition(code: CalculatorType): CalculatorDefinition | undefined {
    return calculators.find((calculator) => calculator.code === code);
  }

  public getRouteDefinition(code: AdministrationRouteCode): AdministrationRoute | undefined {
    return routes.find((route) => route.code === code);
  }

  public getIndicationsForProduct(productId: string): ProductIndication | undefined {
    return this.getProductById(productId)?.therapeuticIndications;
  }
}

export let drugRepository = new DrugRepository();

export function createDrugRepositoryFromCatalog(rawCatalog: RawDrugCatalog): DrugRepository {
  return new DrugRepository(hydrateDrugCatalog(rawCatalog));
}

export function installDrugCatalog(rawCatalog: RawDrugCatalog): DrugRepository {
  const nextRepository = createDrugRepositoryFromCatalog(rawCatalog);
  drugRepository = nextRepository;
  return nextRepository;
}
