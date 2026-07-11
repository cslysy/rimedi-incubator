import type {
  AdministrationRoute,
  CalculatorDefinition,
  DrugCatalog,
  ProductIndicationMetadata,
  ProductMetadata
} from "../types";

export interface CatalogValidationInput {
  catalog: DrugCatalog;
  productMetadata: ProductMetadata[];
  productIndications?: ProductIndicationMetadata[];
  routes: AdministrationRoute[];
  calculators: CalculatorDefinition[];
}

export function validateCatalog({
  catalog,
  productIndications = [],
  productMetadata,
  routes,
  calculators
}: CatalogValidationInput): string[] {
  const errors: string[] = [];
  const productIds = new Set<string>();
  const routeCodes = new Set<string>(routes.map((route) => route.code));
  const calculatorCodes = new Set(calculators.map((calculator) => calculator.code));

  for (const drug of catalog.drugs) {
    if (drug.products.length === 0) {
      errors.push(`Lek ${drug.id} nie ma żadnego preparatu.`);
    }

    for (const product of drug.products) {
      if (product.drugId !== drug.id) {
        errors.push(`Preparat ${product.id} ma drugId=${product.drugId}, ale należy do ${drug.id}.`);
      }

      if (productIds.has(product.id)) {
        errors.push(`Zdublowane ID preparatu: ${product.id}.`);
      }

      productIds.add(product.id);

      for (const route of product.routes) {
        if (!routeCodes.has(route)) {
          errors.push(`Preparat ${product.id} używa nieznanej drogi podania: ${route}.`);
        }
      }
    }
  }

  for (const metadata of productMetadata) {
    if (!productIds.has(metadata.productId)) {
      errors.push(`Metadane wskazują nieznany preparat: ${metadata.productId}.`);
    }

    for (const calculator of metadata.calculators) {
      if (!calculatorCodes.has(calculator)) {
        errors.push(`Metadane ${metadata.productId} używają nieznanego kalkulatora: ${calculator}.`);
      }
    }

    if (metadata.routeCalculators) {
      for (const [route, routeCalculators] of Object.entries(metadata.routeCalculators)) {
        if (!routeCodes.has(route)) {
          errors.push(`Metadane ${metadata.productId} używają nieznanej drogi podania: ${route}.`);
        }

        for (const calculator of routeCalculators) {
          if (!calculatorCodes.has(calculator)) {
            errors.push(
              `Metadane ${metadata.productId}/${route} używają nieznanego kalkulatora: ${calculator}.`
            );
          }

          if (!metadata.calculators.includes(calculator)) {
            errors.push(
              `Kalkulator ${calculator} dla ${metadata.productId}/${route} nie występuje na liście ogólnej preparatu.`
            );
          }
        }
      }
    }
  }

  for (const indication of productIndications) {
    if (indication.productIds.length === 0) {
      errors.push(`Wskazania ${indication.tradeName} nie wskazują żadnego preparatu.`);
    }

    for (const productId of indication.productIds) {
      if (!productIds.has(productId)) {
        errors.push(`Wskazania ${indication.tradeName} wskazują nieznany preparat: ${productId}.`);
      }
    }

    if (indication.conditionTags.length === 0 || indication.indications.length === 0) {
      errors.push(`Wskazania ${indication.tradeName} nie zawierają opisu klinicznego.`);
    }

    if (!indication.sourceUrl || !indication.sourceSection || !indication.verifiedAt) {
      errors.push(`Wskazania ${indication.tradeName} nie mają pełnego źródła.`);
    }
  }

  return errors;
}
