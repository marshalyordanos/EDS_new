import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
  FiFileText,
  FiUser,
  FiSliders,
  FiBriefcase,
  FiBookOpen,
  FiSearch as FiResearch,
} from "react-icons/fi";
import protectedApiClient from "../../api/axios";
import { sectorsData, geoData } from "../../constants/searchTaxonomy";
import {
  CompletenessRing,
  CompletenessBar,
  CompletenessDetail,
} from "../../Components/dashboard/CvCompleteness";
import "../../styles/console.css";

const LANGUAGE_LEVEL = { 4: "Excellent", 3: "Very good", 2: "Average", 1: "Basic" };

/* Seniority bands mirror ExpertFilter.filter_seniority on the backend. */
const SENIORITY_OPTIONS = [
  { value: "lt_5", label: "Under 5 years" },
  { value: "btw_5_10", label: "5 – 10 years" },
  { value: "btw_10_15", label: "10 – 15 years" },
  { value: "gt_15", label: "Over 15 years" },
];

const CV_LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "Amharic", label: "Amharic" },
];

/* Page sizes offered in the results footer. */
const PAGE_SIZES = [5, 10, 20, 30, 40, 50];

/* Single-value query params that each render one removable chip. */
const SINGLE_PARAM_CHIPS = [
  { key: "nationality", label: "Nationality" },
  { key: "experienceOnProjects", label: "Projects ≥" },
  { key: "registered_after", label: "Registered from" },
  { key: "registered_before", label: "Registered to" },
  { key: "cv_updated_after", label: "CV updated from" },
  { key: "cv_updated_before", label: "CV updated to" },
  { key: "min_experience", label: "Experience ≥" },
  { key: "max_experience", label: "Experience ≤" },
  { key: "education", label: "Field of study" },
  { key: "currentlyWorkingIn", label: "Working in" },
  { key: "funding_agencies", label: "Funder" },
  {
    key: "has_cv",
    label: "CV",
    format: (v) => (v === "true" ? "on file" : "missing"),
  },
  { key: "min_completeness", label: "Complete ≥", format: (v) => `${v}%` },
  { key: "max_completeness", label: "Complete ≤", format: (v) => `${v}%` },
];

const HAS_CV_OPTIONS = [
  { value: "true", label: "Has a CV" },
  { value: "false", label: "No CV on file" },
];

/* Buckets mirror completeness.status_for on the backend. */
const COMPLETENESS_OPTIONS = [
  { value: "complete", label: "Complete" },
  { value: "partial", label: "Partly filled" },
  { value: "incomplete", label: "Incomplete" },
];

const COMPLETENESS_LABEL = Object.fromEntries(
  COMPLETENESS_OPTIONS.map((o) => [o.value, o.label])
);

/* Quick spans for the registration-date facet. */
const DATE_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

/** YYYY-MM-DD for N days ago, in local time (matches the date inputs). */
const isoDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const SORT_OPTIONS = [
  { value: "", label: "Default order" },
  { value: "first_name", label: "Name (A–Z)" },
  { value: "-first_name", label: "Name (Z–A)" },
  { value: "-created_at", label: "Newest first" },
  { value: "created_at", label: "Oldest first" },
  // Handled server-side in ExpertViewSet.list — the score is computed, not stored.
  { value: "completeness", label: "Least complete first" },
  { value: "-completeness", label: "Most complete first" },
];

const initialsOf = (first = "", last = "") =>
  `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "–";

const monthsSince = (value) => {
  if (!value) return null;
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return null;
  const now = new Date();
  return (now.getFullYear() - then.getFullYear()) * 12 + (now.getMonth() - then.getMonth());
};

const fmtMonthYear = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
};

const parseLanguages = (raw) => {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed : [];
};

const splitList = (value) =>
  (value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

/* Placeholder for a field the record simply does not carry. Shown instead of
   hiding the row, so the reader can tell "not recorded" from "not a field". */
const Blank = () => (
  <span className="con-kv-blank" title="Not recorded">
    —
  </span>
);

/* Tag row that degrades to the blank marker when the list is empty. */
const TagList = ({ items }) =>
  items.length > 0 ? (
    <span className="con-kv-tags">
      {items.map((tag) => (
        <span key={tag} className="con-tagchip">
          {tag}
        </span>
      ))}
    </span>
  ) : (
    <Blank />
  );

/* Highlight free-text matches inside a result line. */
const Highlight = ({ text, term }) => {
  if (!term || !text) return <>{text}</>;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = String(text).split(new RegExp(`(${safe})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? <mark key={i}>{part}</mark> : part
      )}
    </>
  );
};

