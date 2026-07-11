import { SaxesParser } from "saxes";

const SUPPORTED_ROUTES = new Set(["IV", "IM", "SC", "PO", "SL", "PR", "INH", "TOP"]);

const ROUTE_CODES = new Map([
  ["dożylna", "IV"],
  ["domięśniowa", "IM"],
  ["podskórna", "SC"],
  ["doustna", "PO"],
  ["podjęzykowa", "SL"],
  ["doodbytnicza", "PR"],
  ["wziewna", "INH"],
  ["miejscowa", "TOP"],
  ["na skórę", "TOP"]
]);

function textAttribute(attributes, name) {
  const value = attributes[name];
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const match = normalized.match(/^-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : undefined;
}

function parseUnit(value) {
  const normalized = value.trim().toLowerCase().replace("mcg", "µg").replace("ug", "µg");
  const match = normalized.match(/(mg|µg|g)(?=$|[\s/])/);
  return match?.[1];
}

function parseConcentration(value) {
  const normalized = value.trim().toLowerCase().replace("mcg", "µg").replace("ug", "µg");
  const match = normalized.match(
    /^(\d+(?:[,.]\d+)?)\s*(mg|µg|g)\s*\/\s*(?:(\d+(?:[,.]\d+)?)\s*)?ml\b/
  );

  if (!match) {
    return undefined;
  }

  const amount = parseNumber(match[1]);
  const volume = match[3] ? parseNumber(match[3]) : 1;

  if (amount === undefined || volume === undefined || volume <= 0) {
    return undefined;
  }

  return {
    value: amount / volume,
    unit: match[2]
  };
}

function parseUnitsPerMl(value) {
  const normalized = value.trim().toLowerCase();
  const match = normalized.match(
    /^(\d[\d\s]*(?:[,.]\d+)?)\s*(?:j\.\s*m\.|jednost(?:ka|ki|ek))\s*(?:\([^)]*\))?\s*\/\s*(?:(\d+(?:[,.]\d+)?)\s*)?ml\b/
  );

  if (!match) {
    return undefined;
  }

  const units = parseNumber(match[1]);
  const volume = match[2] ? parseNumber(match[2]) : 1;

  return units !== undefined && volume !== undefined && volume > 0 ? units / volume : undefined;
}

