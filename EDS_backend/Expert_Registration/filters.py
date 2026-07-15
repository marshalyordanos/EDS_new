import django_filters
from .models import Expert
from django.db.models import Q
from django.db.models.functions import Lower

from django.db.models import Count

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
    def filter_by_database(self, queryset, name, value):
        company_names = [v.strip().lower() for v in value.split(',') if v.strip()]
        if not company_names:
            return queryset

        return queryset.annotate(
            lower_company=Lower('registered_by__company_name')
        ).filter(lower_company__in=company_names)
    
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