/* ── Date range ───────────────────────────────────────────────
   Two bounded date inputs plus optional quick-span presets. Each input
   constrains the other's range, so an invalid window cannot be picked. */
const DateRange = ({ fromValue, toValue, onFrom, onTo, presets, onPreset }) => {
  const today = isoDaysAgo(0);
  const active = fromValue || toValue;

  return (
    <div className="con-daterange">
      {presets && (
        <div className="con-preset-row">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="con-preset"
              onClick={() => onPreset(preset.days)}
            >
              {preset.label}
            </button>
          ))}
          {active && (
            <button
              type="button"
              className="con-preset con-preset-clear"
              onClick={() => onPreset(null)}
            >
              Clear
            </button>
          )}
        </div>
      )}

      <label className="con-date-field">
        <span>From</span>
        <input
          type="date"
          className="con-date-in"
          value={fromValue}
          max={toValue || today}
          onChange={(e) => onFrom(e.target.value)}
        />
      </label>

      <label className="con-date-field">
        <span>To</span>
        <input
          type="date"
          className="con-date-in"
          value={toValue}
          min={fromValue || undefined}
          max={today}
          onChange={(e) => onTo(e.target.value)}
        />
      </label>
    </div>
  );
};

/* ── Facet group ──────────────────────────────────────────── */
const Facet = ({ title, children, selectedCount, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen || selectedCount > 0);

  return (
    <div className="con-facet">
      <button className="con-facet-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {title}
        {selectedCount > 0 && <span className="con-facet-count">{selectedCount}</span>}
        <span className="chev" style={{ transform: open ? "none" : "rotate(-90deg)" }}>
          <FiChevronDown size={13} />
        </span>
      </button>
      {open && <div className="con-facet-body">{children}</div>}
    </div>
  );
};

/* A checkbox list that stays usable at taxonomy scale: searchable,
   truncated to a handful, expandable on demand. */
