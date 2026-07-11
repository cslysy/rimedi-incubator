import type { FavoriteProduct, RecentCalculation } from "../types";
import { formatDateTime, formatNumber } from "../utils/format";

interface HomePageProps {
  recent: RecentCalculation[];
  favorites: FavoriteProduct[];
  onStart: () => void;
  onOpenRecent: (item: RecentCalculation) => void;
  onOpenFavorite: (item: FavoriteProduct) => void;
}

export function HomePage({ recent, favorites, onStart, onOpenRecent, onOpenFavorite }: HomePageProps) {
  return (
    <main className="pageShell">
      <section className="homeHero" aria-labelledby="home-title">
        <p className="appKicker">PWA offline</p>
        <h1 id="home-title">Rimedi</h1>
        <p>
          Lokalne obliczenia pomocnicze dla wartości wpisanych przez użytkownika i parametrów wybranego
          preparatu.
        </p>
        <button type="button" className="primaryButton" onClick={onStart}>
          Oblicz lek
        </button>
      </section>

      <section className="homeSection" aria-labelledby="recent-title">
        <h2 id="recent-title">Ostatnio używane</h2>
        {recent.length === 0 ? (
          <p className="emptyState">Brak ostatnich obliczeń.</p>
        ) : (
          <div className="resultList">
            {recent.map((item) => (
              <button key={item.id} type="button" className="listButton" onClick={() => onOpenRecent(item)}>
                <strong>
                  {formatNumber(item.resultValue)} {item.resultUnit} · {item.productName}
                </strong>
                <span>
                  {item.calculatorLabel}
                  {item.routeDisplay ? ` · ${item.routeDisplay}` : ""} · {formatDateTime(item.usedAt)}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="homeSection" aria-labelledby="favorites-title">
        <h2 id="favorites-title">Ulubione</h2>
        {favorites.length === 0 ? (
          <p className="emptyState">Brak ulubionych preparatów.</p>
        ) : (
          <div className="resultList">
            {favorites.map((item) => (
              <button
                key={item.productId}
                type="button"
                className="listButton"
                onClick={() => onOpenFavorite(item)}
              >
                <strong>{item.productName}</strong>
                <span>
                  {item.activeSubstance} · {item.concentrationText}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
