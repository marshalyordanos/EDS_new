import django_filters
from .models import Expert
from django.db.models import Q
from django.db.models.functions import Lower

from django.db.models import Count

from .completeness import (
    COMPLETE_AT,
    PARTIAL_AT,
    completeness_queryset,
    evaluate as evaluate_completeness,
)


class ExpertFilter(django_filters.FilterSet):
    first_name = django_filters.CharFilter(field_name='first_name', lookup_expr='iexact')
    last_name = django_filters.CharFilter(field_name='last_name', lookup_expr='iexact')
    email = django_filters.CharFilter(field_name='email', lookup_expr='iexact')
    expertise_area = django_filters.CharFilter(method='filter_expertise_area')
    funding_agencies = django_filters.CharFilter(method='filter_funding_agencies')
    database = django_filters.CharFilter(method='filter_by_database') 
    experienceOnProjects = django_filters.NumberFilter(method='filter_experience_on_projects')
    cv_language = django_filters.CharFilter(field_name='cv_language', lookup_expr='iexact')  # exact match, case-insensitive
    nationality = django_filters.CharFilter(method='filter_nationality')
    currentlyWorkingIn = django_filters.CharFilter(method='filter_currently_working_in')
    seniority = django_filters.CharFilter(method='filter_seniority')
    education = django_filters.CharFilter(method='filter_education')
    language_skills = django_filters.CharFilter(method='filter_language_skills')

    # ── Date ranges ──────────────────────────────────────────────
    # Inclusive on both ends. `__date` compares the date part only, so a
    # record created at 14:30 still matches when its own day is the upper
    # bound — otherwise "to = today" would exclude everything from today.
    registered_after = django_filters.DateFilter(
        field_name='created_at', lookup_expr='date__gte'
    )
    registered_before = django_filters.DateFilter(
        field_name='created_at', lookup_expr='date__lte'
    )
    cv_updated_after = django_filters.DateFilter(
        field_name='updated_at', lookup_expr='date__gte'
    )
    cv_updated_before = django_filters.DateFilter(
        field_name='updated_at', lookup_expr='date__lte'
    )

    # Numeric range on years of experience, for when the seniority bands
    # are too coarse.
    min_experience = django_filters.NumberFilter(
        field_name='year_of_experience', lookup_expr='gte'
    )
    max_experience = django_filters.NumberFilter(
        field_name='year_of_experience', lookup_expr='lte'
    )

    has_cv = django_filters.BooleanFilter(method='filter_has_cv')

    # `?mine=true` narrows browse/search results to experts the caller
    # registered themselves - the "My experts" checkbox on the search page.
    mine = django_filters.BooleanFilter(method='filter_mine')

    def filter_mine(self, queryset, name, value):
        user = getattr(self.request, 'user', None)
        if value and user and user.is_authenticated:
            return queryset.filter(registered_by=user)
        return queryset

    # ── CV completeness ─────────────────────────────────────────
    # `completeness_status` takes one or more of complete/partial/incomplete;
    # the min/max pair takes raw percentages for a custom band.
    completeness_status = django_filters.CharFilter(method='filter_completeness_status')
    min_completeness = django_filters.NumberFilter(method='filter_min_completeness')
    max_completeness = django_filters.NumberFilter(method='filter_max_completeness')

    def _scores(self, queryset):
        """{pk: percent}, computed at most once per filterset instance.

        An expert's score depends only on that expert, never on which rows
        happen to sit alongside it, so a score computed against a wider
        queryset stays valid for any narrower one. That lets a single pass
        serve every completeness filter in the request: applying
        min_completeness and max_completeness together used to score the whole
        table twice, once per filter.

        Scores for pks outside the current queryset are simply never looked
        up, because the result is intersected with `queryset` below.
        """
        cache = getattr(self, '_score_cache', None)
        if cache is None:
            cache = self._score_cache = {
                expert.pk: evaluate_completeness(expert)["percent"]
                for expert in completeness_queryset(queryset)
            }
        return cache

    def _filter_by_score(self, queryset, predicate):
        """Narrow to experts whose computed score satisfies `predicate`.

        The score is weighted Python over five related tables, so it cannot be
        expressed as a SQL annotation. Instead: prefetch, score in memory, and
        return a real queryset restricted to the surviving primary keys — the
        caller keeps ordering, pagination and further chaining. `.only()` is
        deliberately absent: `evaluate` reads scalar fields off the model too.
        """
        matching = [
            pk for pk, percent in self._scores(queryset).items() if predicate(percent)
        ]
        return queryset.filter(pk__in=matching)

    def filter_completeness_status(self, queryset, name, value):
        wanted = {v.strip().lower() for v in value.split(',') if v.strip()}
        wanted &= {"complete", "partial", "incomplete"}
        if not wanted:
            return queryset

        def matches(percent):
            if percent >= COMPLETE_AT:
                return "complete" in wanted
            if percent >= PARTIAL_AT:
                return "partial" in wanted
            return "incomplete" in wanted

        return self._filter_by_score(queryset, matches)

    def filter_min_completeness(self, queryset, name, value):
        if value is None:
            return queryset
        floor = float(value)
        return self._filter_by_score(queryset, lambda percent: percent >= floor)

    def filter_max_completeness(self, queryset, name, value):
        if value is None:
            return queryset
        ceiling = float(value)
        return self._filter_by_score(queryset, lambda percent: percent <= ceiling)

    def filter_has_cv(self, queryset, name, value):
        """True → only records with a CV file; False → only those without."""
        if value is True:
            return queryset.exclude(cv_file='').exclude(cv_file__isnull=True)
        if value is False:
            return queryset.filter(Q(cv_file='') | Q(cv_file__isnull=True))
        return queryset

    def filter_language_skills(self, queryset, name, value):
        # value example: "russian-2,italian-1"
        pairs = value.split(',')
        q = queryset
        for pair in pairs:
            lang, spk = pair.split('-', 1)
            try:
                spk_int = int(spk)
            except ValueError:
                continue
            # uses Postgres JSONB array containment
            q = q.filter(language_skills__contains=[{"language": lang.capitalize(), "speaking": spk_int}])
        return q

    def filter_education(self, queryset, name, value):
            # value is a comma-separated string from the query param
            fields = [v.strip() for v in value.split(',') if v.strip()]
            if not fields:
                return queryset

            # Filter experts who have at least one EducationalBackground with field_of_study matching any of the fields
            query = Q()
            for field in fields:
                query |= Q(educationalbackground__field_of_study__icontains=field)

            return queryset.filter(query).distinct()
    def filter_seniority(self, queryset, name, value):
        mapping = {
            "lt_5": (None, 5),
            "btw_0_5": (0, 5),
            "gt_5": (5, None),

            "lt_10": (None, 10),
            "btw_5_10": (5, 10),
            "gt_10": (10, None),

            "lt_15": (None, 15),
            "btw_10_15": (10, 15),
            "gt_15": (15, None),

            "lt_20": (None, 20),
            "btw_15_20": (15, 20),
            "gt_20": (20, None),
        }

        if value not in mapping:
            return queryset

        min_val, max_val = mapping[value]

        if min_val is not None and max_val is not None:
            return queryset.filter(year_of_experience__gte=min_val, year_of_experience__lt=max_val)
        elif min_val is not None:
            return queryset.filter(year_of_experience__gt=min_val)
        elif max_val is not None:
            return queryset.filter(year_of_experience__lt=max_val)

        return queryset


    def filter_nationality(self, queryset, name, value):
        nationalities = [n.strip().lower() for n in value.split(',') if n.strip()]
        return queryset.annotate(
            lower_nationality=Lower('nationality')
        ).filter(lower_nationality__in=nationalities)

    def filter_currently_working_in(self, queryset, name, value):
        countries = [c.strip().lower() for c in value.split(',') if c.strip()]
        return queryset.annotate(
            lower_country=Lower('country')
        ).filter(lower_country__in=countries)
    def filter_experience_on_projects(self, queryset, name, value):
        return queryset.annotate(
            project_count=Count('researchexperience')
        ).filter(project_count__gte=value)
    # Sentinel selecting every expert registered by an admin with no company
    # name of their own — the platform operator's own records, shown to the
    # user as a single "DAB" database rather than one row per admin account.
    DAB_DATABASE = 'DAB'

    def filter_by_database(self, queryset, name, value):
        selected = [v.strip() for v in value.split(',') if v.strip()]
        if not selected:
            return queryset

        want_dab = any(v.lower() == self.DAB_DATABASE.lower() for v in selected)
        company_names = [v.lower() for v in selected if v.lower() != self.DAB_DATABASE.lower()]

        query = Q()
        for company_name in company_names:
            query |= Q(registered_by__company_name__iexact=company_name)

        if want_dab:
            # An admin with no company name of their own registers directly
            # under the platform operator's database, shown to the user as
            # a single "DAB" bucket rather than one row per admin account.
            query |= Q(registered_by__role='admin') & (
                Q(registered_by__company_name__isnull=True)
                | Q(registered_by__company_name__exact='')
            )

        return queryset.filter(query).distinct()
    
    def filter_funding_agencies(self, queryset, name, value):
        agencies = [a.strip() for a in value.split(',') if a.strip()]
        if not agencies:
            return queryset

        query = Q()
        for agency in agencies:
            query |= Q(researchexperience__project_name__icontains=agency) | Q(researchexperience__client__icontains=agency)

        return queryset.filter(query).distinct()
    def filter_expertise_area(self, queryset, name, value):
        # value is the string from query param, e.g. "Biotechnology,Physics"
        keywords = [k.strip() for k in value.split(',') if k.strip()]
        # Build an AND query for all keywords with icontains
        for kw in keywords:
            queryset = queryset.filter(expertise_area__icontains=kw)
        return queryset
    countries_of_work_experience = django_filters.CharFilter(method='filter_countries_of_work_experience')

    def filter_countries_of_work_experience(self, queryset, name, value):
        countries = [c.strip() for c in value.split(',') if c.strip()]
        if not countries:
            return queryset

        query = Q()
        for country in countries:
            query |= Q(countries_of_work_experience__icontains=country)  # case-insensitive

        return queryset.filter(query)

    class Meta:
        model = Expert
        fields = [
            'first_name', 'last_name', 'email', 'country', 'cv_language','language_skills',
            'expertise_area', 'is_deleted', 'countries_of_work_experience','funding_agencies'
        ]