const CheckList = ({ options, selected, onToggle, searchable = false, initial = 6 }) => {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Selected options always stay visible, even when the list is truncated.
  const visible = expanded || query.trim() ? filtered : filtered.slice(0, initial);
  const shown = expanded
    ? visible
    : [...visible, ...filtered.filter((o) => selected.includes(o.value) && !visible.includes(o))];
  const hidden = filtered.length - shown.length;

  return (
    <>
      {searchable && options.length > initial && (
        <input
          className="con-facet-search"
          placeholder={`Filter ${options.length} options`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      {shown.map((option) => (
        <label className="con-check" key={option.value}>
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          <span className="con-check-label" title={option.label}>
            {option.label}
          </span>
          {option.count != null && <span className="n">{option.count}</span>}
        </label>
      ))}
      {!expanded && hidden > 0 && (
        <button className="con-facet-more" onClick={() => setExpanded(true)}>
          Show {hidden} more
        </button>
      )}
      {expanded && filtered.length > initial && (
        <button className="con-facet-more" onClick={() => setExpanded(false)}>
          Show fewer
        </button>
      )}
      {filtered.length === 0 && (
        <span style={{ fontSize: 12, color: "var(--con-ink-3)" }}>No matches</span>
      )}
    </>
  );
};

export default function ExpertSearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  // Expert whose completeness breakdown is open, if any.
  const [breakdownFor, setBreakdownFor] = useState(null);

  // Client-side paging over the fetched result set.
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // The URL is the source of truth, so results stay shareable.
  const q = searchParams.get("q") || "";
  const ordering = searchParams.get("ordering") || "";
  const sectors = splitList(searchParams.get("expertise_area"));
  const regions = splitList(searchParams.get("countries_of_work_experience"));
  const seniority = splitList(searchParams.get("seniority"));
  const cvLanguage = splitList(searchParams.get("cv_language"));
  const completeness = splitList(searchParams.get("completeness_status"));
  const databases = splitList(searchParams.get("database"));
  const mineOnly = searchParams.get("mine") === "true";

  // Company users register their own experts and can also browse everyone
  // else's (trimmed to name/position/experience) - this toggle is only
  // meaningful for that role. Admins already see everything as "theirs".
  const userRole = localStorage.getItem("userRole");
  const showMineToggle = userRole === "company";

  const [draftQuery, setDraftQuery] = useState(q);
  useEffect(() => setDraftQuery(q), [q]);

  const updateParams = useCallback(
    (mutate) => {
      const next = new URLSearchParams(searchParams);
      mutate(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setParam = useCallback(
    (key, value) => {
      updateParams((next) => {
        if (value && value.length) next.set(key, value);
        else next.delete(key);
      });
    },
    [updateParams]
  );

  const toggleIn = useCallback(
    (key, current, value) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setParam(key, next.join(","));
    },
    [setParam]
  );

  // Debounce the free-text box so typing doesn't fire a request per keystroke.
  const debounceRef = useRef();
  const onQueryChange = (value) => {
    setDraftQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam("q", value), 350);
  };
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const res = await protectedApiClient.get("/api/v1/experts/", { params });
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setResults(list);
      } catch (err) {
        if (cancelled) return;
        setError("Could not run that search. Adjust your filters and try again.");
        console.error("Expert search failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  /* Database checkbox options: one row per company with experts on file,
     plus a synthetic "DAB" row for the platform operator's own admin
     accounts. Fetched once — the list only changes when someone new
     registers an expert, which doesn't need to be live within one visit. */
  const [databaseOptions, setDatabaseOptions] = useState([]);
  useEffect(() => {
    let cancelled = false;
    protectedApiClient
      .get("/api/v1/experts/databases/")
      .then((res) => {
        if (!cancelled) setDatabaseOptions(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        // Non-critical: the facet just shows no options if this fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sectorOptions = useMemo(
    () =>
      sectorsData.map((s) => ({
        value: s.category,
        label: s.category,
      })),
    []
  );

  const regionOptions = useMemo(
    () => geoData.map((g) => ({ value: g.category, label: g.category })),
    []
  );

  /* Every active filter becomes an individually removable chip, so
     "what am I filtering by?" is answerable at a glance. */
  const chips = useMemo(() => {
    const list = [];
    if (q) list.push({ kind: true, label: `"${q}"`, clear: () => setParam("q", "") });
    sectors.forEach((v) =>
      list.push({ label: v, clear: () => toggleIn("expertise_area", sectors, v) })
    );
    regions.forEach((v) =>
      list.push({ label: v, clear: () => toggleIn("countries_of_work_experience", regions, v) })
    );
    seniority.forEach((v) =>
      list.push({
        label: SENIORITY_OPTIONS.find((o) => o.value === v)?.label || v,
        clear: () => toggleIn("seniority", seniority, v),
      })
    );
    cvLanguage.forEach((v) =>
      list.push({ label: `CV: ${v}`, clear: () => toggleIn("cv_language", cvLanguage, v) })
    );
    completeness.forEach((v) =>
      list.push({
        label: COMPLETENESS_LABEL[v] || v,
        clear: () => toggleIn("completeness_status", completeness, v),
      })
    );
    databases.forEach((v) =>
      list.push({
        label: `Database: ${v}`,
        clear: () => toggleIn("database", databases, v),
      })
    );

    /* Single-value params get a chip each, so every active filter is visible
       and removable — previously these applied invisibly and only the global
       Reset could clear them. */
    SINGLE_PARAM_CHIPS.forEach(({ key, label, format }) => {
      const value = searchParams.get(key);
      if (!value) return;
      list.push({
        label: `${label}: ${format ? format(value) : value}`,
        clear: () => setParam(key, ""),
      });
    });

    return list;
  }, [
    q,
    sectors,
    regions,
    seniority,
    cvLanguage,
    completeness,
    databases,
    searchParams,
    setParam,
    toggleIn,
  ]);

  const filterCount = chips.length;

  const clearAll = () =>
    setSearchParams(ordering ? new URLSearchParams({ ordering }) : new URLSearchParams(), {
      replace: true,
    });

  const selectedExpert = results.find((r) => r.id === selected) || null;

  /* ── Paging ──────────────────────────────────────────────
     Applied after filtering/sorting so the page always reflects the
     current result set. */
  const pageCount = Math.max(1, Math.ceil(results.length / perPage));

  // Clamp rather than reset: if the result set shrinks (a filter is added)
  // while the user is on a high page, land them on the last real page.
  const currentPage = Math.min(page, pageCount);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return results.slice(start, start + perPage);
  }, [results, currentPage, perPage]);

  const rangeStart = results.length === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, results.length);

  // A new search is a new result set — go back to the first page. Keyed on
  // the serialised params, not the URLSearchParams object, which is a fresh
  // instance on every render and would reset the page continuously.
  const searchKey = searchParams.toString();
  useEffect(() => {
    setPage(1);
  }, [searchKey]);

  return (
    <div className={`con-search${selectedExpert ? "" : " no-preview"}`}>
      {/* ══ FILTERS ══ */}
      <aside className="con-filters">
        <div className="con-filters-head">
          <h3>Filters</h3>
          {filterCount > 0 && <span className="tally">{filterCount}</span>}
          {filterCount > 0 && (
            <button className="con-reset" onClick={clearAll}>
              Reset
            </button>
          )}
        </div>

        <div className="con-filters-scroll">
          {/* Which company (or the platform's own "DAB" database) registered
              the expert. Sits first since it's the primary way records are
              organised by owner. */}
          <Facet title="Database" selectedCount={databases.length} defaultOpen>
            <CheckList
              options={databaseOptions}
              selected={databases}
              onToggle={(v) => toggleIn("database", databases, v)}
              searchable
            />
          </Facet>

          <Facet title="Sector" selectedCount={sectors.length} defaultOpen>
            <CheckList
              options={sectorOptions}
              selected={sectors}
              onToggle={(v) => toggleIn("expertise_area", sectors, v)}
              searchable
            />
          </Facet>

          {/* Data quality sits near the top: "which records still need work?"
              is a first-class question here, not an afterthought. */}
          <Facet
            title="CV completeness"
            selectedCount={
              completeness.length +
              (searchParams.get("min_completeness") ? 1 : 0) +
              (searchParams.get("max_completeness") ? 1 : 0)
            }
            defaultOpen
          >
            <CheckList
              options={COMPLETENESS_OPTIONS}
              selected={completeness}
              onToggle={(v) => toggleIn("completeness_status", completeness, v)}
              initial={3}
            />
            <div className="con-facet-sub">Or a custom range (%)</div>
            <div className="con-range-row">
              <input
                className="con-range-in"
                type="number"
                min="0"
                max="100"
                placeholder="Min"
                defaultValue={searchParams.get("min_completeness") || ""}
                onBlur={(e) => setParam("min_completeness", e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
              <span className="con-range-sep">to</span>
              <input
                className="con-range-in"
                type="number"
                min="0"
                max="100"
                placeholder="Max"
                defaultValue={searchParams.get("max_completeness") || ""}
                onBlur={(e) => setParam("max_completeness", e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </div>
          </Facet>

          <Facet title="Seniority" selectedCount={seniority.length}>
            <CheckList
              options={SENIORITY_OPTIONS}
              selected={seniority}
              onToggle={(v) => toggleIn("seniority", seniority, v)}
              initial={4}
            />
          </Facet>

          <Facet title="Region of experience" selectedCount={regions.length}>
            <CheckList
              options={regionOptions}
              selected={regions}
              onToggle={(v) => toggleIn("countries_of_work_experience", regions, v)}
              searchable
            />
          </Facet>

          <Facet title="CV language" selectedCount={cvLanguage.length}>
            <CheckList
              options={CV_LANGUAGE_OPTIONS}
              selected={cvLanguage}
              onToggle={(v) => toggleIn("cv_language", cvLanguage, v)}
              initial={2}
            />
          </Facet>

          <Facet title="Nationality" selectedCount={searchParams.get("nationality") ? 1 : 0}>
            <input
              className="con-facet-search"
              placeholder="e.g. Ethiopian"
              defaultValue={searchParams.get("nationality") || ""}
              onBlur={(e) => setParam("nationality", e.target.value.trim())}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Facet>

          <Facet
            title="Projects delivered"
            selectedCount={searchParams.get("experienceOnProjects") ? 1 : 0}
          >
            <div className="con-range-row">
              <input
                className="con-range-in"
                type="number"
                min="0"
                placeholder="Min"
                defaultValue={searchParams.get("experienceOnProjects") || ""}
                onBlur={(e) => setParam("experienceOnProjects", e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </div>
          </Facet>

          <Facet
            title="Date registered"
            selectedCount={
              (searchParams.get("registered_after") ? 1 : 0) +
              (searchParams.get("registered_before") ? 1 : 0)
            }
          >
            <DateRange
              fromValue={searchParams.get("registered_after") || ""}
              toValue={searchParams.get("registered_before") || ""}
              onFrom={(v) => setParam("registered_after", v)}
              onTo={(v) => setParam("registered_before", v)}
              presets={DATE_PRESETS}
              onPreset={(days) => {
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  if (days == null) {
                    next.delete("registered_after");
                    next.delete("registered_before");
                  } else {
                    next.set("registered_after", isoDaysAgo(days));
                    next.set("registered_before", isoDaysAgo(0));
                  }
                  return next;
                });
              }}
            />
          </Facet>

          <Facet
            title="CV last updated"
            selectedCount={
              (searchParams.get("cv_updated_after") ? 1 : 0) +
              (searchParams.get("cv_updated_before") ? 1 : 0)
            }
          >
            <DateRange
              fromValue={searchParams.get("cv_updated_after") || ""}
              toValue={searchParams.get("cv_updated_before") || ""}
              onFrom={(v) => setParam("cv_updated_after", v)}
              onTo={(v) => setParam("cv_updated_before", v)}
            />
          </Facet>

          <Facet
            title="Years of experience"
            selectedCount={
              (searchParams.get("min_experience") ? 1 : 0) +
              (searchParams.get("max_experience") ? 1 : 0)
            }
          >
            <div className="con-range-row">
              <input
                className="con-range-in"
                type="number"
                min="0"
                placeholder="Min"
                defaultValue={searchParams.get("min_experience") || ""}
                onBlur={(e) => setParam("min_experience", e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
              <span className="con-range-sep">to</span>
              <input
                className="con-range-in"
                type="number"
                min="0"
                placeholder="Max"
                defaultValue={searchParams.get("max_experience") || ""}
                onBlur={(e) => setParam("max_experience", e.target.value.trim())}
                onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
              />
            </div>
          </Facet>

          <Facet
            title="Field of study"
            selectedCount={searchParams.get("education") ? 1 : 0}
          >
            <input
              className="con-facet-search"
              placeholder="e.g. Public health"
              defaultValue={searchParams.get("education") || ""}
              onBlur={(e) => setParam("education", e.target.value.trim())}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Facet>

          <Facet
            title="Currently working in"
            selectedCount={searchParams.get("currentlyWorkingIn") ? 1 : 0}
          >
            <input
              className="con-facet-search"
              placeholder="e.g. Kenya"
              defaultValue={searchParams.get("currentlyWorkingIn") || ""}
              onBlur={(e) => setParam("currentlyWorkingIn", e.target.value.trim())}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Facet>

          <Facet
            title="Funding agency or client"
            selectedCount={searchParams.get("funding_agencies") ? 1 : 0}
          >
            <input
              className="con-facet-search"
              placeholder="e.g. UNDP"
              defaultValue={searchParams.get("funding_agencies") || ""}
              onBlur={(e) => setParam("funding_agencies", e.target.value.trim())}
              onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            />
          </Facet>

          <Facet title="CV on file" selectedCount={searchParams.get("has_cv") ? 1 : 0}>
            <CheckList
              options={HAS_CV_OPTIONS}
              selected={splitList(searchParams.get("has_cv"))}
              // Radio-like: picking one clears the other, since a record
              // cannot both have and lack a CV.
              onToggle={(v) =>
                setParam("has_cv", searchParams.get("has_cv") === v ? "" : v)
              }
              initial={2}
            />
          </Facet>
        </div>
      </aside>

      {/* ══ RESULTS ══ */}
      <section className="con-results">
        <div className="con-chipbar">
          <div
            className="con-omni"
            style={{ maxWidth: 420, flex: "1 1 260px", cursor: "text" }}
            onClick={(e) => e.currentTarget.querySelector("input")?.focus()}
          >
            <FiSearch size={15} />
            <input
              value={draftQuery}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search name, sector, or keyword"
              style={{
                border: 0,
                background: "none",
                outline: "none",
                color: "var(--con-ink)",
                fontFamily: "var(--font-secondary)",
                fontSize: 13,
                flex: 1,
                minWidth: 0,
              }}
            />
            {draftQuery && (
              <button
                onClick={() => onQueryChange("")}
                style={{ border: 0, background: "none", cursor: "pointer", color: "var(--con-ink-3)" }}
                aria-label="Clear search"
              >
                <FiX size={14} />
              </button>
            )}
          </div>

          {showMineToggle && (
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                fontFamily: "var(--font-secondary)",
                color: "var(--con-ink-2)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(e) => setParam("mine", e.target.checked ? "true" : "")}
              />
              My experts only
            </label>
          )}

          {chips.map((chip, i) => (
            <span className={`con-chip${chip.kind ? " kind" : ""}`} key={`${chip.label}-${i}`}>
              {chip.label}
              <button onClick={chip.clear} aria-label={`Remove ${chip.label}`}>
                <FiX size={11} />
              </button>
            </span>
          ))}

          {filterCount > 1 && (
            <button className="con-clear-all" onClick={clearAll}>
              Clear all
            </button>
          )}
        </div>

        <div className="con-results-head">
          <div className="con-results-tally">
            {loading ? (
              "Searching…"
            ) : (
              <>
                <b className="con-num">{results.length}</b>
                {results.length === 1 ? "expert matches" : "experts match"}
                {/* Quality of the current result set, derived from the rows
                    already in hand — no extra request, and it always agrees
                    with the rings below. Each count is a shortcut into the
                    matching filter. */}
                {results.length > 0 && (
                  <span className="con-qualstrip">
                    {COMPLETENESS_OPTIONS.map((option) => {
                      const count = results.filter(
                        (r) => r.cv_completeness?.status === option.value
                      ).length;
                      if (!count) return null;
                      const active = completeness.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          className={`con-qualdot is-${option.value}${active ? " active" : ""}`}
                          title={`${count} ${option.label.toLowerCase()} — click to filter`}
                          onClick={() =>
                            toggleIn("completeness_status", completeness, option.value)
                          }
                        >
                          <i />
                          {count}
                        </button>
                      );
                    })}
                  </span>
                )}
              </>
            )}
          </div>

          <select
            className="con-sort"
            value={ordering}
            onChange={(e) => setParam("ordering", e.target.value)}
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="con-rows">
          {error ? (
            <div className="con-card-body">
              <div className="con-error">{error}</div>
            </div>
          ) : loading ? (
            <div className="con-card-body" style={{ display: "grid", gap: 10 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="con-skeleton" style={{ height: 74 }} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="con-pv-empty" style={{ padding: "64px 24px" }}>
              <FiSearch size={30} />
              <p>
                {filterCount > 0
                  ? "No experts match these filters. Try removing one."
                  : "Start typing or pick a filter to search the database."}
              </p>
              {filterCount > 0 && (
                <button className="con-btn con-btn-quiet" onClick={clearAll}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            pageSlice.map((expert) => {
              const stale = monthsSince(expert.updated_at);
              const isStale = stale != null && stale >= 12;
              const expertSectors = splitList(expert.expertise_area);
              const expertRegions = splitList(expert.countries_of_work_experience);

              return (
                <button
                  key={expert.id}
                  className={`con-row${selected === expert.id ? " selected" : ""}`}
                  onClick={() => setSelected(expert.id)}
                >
                  <span className="con-row-av">
                    {initialsOf(expert.first_name, expert.last_name)}
                  </span>

                  <span className="con-row-body">
                    <span className="con-row-name">
                      <Highlight
                        text={`${expert.first_name || ""} ${expert.last_name || ""}`.trim()}
                        term={q}
                      />
                      {expert.code && <span className="con-row-code">{expert.code}</span>}
                    </span>
                    <span className="con-row-meta">
                      <Highlight
                        text={
                          [expert.expertise_area, expert.country].filter(Boolean).join(" · ") ||
                          "No sector recorded"
                        }
                        term={q}
                      />
                    </span>
                    <span className="con-row-tags">
                      {expertSectors.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className={`con-tagchip${
                            sectors.some((s) => tag.toLowerCase().includes(s.toLowerCase()))
                              ? " hit"
                              : ""
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                      {expertRegions.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className={`con-tagchip${
                            regions.some((r) => tag.toLowerCase().includes(r.toLowerCase()))
                              ? " hit"
                              : ""
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </span>

                  <span className="con-row-right">
                    {expert.year_of_experience != null && (
                      <span className="con-yrs con-num">
                        {expert.year_of_experience}
                        <small>years</small>
                      </span>
                    )}
                    {stale != null && (
                      <span className={`con-cvstate ${isStale ? "stale" : "fresh"}`}>
                        {isStale ? <FiClock size={9} /> : <FiCheck size={9} />}
                        {stale} mo
                      </span>
                    )}
                  </span>

                  {/* Completeness sits outside con-row-right so it anchors to
                      the row edge and stays aligned down the column, whether or
                      not the record has years or a freshness badge. */}
                  {expert.cv_completeness && (
                    <CompletenessRing
                      report={expert.cv_completeness}
                      size={34}
                      onClick={() => setBreakdownFor(expert)}
                    />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* ══ PAGINATION ══ */}
        {!loading && results.length > 0 && (
          <div className="con-pager">
            <span className="con-pager-range">
              {rangeStart.toLocaleString()}–{rangeEnd.toLocaleString()} of{" "}
              {results.length.toLocaleString()}
            </span>

            <label className="con-pager-size">
              Per page
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                aria-label="Results per page"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <div className="con-pager-nav">
              <button
                className="con-btn con-btn-quiet"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <FiChevronLeft size={14} />
                Prev
              </button>
              <span className="con-pager-count">
                Page {currentPage} of {pageCount}
              </span>
              <button
                className="con-btn con-btn-quiet"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= pageCount}
              >
                Next
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ══ PREVIEW ══ */}
      {selectedExpert && (
        <aside className="con-preview">
          <div className="con-pv-head">
            <div className="con-pv-top">
              <span className="con-pv-av">
                {initialsOf(selectedExpert.first_name, selectedExpert.last_name)}
              </span>
              <div className="con-pv-id">
                <h3>
                  {selectedExpert.first_name} {selectedExpert.last_name}
                </h3>
                <p>
                  {[selectedExpert.expertise_area, selectedExpert.country]
                    .filter(Boolean)
                    .join(" · ") || "No sector recorded"}
                </p>
              </div>
              <button
                className="con-pv-close"
                onClick={() => setSelected(null)}
                aria-label="Close preview"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="con-pv-acts">
              <button
                className="con-btn con-btn-primary"
                onClick={() => navigate(`/dashboard/experts/${selectedExpert.id}`)}
              >
                <FiUser size={14} />
                Full profile
              </button>
              {selectedExpert.cv_file && (
                <a
                  className="con-btn con-btn-quiet"
                  href={selectedExpert.cv_file}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FiFileText size={14} />
                  CV
                </a>
              )}
            </div>
          </div>

          <div className="con-pv-scroll">
            {/* Every field is listed whether or not it holds a value, so the
                record reads as a complete form and a gap is visibly a gap
                rather than a row that silently disappeared. */}
            <div className="con-pv-sec">
              <h4>Record</h4>
              <dl className="con-kv">
                <dt>Code</dt>
                <dd className="con-kv-code">{selectedExpert.code || <Blank />}</dd>

                <dt>Name</dt>
                <dd>
                  {`${selectedExpert.first_name || ""} ${selectedExpert.last_name || ""}`.trim() || <Blank />}
                </dd>

                <dt>Nationality</dt>
                <dd>{selectedExpert.nationality || <Blank />}</dd>

                <dt>Languages</dt>
                <dd>
                  {parseLanguages(selectedExpert.language_skills).length > 0 ? (
                    <div className="con-lang-stack">
                      {parseLanguages(selectedExpert.language_skills).map((lang, i) => (
                        <div className="con-lang" key={`${lang.language}-${i}`}>
                          <span className="con-lang-name">{lang.language}</span>
                          <span className="con-meter">
                            <i style={{ width: `${((lang.speaking || 0) / 4) * 100}%` }} />
                          </span>
                          <small>{LANGUAGE_LEVEL[lang.speaking] || "—"}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Blank />
                  )}
                </dd>

                <dt>Regions experience</dt>
                <dd>
                  <TagList items={splitList(selectedExpert.countries_of_work_experience)} />
                </dd>

                <dt>Sectors experience</dt>
                <dd>
                  <TagList items={splitList(selectedExpert.expertise_area)} />
                </dd>

                <dt>Seniority</dt>
                <dd>
                  {selectedExpert.year_of_experience != null ? (
                    `${selectedExpert.year_of_experience} years`
                  ) : (
                    <Blank />
                  )}
                </dd>

                <dt>CV language</dt>
                <dd>{selectedExpert.cv_language || <Blank />}</dd>

                <dt>CV updated</dt>
                <dd>
                  {(() => {
                    const m = monthsSince(selectedExpert.updated_at);
                    if (m == null) return <Blank />;
                    return (
                      <span style={{ color: m >= 12 ? "var(--con-warn)" : undefined }}>
                        {m === 0 ? "This month" : `${m} months ago`}
                      </span>
                    );
                  })()}
                </dd>
              </dl>
            </div>

            {/* Professional history: present on every expert this viewer can
                open, whether owned (full ExpertSerializer) or not
                (PublicExpertSerializer sends the same three lists, minus
                contact info and the CV itself). Sections simply don't
                render when a list is empty or absent. */}
            {selectedExpert.work_experiences?.filter((w) => w.typee !== "certification").length > 0 && (
              <div className="con-pv-sec">
                <h4>
                  <FiBriefcase size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Work experience
                </h4>
                <div className="con-pv-history">
                  {selectedExpert.work_experiences
                    .filter((w) => w.typee !== "certification")
                    .map((w) => (
                      <div className="con-pv-history-row" key={w.id}>
                        <b>{w.position_title || "Position"}</b>
                        <span>{w.organization_name || "—"}</span>
                        <small>
                          {[fmtMonthYear(w.start_date), w.end_date ? fmtMonthYear(w.end_date) : "Present"]
                            .filter(Boolean)
                            .join(" – ")}
                        </small>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {selectedExpert.educational_backgrounds?.length > 0 && (
              <div className="con-pv-sec">
                <h4>
                  <FiBookOpen size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Education
                </h4>
                <div className="con-pv-history">
                  {selectedExpert.educational_backgrounds.map((e) => (
                    <div className="con-pv-history-row" key={e.id}>
                      <b>{[e.education_level, e.field_of_study].filter(Boolean).join(", ") || "Qualification"}</b>
                      <span>{e.institution_name || "—"}</span>
                      <small>{fmtMonthYear(e.year_of_grad) || ""}</small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExpert.research_experiences?.length > 0 && (
              <div className="con-pv-sec">
                <h4>
                  <FiResearch size={13} style={{ marginRight: 6, verticalAlign: -2 }} />
                  Research
                </h4>
                <div className="con-pv-history">
                  {selectedExpert.research_experiences.map((r) => (
                    <div className="con-pv-history-row" key={r.id}>
                      <b>{r.position || "Research"}</b>
                      <span>{r.project_name || r.client || "—"}</span>
                      <small>
                        {[fmtMonthYear(r.start_date), r.end_date ? fmtMonthYear(r.end_date) : "Present"]
                          .filter(Boolean)
                          .join(" – ")}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedExpert.cv_completeness && (
              <div className="con-pv-sec">
                <h4>CV completeness</h4>
                <CompletenessBar report={selectedExpert.cv_completeness} />
                <button
                  className="con-btn con-btn-quiet"
                  style={{ marginTop: 10, width: "100%", justifyContent: "center" }}
                  onClick={() => setBreakdownFor(selectedExpert)}
                >
                  See what's missing (
                  {selectedExpert.cv_completeness.missing_count})
                </button>
              </div>
            )}

            {selectedExpert.key_words?.length > 0 && (
              <div className="con-pv-sec">
                <h4>Keywords</h4>
                <div className="con-row-tags" style={{ marginTop: 0 }}>
                  {selectedExpert.key_words.map((kw) => (
                    <span key={kw} className="con-tagchip">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}

      {breakdownFor && (
        <CompletenessDetail
          expert={breakdownFor}
          report={breakdownFor.cv_completeness}
          onClose={() => setBreakdownFor(null)}
        />
      )}
    </div>
  );
}
