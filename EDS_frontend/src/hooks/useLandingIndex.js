import { useEffect, useState } from "react";
import { getLandingIndex, LANDING_FALLBACK } from "../services/landingService";

/**
 * Loads public landing-page data once on mount.
 *
 * The landing page is the first thing an unauthenticated visitor sees, so a
 * failed request must never blank the hero: on error we keep the fallback
 * shape and let the UI degrade to its static copy.
 *
 * @returns {{data: {totals: object, samples: array}, loading: boolean, failed: boolean}}
 */
export const useLandingIndex = () => {
  const [data, setData] = useState(LANDING_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Guards against setting state after the user navigates away mid-flight.
    let active = true;

    getLandingIndex()
      .then((res) => {
        if (!active) return;
        const payload = res?.data ?? {};
        setData({
          totals: payload.totals ?? LANDING_FALLBACK.totals,
          samples: Array.isArray(payload.samples) ? payload.samples : [],
        });
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, failed };
};

export default useLandingIndex;
