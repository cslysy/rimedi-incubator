export interface ProductIndicationMetadata {
  productIds: string[];
  tradeName: string;
  activeSubstance: string;
  conditionTags: string[];
  indications: string[];
  sourceTitle: string;
  sourceUrl: string;
  sourceSection: string;
  sourceUpdatedAt?: string;
  verifiedAt: string;
  note?: string;
}

export type ProductIndication = Omit<ProductIndicationMetadata, "productIds">;
