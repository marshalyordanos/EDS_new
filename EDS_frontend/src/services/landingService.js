import { publicApiClient } from "../api/axios";

/**
 * Public landing-page data. Unauthenticated by design — the backend returns
 * aggregate counts plus anonymised teaser rows (no names, emails or CVs).
 * See PublicLandingIndexView in Expert_Registration/views.py.
 */
export const getLandingIndex = () =>
  publicApiClient.get("/api/v1/public/landing-index/");

/** Fallbacks shown when the API is unreachable, so the hero never renders empty. */
export const LANDING_FALLBACK = {
  totals: { experts: 0, countries: 0, sectors: 0 },
  samples: [],
};
