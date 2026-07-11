import { describe, expect, it } from "vitest";
import { LocalUserDataRepository } from "../services/LocalUserDataRepository";
import type { FavoriteProduct, RecentCalculation } from "../types";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

function createRecent(index: number): RecentCalculation {
  return {
    id: `recent-${index}`,
    productId: `product-${index}`,
    productName: `Produkt ${index}`,
    calculator: "DOSE_TO_ML",
    calculatorLabel: "Dawka → ml",
    resultValue: index,
    resultUnit: "ml",
    usedAt: `2026-07-08T20:0${index}:00.000Z`
  };
}

function createFavorite(productId: string): FavoriteProduct {
  return {
    productId,
    productName: "Produkt",
    activeSubstance: "Substancja",
    concentrationText: "10 mg / ml",
    addedAt: "2026-07-08T20:00:00.000Z"
  };
}

describe("LocalUserDataRepository", () => {
  it("ogranicza ostatnie obliczenia do pięciu wpisów", () => {
    const repository = new LocalUserDataRepository(new MemoryStorage());

    for (let index = 1; index <= 6; index += 1) {
      repository.addRecent(createRecent(index));
    }

    expect(repository.read().recent.map((item) => item.id)).toEqual([
      "recent-6",
      "recent-5",
      "recent-4",
      "recent-3",
      "recent-2"
    ]);
  });

  it("przenosi powtórzone ostatnie obliczenie na początek", () => {
    const repository = new LocalUserDataRepository(new MemoryStorage());

    repository.addRecent(createRecent(1));
    repository.addRecent(createRecent(2));
    repository.addRecent(createRecent(1));

    expect(repository.read().recent.map((item) => item.id)).toEqual(["recent-1", "recent-2"]);
  });

  it("dodaje i usuwa ulubiony preparat", () => {
    const repository = new LocalUserDataRepository(new MemoryStorage());
    const favorite = createFavorite("product-1");

    repository.toggleFavorite(favorite);
    expect(repository.isFavorite("product-1")).toBe(true);

    repository.toggleFavorite(favorite);
    expect(repository.isFavorite("product-1")).toBe(false);
  });
});
