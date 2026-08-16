"""CV completeness scoring.

A single source of truth for "how finished is this expert's CV?", used by the
serializer (to expose a per-expert score and breakdown), by the filter (to
search on it), and by the stats endpoint (to report on the database as a whole).

The score is a weighted percentage over SECTIONS below. Each section owns a
weight and a list of checks; a section's own score is the share of its checks
that pass, and the overall score is the weighted mean of section scores. Weights
express how much a section matters to a CV being *usable* for matching an expert
to work — identity and expertise carry more than publications.

Deliberately expressed as plain Python over prefetched relations rather than SQL:
the checks reach across five related tables and mix "field is non-empty" with
"at least one row has a start date", which SQL annotations express badly. Callers
that need this for a list must prefetch — see `completeness_queryset`.
"""

from django.db.models import Prefetch


# ── Thresholds ────────────────────────────────────────────────
# A record at or above COMPLETE_AT is treated as complete for filtering and
# for the status badge. Not 100: a CV can be perfectly usable without, say,
# published books, and holding out for a literal 100% would mark almost the
# whole database incomplete.
COMPLETE_AT = 85
PARTIAL_AT = 40


def _filled(value):
    """True when a scalar field carries real content."""
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, tuple, dict)):
        return len(value) > 0
    return True


def _rows(expert, attr):
    """Related rows for `expert`, using the prefetch cache when present."""
    return list(getattr(expert, attr).all())


def _any_row(expert, attr, field):
    """True when at least one related row has `field` filled in."""
    return any(_filled(getattr(row, field, None)) for row in _rows(expert, attr))


def _personal(expert):
    """The one-to-one PersonalDetail, or None — accessing it raises otherwise."""
    return getattr(expert, "personaldetail", None)


def _pd_field(expert, field):
    detail = _personal(expert)
    return _filled(getattr(detail, field, None)) if detail else False


# ── Section definitions ───────────────────────────────────────
# Each check is (key, human label, predicate, hint shown when it fails).
# `key` is stable and safe to use as a client-side identifier; `step` points
# the UI at the Build-CV step that fixes the gap.
SECTIONS = [
    {
        "key": "identity",
        "label": "Identity",
        "weight": 15,
        "step": 1,
        "checks": [
            ("first_name", "First name", lambda e: _filled(e.first_name),
             "Add the expert's given name."),
            ("last_name", "Last name", lambda e: _filled(e.last_name),
             "Add the expert's family name."),
            ("email", "Email address", lambda e: _filled(e.email),
             "Add a contact email."),
            ("country", "Country of residence", lambda e: _filled(e.country),
             "Record where the expert is currently based."),
            ("nationality", "Nationality", lambda e: _filled(e.nationality),
             "Record the expert's nationality."),
        ],
    },
    {
        "key": "personal_detail",
        "label": "Personal details",
        "weight": 12,
        "step": 1,
        "checks": [
            ("personal_record", "Personal details saved",
             lambda e: _personal(e) is not None,
             "Complete step 1 of Build CV."),
            ("date_of_birth", "Date of birth",
             lambda e: _pd_field(e, "date_of_birth"),
             "Add a date of birth."),
            ("gender", "Gender",
             lambda e: (_personal(e) is not None
                        and (getattr(_personal(e), "gender", None) or "unspecified") != "unspecified"),
             "Set a gender, or leave as unspecified deliberately."),
            ("phone_number", "Phone number",
             lambda e: _pd_field(e, "phone_number"),
             "Add a reachable phone number."),
            ("current_position", "Current position",
             lambda e: _pd_field(e, "current_position"),
             "Record the expert's current job title."),
        ],
    },
    {
        "key": "expertise",
        "label": "Expertise",
        "weight": 18,
        "step": 4,
        "checks": [
            ("expertise_area", "Expertise area", lambda e: _filled(e.expertise_area),
             "Tag the expert with at least one sector."),
            ("key_words", "Keywords", lambda e: _filled(e.key_words),
             "Add keywords so the expert surfaces in searches."),
            ("specialization", "Specialization",
             lambda e: _any_row(e, "expertise_set", "specialization"),
             "Describe the expert's specialization."),
            ("year_of_experience", "Years of experience",
             lambda e: e.year_of_experience is not None,
             "Record total years of experience — searches filter on this."),
        ],
    },
    {
        "key": "education",
        "label": "Education",
        "weight": 15,
        "step": 2,
        "checks": [
            ("has_education", "At least one qualification",
             lambda e: len(_rows(e, "educationalbackground_set")) > 0,
             "Add at least one educational background entry."),
            ("institution", "Institution named",
             lambda e: _any_row(e, "educationalbackground_set", "institution_name"),
             "Name the awarding institution."),
            ("field_of_study", "Field of study",
             lambda e: _any_row(e, "educationalbackground_set", "field_of_study"),
             "Record the field of study."),
            ("grad_year", "Graduation year",
             lambda e: _any_row(e, "educationalbackground_set", "year_of_grad"),
             "Add the year of graduation."),
        ],
    },
    {
        "key": "work",
        "label": "Work experience",
        "weight": 15,
        "step": 3,
        "checks": [
            ("has_work", "At least one role",
             lambda e: len(_rows(e, "workexperience_set")) > 0,
             "Add at least one work experience entry."),
            ("organization", "Employer named",
             lambda e: _any_row(e, "workexperience_set", "organization_name"),
             "Name the employing organization."),
            ("position", "Position title",
             lambda e: _any_row(e, "workexperience_set", "position_title"),
             "Record the position held."),
            ("dates", "Dated",
             lambda e: _any_row(e, "workexperience_set", "start_date"),
             "Add start dates so tenure can be calculated."),
            ("responsibilities", "Responsibilities described",
             lambda e: _any_row(e, "workexperience_set", "responsibilities"),
             "Describe what the expert did in the role."),
        ],
    },
    {
        "key": "projects",
        "label": "Projects & assignments",
        "weight": 12,
        "step": 5,
        "checks": [
            ("has_projects", "At least one project",
             lambda e: len(_rows(e, "researchexperience_set")) > 0,
             "Add at least one project or assignment."),
            ("project_name", "Project named",
             lambda e: _any_row(e, "researchexperience_set", "project_name"),
             "Name the project."),
            ("client", "Client or funder",
             lambda e: _any_row(e, "researchexperience_set", "client"),
             "Record the client — searches filter on funding agencies."),
            ("project_country", "Country of delivery",
             lambda e: _any_row(e, "researchexperience_set", "country"),
             "Record where the project was delivered."),
        ],
    },
    {
        "key": "reach",
        "label": "Languages & reach",
        "weight": 8,
        "step": 1,
        "checks": [
            ("language_skills", "Language skills",
             lambda e: _filled(e.language_skills),
             "Record spoken languages and proficiency."),
            ("countries_of_work", "Countries worked in",
             lambda e: _filled(e.countries_of_work_experience),
             "List the countries the expert has worked in."),
            ("cv_language", "CV language", lambda e: _filled(e.cv_language),
             "Set the language the CV is written in."),
        ],
    },
    {
        "key": "documents",
        "label": "Documents & output",
        "weight": 5,
        "step": 6,
        "checks": [
            ("cv_file", "CV file uploaded",
             lambda e: bool(getattr(e.cv_file, "name", "")),
             "Upload the source CV document."),
            ("publications", "Publications",
             lambda e: _filled(e.publications),
             "List published work, if any."),
        ],
    },
]