function normalizeKey(value) {
  return value
    .toLocaleLowerCase("pl-PL")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function hashText(value) {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function createDrugId(activeSubstance) {
  const slug =
    normalizeKey(activeSubstance)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || "bez-substancji";

  return `rpl-drug-${slug}-${hashText(activeSubstance)}`;
}

function createProduct(attributes) {
  const rplId = textAttribute(attributes, "id");
  const tradeName = textAttribute(attributes, "nazwaProduktu");
  const activeSubstance =
    textAttribute(attributes, "nazwaPowszechnieStosowana") || "Brak nazwy substancji";
  const strengthText = textAttribute(attributes, "moc");
  const strengthValue = parseNumber(strengthText);
  const strengthUnit = parseUnit(strengthText);
  const concentration = parseConcentration(strengthText);
  const unitsPerMl = parseUnitsPerMl(strengthText);

  return {
    rplId,
    drugId: createDrugId(activeSubstance),
    product: {
      id: `rpl-product-${rplId}`,
      drugId: createDrugId(activeSubstance),
      tradeName,
      activeSubstance,
      form: textAttribute(attributes, "nazwaPostaciFarmaceutycznej"),
      ...(strengthValue !== undefined ? { strengthValue } : {}),
      ...(strengthUnit !== undefined ? { strengthUnit } : {}),
      concentrationText: strengthText || "Brak danych o mocy",
      ...(concentration !== undefined
        ? {
            concentrationPerMl: concentration.value,
            concentrationUnit: concentration.unit
          }
        : {}),
      ...(unitsPerMl !== undefined ? { unitsPerMl } : {}),
      manufacturer: textAttribute(attributes, "podmiotOdpowiedzialny"),
      routes: []
    },
    atcCode: "",
    firstSubstanceRead: false,
    packageIsActive: false,
    unknownRoutes: []
  };
}

function addConcentration(productState, attributes) {
  if (productState.firstSubstanceRead) {
    return;
  }

  productState.firstSubstanceRead = true;
  const amount = parseNumber(textAttribute(attributes, "iloscSubstancji"));
  const amountUnit = parseUnit(textAttribute(attributes, "jednostkaMiaryIlosciSubstancji"));
  const preparationAmount = parseNumber(textAttribute(attributes, "iloscPreparatu"));
  const preparationUnit = textAttribute(attributes, "jednostkaMiaryIlosciPreparatu").toLowerCase();

  if (
    amount !== undefined &&
    amountUnit !== undefined &&
    preparationAmount !== undefined &&
    preparationAmount > 0 &&
    preparationUnit === "ml"
  ) {
    productState.product.concentrationPerMl = amount / preparationAmount;
    productState.product.concentrationUnit = amountUnit;
  }
}

function addPackageVolume(productState, attributes) {
  if (!productState.packageIsActive || productState.product.packageVolumeMl !== undefined) {
    return;
  }

  const unit = textAttribute(attributes, "jednostkaPojemnosci").toLowerCase();
  const volume = parseNumber(textAttribute(attributes, "pojemnosc"));

  if (unit === "ml" && volume !== undefined && volume > 0) {
    productState.product.packageVolumeMl = volume;
  }
}

function finalizeCatalog(products) {
  const drugs = new Map();

  for (const state of products) {
    const existing = drugs.get(state.drugId);

    if (existing) {
      existing.products.push(state.product);
      continue;
    }

    drugs.set(state.drugId, {
      id: state.drugId,
      name: state.product.activeSubstance,
      activeSubstance: state.product.activeSubstance,
      products: [state.product]
    });
  }

  return {
    drugs: [...drugs.values()].sort((left, right) =>
      left.name.localeCompare(right.name, "pl-PL")
    )
  };
}

export async function parseRplXml(chunks) {
  const products = [];
  const unknownRoutes = new Set();
  let currentProduct;
  let currentTextElement = "";
  let currentText = "";
  let reportDate = "";

  const parser = new SaxesParser();

  parser.on("opentag", (node) => {
    if (node.name === "produktyLecznicze") {
      reportDate = textAttribute(node.attributes, "stanNaDzien");
      return;
    }

    if (node.name === "produktLeczniczy") {
      if (textAttribute(node.attributes, "rodzajPreparatu") === "ludzki") {
        currentProduct = createProduct(node.attributes);
      }
      return;
    }

    if (!currentProduct) {
      return;
    }

    if (node.name === "kodATC" && !currentProduct.atcCode) {
      currentTextElement = node.name;
      currentText = "";
    } else if (node.name === "drogaPodania") {
      const routeName = textAttribute(node.attributes, "drogaPodaniaNazwa").toLowerCase();
      const routeCode = ROUTE_CODES.get(routeName);

      if (routeCode && !currentProduct.product.routes.includes(routeCode)) {
        currentProduct.product.routes.push(routeCode);
      } else if (!routeCode && routeName) {
        currentProduct.unknownRoutes.push(routeName);
        unknownRoutes.add(routeName);
      }
    } else if (node.name === "substancjaCzynna") {
      addConcentration(currentProduct, node.attributes);
    } else if (node.name === "opakowanie") {
      currentProduct.packageIsActive = textAttribute(node.attributes, "skasowane") !== "TAK";
    } else if (node.name === "jednostkaOpakowania") {
      addPackageVolume(currentProduct, node.attributes);
    }
  });

  parser.on("text", (text) => {
    if (currentTextElement) {
      currentText += text;
    }
  });

  parser.on("closetag", (tag) => {
    if (tag.name === "kodATC" && currentProduct && currentTextElement === "kodATC") {
      currentProduct.atcCode = currentText.trim();
      currentTextElement = "";
      currentText = "";
      return;
    }

    if (tag.name === "opakowanie" && currentProduct) {
      currentProduct.packageIsActive = false;
      return;
    }

    if (tag.name === "produktLeczniczy" && currentProduct) {
      if (currentProduct.atcCode) {
        currentProduct.product.atcCode = currentProduct.atcCode;
      }

      if (currentProduct.rplId && currentProduct.product.tradeName) {
        products.push(currentProduct);
      }

      currentProduct = undefined;
    }
  });

  const decoder = new TextDecoder();

  for await (const chunk of chunks) {
    parser.write(typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true }));
  }

  parser.write(decoder.decode());
  parser.close();

  return {
    catalog: finalizeCatalog(products),
    reportDate,
    productCount: products.length,
    unknownRoutes: [...unknownRoutes].sort((left, right) => left.localeCompare(right, "pl-PL"))
  };
}

export function validateRplCatalog(catalog) {
  const errors = [];
  const drugIds = new Set();
  const productIds = new Set();

  if (!catalog || !Array.isArray(catalog.drugs)) {
    return ["Katalog RPL nie zawiera tablicy drugs."];
  }

  for (const drug of catalog.drugs) {
    if (!drug.id || !drug.name || !drug.activeSubstance || !Array.isArray(drug.products)) {
      errors.push("Katalog RPL zawiera niekompletny rekord leku.");
      continue;
    }

    if (drugIds.has(drug.id)) {
      errors.push(`Zdublowane ID leku RPL: ${drug.id}.`);
    }
    drugIds.add(drug.id);

    for (const product of drug.products) {
      if (!product.id || !product.tradeName || !product.form || !product.concentrationText) {
        errors.push(`Lek ${drug.id} zawiera niekompletny produkt.`);
      }

      if (product.drugId !== drug.id) {
        errors.push(`Produkt ${product.id} wskazuje błędny drugId.`);
      }

      if (productIds.has(product.id)) {
        errors.push(`Zdublowane ID produktu RPL: ${product.id}.`);
      }
      productIds.add(product.id);

      for (const route of product.routes ?? []) {
        if (!SUPPORTED_ROUTES.has(route)) {
          errors.push(`Produkt ${product.id} używa nieznanej drogi podania: ${route}.`);
        }
      }

      if ("calculators" in product || "highRisk" in product || "sourceNote" in product) {
        errors.push(`Produkt ${product.id} zawiera ręczne metadane aplikacji.`);
      }
    }
  }

  return errors;
}
