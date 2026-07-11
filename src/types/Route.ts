export type AdministrationRouteCode =
  | "IV"
  | "IM"
  | "SC"
  | "PO"
  | "SL"
  | "PR"
  | "INH"
  | "TOP";

export interface AdministrationRoute {
  code: AdministrationRouteCode;
  label: string;
  display: string;
}
