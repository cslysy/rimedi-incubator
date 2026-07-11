import type { FavoriteProduct, LocalUserData, RecentCalculation } from "../types";

const storageKey = "siostra-liczy:user-data";
const recentLimit = 5;

const emptyUserData: LocalUserData = {
  recent: [],
  favorites: []
};

interface LocalStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

function safeParse(value: string | null): LocalUserData {
  if (!value) {
    return emptyUserData;
  }

  try {
    const parsed = JSON.parse(value) as Partial<LocalUserData>;

    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : []
    };
  } catch {
    return emptyUserData;
  }
}

export class LocalUserDataRepository {
  private readonly storage?: LocalStorageLike;

  public constructor(storage?: LocalStorageLike) {
    this.storage = storage;
  }

  private getStorage(): LocalStorageLike | undefined {
    if (this.storage) {
      return this.storage;
    }

    if (typeof window === "undefined" || window.localStorage === undefined) {
      return undefined;
    }

    return window.localStorage;
  }

  public read(): LocalUserData {
    const storage = this.getStorage();

    if (!storage) {
      return emptyUserData;
    }

    return safeParse(storage.getItem(storageKey));
  }

  public write(data: LocalUserData): void {
    const storage = this.getStorage();

    if (!storage) {
      return;
    }

    storage.setItem(storageKey, JSON.stringify(data));
  }

  public addRecent(calculation: RecentCalculation): LocalUserData {
    const currentData = this.read();
    const recent = [
      calculation,
      ...currentData.recent.filter((item) => item.id !== calculation.id)
    ].slice(0, recentLimit);
    const nextData = { ...currentData, recent };
    this.write(nextData);

    return nextData;
  }

  public toggleFavorite(product: FavoriteProduct): LocalUserData {
    const currentData = this.read();
    const isAlreadyFavorite = currentData.favorites.some((item) => item.productId === product.productId);
    const favorites = isAlreadyFavorite
      ? currentData.favorites.filter((item) => item.productId !== product.productId)
      : [product, ...currentData.favorites];
    const nextData = { ...currentData, favorites };
    this.write(nextData);

    return nextData;
  }

  public isFavorite(productId: string): boolean {
    return this.read().favorites.some((item) => item.productId === productId);
  }
}

export const localUserDataRepository = new LocalUserDataRepository();