TOTAL_WEIGHT = sum(section["weight"] for section in SECTIONS)


def status_for(percent):
    """Bucket a score into the label used by badges and the status filter."""
    if percent >= COMPLETE_AT:
        return "complete"
    if percent >= PARTIAL_AT:
        return "partial"
    return "incomplete"


def evaluate(expert):
    """Score one expert.

    Returns the payload the API exposes as `cv_completeness`:

        {
          "percent": 0-100 int,
          "status": "complete" | "partial" | "incomplete",
          "filled": int, "total": int,       # raw check counts
          "missing_count": int,
          "sections": [ {key, label, weight, step, percent,
                         filled, total, missing:[{key,label,hint}]} ],
          "next_steps": [ up to 3 highest-value missing checks ]
        }
    """
    sections = []
    earned = 0.0
    filled_total = 0
    check_total = 0

    for section in SECTIONS:
        missing = []
        filled = 0

        for key, label, predicate, hint in section["checks"]:
            try:
                passed = bool(predicate(expert))
            except Exception:
                # A malformed row must never take down a listing response;
                # treat an unevaluable check as unmet so it stays visible.
                passed = False
            if passed:
                filled += 1
            else:
                missing.append({"key": key, "label": label, "hint": hint})

        total = len(section["checks"])
        ratio = (filled / total) if total else 1.0
        earned += ratio * section["weight"]
        filled_total += filled
        check_total += total

        sections.append({
            "key": section["key"],
            "label": section["label"],
            "weight": section["weight"],
            "step": section["step"],
            "percent": round(ratio * 100),
            "filled": filled,
            "total": total,
            "missing": missing,
        })

    percent = round((earned / TOTAL_WEIGHT) * 100) if TOTAL_WEIGHT else 0

    # "What should I fix first?" — heaviest section first, then the section's
    # own emptiest state, so the suggestion moves the score the most.
    ranked = sorted(
        (s for s in sections if s["missing"]),
        key=lambda s: (-s["weight"], s["percent"]),
    )
    next_steps = [
        {
            "section": section["label"],
            "section_key": section["key"],
            "step": section["step"],
            "label": item["label"],
            "hint": item["hint"],
        }
        for section in ranked
        for item in section["missing"]
    ][:3]

    return {
        "percent": percent,
        "status": status_for(percent),
        "filled": filled_total,
        "total": check_total,
        "missing_count": check_total - filled_total,
        "sections": sections,
        "next_steps": next_steps,
    }


def completeness_queryset(queryset):
    """Attach every relation `evaluate` touches, so scoring a page of experts
    costs a fixed handful of queries instead of one per expert per relation."""
    return queryset.select_related("personaldetail").prefetch_related(
        "educationalbackground_set",
        "workexperience_set",
        "expertise_set",
        "researchexperience_set",
    )


def summarize(experts):
    """Distribution over an iterable of already-prefetched experts.

    Returns counts per status plus the average score — what the dashboard needs
    to say "62% of your database is search-ready".
    """
    buckets = {"complete": 0, "partial": 0, "incomplete": 0}
    total = 0
    running = 0

    for expert in experts:
        percent = evaluate(expert)["percent"]
        buckets[status_for(percent)] += 1
        running += percent
        total += 1

    return {
        "counts": buckets,
        "total": total,
        "average_percent": round(running / total) if total else 0,
        "complete_at": COMPLETE_AT,
        "partial_at": PARTIAL_AT,
    }
