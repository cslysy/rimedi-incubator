import type { AdministrationRoute, AdministrationRouteCode } from "../types";

interface RouteSelectorProps {
  routes: AdministrationRoute[];
  onSelect: (route: AdministrationRouteCode) => void;
}

const routeEmoji: Record<AdministrationRouteCode, string> = {
  IV: "💧",
  IM: "💉",
  SC: "💉",
  PO: "💊",
  SL: "👅",
  PR: "🔽",
  INH: "🌬️",
  TOP: "🩹"
};

export function RouteSelector({ routes, onSelect }: RouteSelectorProps) {
  return (
    <section className="screenBlock" aria-labelledby="route-selector-title">
      <p className="stepLabel">Krok 3 z 5</p>
      <h2 id="route-selector-title">Wybierz drogę podania</h2>
      <div className="resultList">
        {routes.map((route) => (
          <button key={route.code} type="button" className="listButton" onClick={() => onSelect(route.code)}>
            <strong className="routeLabel">
              <span className="routeEmoji" aria-hidden="true">
                {routeEmoji[route.code]}
              </span>
              {route.display}
            </strong>
          </button>
        ))}
      </div>
    </section>
  );
}
