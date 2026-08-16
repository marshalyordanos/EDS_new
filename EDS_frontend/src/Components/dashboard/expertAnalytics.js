/**
 * Analytics derivations for the dashboard home pages.
 *
 * These are pure functions over an already-fetched expert list. The home
 * pages load that list anyway, so folding analytics in costs no extra
 * requests — the previous /dashboard/analytics page issued one request per
 * expert to build its work-vs-certification chart, which did not scale.
 */

const TOP_N = 8;

/** Sorted [key, count] pairs from a tally, capped to the top N. */
const topEntries = (tally, limit = TOP_N) =>
  Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

/** key_words may arrive as an array or a comma-joined string. */
const keywordsOf = (expert) => {
  const raw = expert.key_words;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  return list.map((k) => k.trim()).filter(Boolean);
};

/** Cumulative registrations per month, oldest first. */
export const growthOverTime = (experts) => {
  const monthly = {};
  experts.forEach((expert) => {
    if (!expert.created_at) return;
    const date = new Date(expert.created_at);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });

  let cumulative = 0;
  return Object.keys(monthly)
    .sort()
    .map((month) => {
      cumulative += monthly[month];
      return {
        label: new Date(`${month}-01`).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        count: cumulative,
      };
    });
};

export const expertsByCountry = (experts) => {
  const tally = {};
  experts.forEach((e) => {
    if (e.country) tally[e.country] = (tally[e.country] || 0) + 1;
  });
  return topEntries(tally).map(([label, count]) => ({ label, count }));
};

export const expertiseDistribution = (experts) => {
  const tally = {};
  experts.forEach((expert) => {
    keywordsOf(expert).forEach((kw) => {
      tally[kw] = (tally[kw] || 0) + 1;
    });
  });
  return topEntries(tally).map(([label, count]) => ({ label, count }));
};

/** Seniority bands — the same buckets the old analytics page used. */
export const experienceBands = (experts) => {
  const buckets = { "0–2 yrs": 0, "3–5 yrs": 0, "6–10 yrs": 0, "10+ yrs": 0 };
  experts.forEach((expert) => {
    const years = expert.year_of_experience || 0;
    if (years <= 2) buckets["0–2 yrs"] += 1;
    else if (years <= 5) buckets["3–5 yrs"] += 1;
    else if (years <= 10) buckets["6–10 yrs"] += 1;
    else buckets["10+ yrs"] += 1;
  });
  return Object.entries(buckets).map(([label, count]) => ({ label, count }));
};

export const languageSplit = (experts) => {
  const tally = {};
  experts.forEach((e) => {
    if (e.cv_language) tally[e.cv_language] = (tally[e.cv_language] || 0) + 1;
  });
  return topEntries(tally, 6).map(([label, count]) => ({ label, count }));
};

/**
 * Headline figures.
 * `scope` reads "system" for admins and "portfolio" for company users, so the
 * same component can label itself correctly for either role.
 */
export const summarise = (experts) => {
  const countries = new Set();
  const areas = new Set();
  let withCv = 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  let newThisMonth = 0;

  experts.forEach((expert) => {
    if (expert.country) countries.add(expert.country);
    if (expert.cv_file) withCv += 1;
    keywordsOf(expert).forEach((kw) => areas.add(kw));
    if (expert.created_at && new Date(expert.created_at) >= startOfMonth) {
      newThisMonth += 1;
    }
  });

  return {
    total: experts.length,
    withCv,
    countries: countries.size,
    areas: areas.size,
    newThisMonth,
    // CV coverage is the one ratio worth surfacing: it tells you how much of
    // the database is actually actionable.
    cvCoverage: experts.length ? Math.round((withCv / experts.length) * 100) : 0,
  };
};

/** Everything a home page needs, computed in one pass. */
export const buildAnalytics = (experts) => ({
  summary: summarise(experts),
  growth: growthOverTime(experts),
  countries: expertsByCountry(experts),
  expertise: expertiseDistribution(experts),
  experience: experienceBands(experts),
  languages: languageSplit(experts),
});
