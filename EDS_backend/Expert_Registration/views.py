import os
import tempfile
from django.utils.timezone import now
from datetime import timedelta
import json # Import json for serializing lists
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, serializers
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Expert, EducationalBackground, WorkExperience, PersonalDetail, Expertise, ResearchExperience, AccessRequest
from .serializers import (UserSerializer, ExpertSerializer,
                            CVBuilderSerializer, LoginSerializer,
                            PasswordResetSerializer, PasswordResetConfirmSerializer,
                            ChangePasswordSerializer, EducationalBackgroundSerializer,
                            ResearchExperienceSerializer, WorkExperienceSerializer,
                            ExpertiseSerializer, PersonalDetailSerializer, PublicExpertSerializer,ExpertDynamicSerializer,
                            LandingIndexTeaserSerializer, AccessRequestSerializer)
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.db.models import Q, Count, F
from django.db.models.functions import TruncMonth
from dateutil.relativedelta import relativedelta
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .tokens import create_jwt_pair_user
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import action
from django.contrib.auth import update_session_auth_hash
from .cv_parser import parse_full_cv
from .utils import extract_text
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import ExpertFilter
from .completeness import (
    COMPLETE_AT,
    completeness_queryset,
    evaluate as evaluate_completeness,
    summarize as summarize_completeness,
)
from rest_framework.pagination import PageNumberPagination
from django.db.models.functions import Lower  # Make sure this import is at the top

class LargeSizePagination(PageNumberPagination):
    page_size = 10000
def send_password_reset_email(email, url):
        subject = "Password Reset Request"
        message = f"Please click the following link to reset your password: {url}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        try:
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            raise RuntimeError(f"Failed to send password reset email: {e}")

class PasswordResetViewSet(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetSerializer
    def post(self, request):
        serializer = self.get_serializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email = email)
        except User.DoesNotExist:
            return Response(
                {"Detail": "user with this email does not exist."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_RESET_URL}?uid={uid}&token={token}"
        send_password_reset_email(user.email, reset_url)
        
        return Response({"detail": "Password reset email has been sent."},
                        status=status.HTTP_200_OK)

class PasswordResetConfirmView(GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, serializer.validated_data['token']):
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password has been reset successfully."},
                            status=status.HTTP_200_OK)
        else:
            return Response({"detail": "Invalid reset link."},
                            status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    @swagger_auto_schema(request_body=ChangePasswordSerializer)
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            if not user.check_password(old_password):
                return Response({
                    'old_password': ['Current password is incorrect.']
                }, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)
            user.save()
            update_session_auth_hash(request, user)
            
            return Response({
                'detail': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = UserPagination

    def get_queryset(self):


        if getattr(self.request.user, "role", None) == "admin":
            return User.objects.all()
        if self.request.user.is_authenticated:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.none()

    def get_permissions(self):
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy', 'reset_password', 'company_names', 'stats', 'toggle_active']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_staff']
    search_fields = ['first_name', 'last_name', 'email', 'company_name']
    ordering_fields = ['first_name', 'last_name', 'email', 'role', 'created_at']
    ordering = ['-created_at']

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "You do not have permission to view user statistics."},
                status=status.HTTP_403_FORBIDDEN
            )

        thirty_days_ago = now() - timedelta(days=30)
        by_role = {
            row['role']: row['count']
            for row in User.objects.values('role').annotate(count=Count('id'))
        }

        return Response({
            'total': User.objects.count(),
            'admin': by_role.get('admin', 0),
            'company': by_role.get('company', 0),
            'content_manager': by_role.get('content_manager', 0),
            'active': User.objects.filter(is_active=True).count(),
            'inactive': User.objects.filter(is_active=False).count(),
            'new_this_month': User.objects.filter(created_at__gte=thirty_days_ago).count(),
        })

    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        url_path='toggle-active'
    )
    def toggle_active(self, request, pk=None):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "You do not have permission to change user status."},
                status=status.HTTP_403_FORBIDDEN
            )

        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot deactivate your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        return Response(UserSerializer(user).data)

    @action(detail=False, methods=['get'], url_path='company-names')
    def company_names(self, request):
    
        companies = (
            User.objects
            .exclude(company_name__isnull=True)
            .exclude(company_name__exact='')
            .annotate(lower_company=Lower('company_name'))
            .values_list('lower_company', flat=True)
            .distinct()
        )
        return Response(sorted(companies))
    @action(
        detail=True,
        methods=['post'],
        permission_classes=[IsAuthenticated],  # User must be logged in
        url_path='reset-password'
    )
    def reset_password(self, request, pk=None):
        """
        Resets a user's password to the default "Dab@2025".
        Only admins can perform this action.
        """
        user = self.get_object()

        # Check if current user is admin
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "You do not have permission to reset passwords."},
                status=status.HTTP_403_FORBIDDEN
            )

        default_password = "Dab@2025"
        user.set_password(default_password)
        user.save()

        return Response({
            "message": f"Password for {user.email} has been reset to the default."
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "Only admin users can create users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "Only admin users can update users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "Only admin users can update users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response(
                {"error": "Only admin users can delete users."},
                status=status.HTTP_403_FORBIDDEN
            )
        if str(request.user.id) == str(kwargs.get('pk')):
            return Response(
                {"error": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
class LoginRateThrottle(AnonRateThrottle):
    rate = '5/min'

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    throttle_classes = [LoginRateThrottle]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            
            tokens = create_jwt_pair_user(user)
            return Response({
                "message": "Login successful",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role
                },
                "tokens": tokens
            }, status=status.HTTP_200_OK)

        return Response({
            "error": "Invalid email or password."
        }, status=status.HTTP_401_UNAUTHORIZED)

class ExpertViewSet(viewsets.ModelViewSet):
    queryset = Expert.objects.all()
    serializer_class = ExpertSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = [
    'first_name', 'last_name', 'email','registered_by',
    'first_name', 'last_name', 'email','registered_by',
    'country', 'cv_language', 'expertise_area',"countries_of_work_experience", 'is_deleted'
    ]
    filterset_class = ExpertFilter
    search_fields = ['first_name', 'last_name', 'email', 'expertise_area', 'key_words','code', 'resume_text']
    ordering_fields = ['first_name', 'last_name', 'created_at', 'updated_at']
    ordering = ['created_at']
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    # Accept multipart so a CV can be sent with the create request itself.
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # Sort keys handled in Python because the value is computed, not stored.
    COMPLETENESS_ORDERING = {"completeness": False, "-completeness": True}

    def list(self, request, *args, **kwargs):
        """Standard list, with `?ordering=completeness` handled in Python.

        DRF's OrderingFilter can only sort on database columns, and the score
        is computed across five related tables. For the completeness keys we
        therefore materialise the filtered queryset, sort by score, and
        paginate the resulting list — every other ordering key falls straight
        through to the normal path.
        """
        ordering = request.query_params.get("ordering", "")
        if ordering not in self.COMPLETENESS_ORDERING:
            return super().list(request, *args, **kwargs)

        # filter_queryset would otherwise also apply OrderingFilter and reject
        # the unknown key; it simply leaves the ordering untouched instead.
        queryset = self.filter_queryset(self.get_queryset())
        experts = sorted(
            queryset,
            key=lambda expert: evaluate_completeness(expert)["percent"],
            reverse=self.COMPLETENESS_ORDERING[ordering],
        )

        page = self.paginate_queryset(experts)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(experts, many=True).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated],
            url_path='completeness-summary')
    def completeness_summary(self, request):
        """Distribution of CV completeness across the caller's visible experts.

        Honours the same filters as the list endpoint, so the search page can
        show how the current result set breaks down rather than only the
        database as a whole.
        """
        queryset = self.filter_queryset(self.get_queryset())
        return Response(summarize_completeness(queryset))

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='databases')
    def databases(self, request):
        """Checkbox options for the "Database" filter on the search page.

        One row per company that has actually registered experts, plus a
        single synthetic "DAB" row standing in for every admin account with
        no company name of its own — the platform operator's own database,
        shown as one entry rather than one per admin user. Companies (and
        admins) that exist but have registered nobody are left out, since
        they would filter to an empty result.
        """
        visible = self.get_queryset()

        company_counts = (
            visible
            .filter(registered_by__role='company')
            .exclude(registered_by__company_name__isnull=True)
            .exclude(registered_by__company_name__exact='')
            .annotate(lower_company=Lower('registered_by__company_name'))
            .values('lower_company')
            .annotate(count=Count('id'))
            .order_by('lower_company')
        )

        options = [
            {'value': row['lower_company'], 'label': row['lower_company'], 'count': row['count']}
            for row in company_counts
        ]

        dab_count = visible.filter(registered_by__role='admin').filter(
            Q(registered_by__company_name__isnull=True) | Q(registered_by__company_name__exact='')
        ).count()

        if dab_count:
            options.insert(0, {
                'value': ExpertFilter.DAB_DATABASE,
                'label': ExpertFilter.DAB_DATABASE,
                'count': dab_count,
            })

        return Response(options)

    def create(self, request, *args, **kwargs):
        """Create an expert, rolling back entirely if an attached CV fails.

        The quick-upload flow used to POST the expert and then PATCH the CV,
        which left an expert with no CV whenever the upload failed. Wrapping
        this in a transaction means a failed CV save takes the expert with it.
        """
        with transaction.atomic():
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(registered_by=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Admin users can update any expert, company users can only update their own
        if getattr(request.user, "role", None) == "admin":
            # Admins can update any expert
            pass
        elif getattr(request.user, "role", None) == "company" and instance.registered_by == request.user:
            # Company users can update their own experts
            pass
        else:
            raise PermissionDenied("You do not have permission to update this expert.")
        # Atomic so a failed CV upload does not leave other field edits applied.
        with transaction.atomic():
            return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Admin users can update any expert, company users can only update their own
        if getattr(request.user, "role", None) == "admin":
            # Admins can update any expert
            pass
        elif getattr(request.user, "role", None) == "company" and instance.registered_by == request.user:
            # Company users can update their own experts
            pass
        else:
            raise PermissionDenied("You do not have permission to update this expert.")
        with transaction.atomic():
            return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Admin users can delete any expert, company users can only delete their own
        if getattr(request.user, "role", None) == "admin":
            # Admins can delete any expert
            pass
        elif getattr(request.user, "role", None) == "company" and instance.registered_by == request.user:
            # Company users can delete their own experts
            pass
        else:
            raise PermissionDenied("You do not have permission to delete this expert.")
        return super().destroy(request, *args, **kwargs)


    # def get_serializer_class(self):
    #     user = self.request.user

    #     # For create/update, always use full serializer
    #     if self.action in ['create', 'update', 'partial_update']:
    #         return ExpertSerializer

    #     # Super Admin → full access
    #     if getattr(user, 'role', None) == 'super_admin':
    #         return ExpertSerializer

    #     # Admin logic
    #     if getattr(user, 'role', None) == 'admin':
    #         if self.action == 'retrieve':
    #             expert = self.get_object()
    #             if expert.registered_by == user:
    #                 return ExpertSerializer  # Own expert → full info
    #             return PublicExpertSerializer  # Others → limited info
    #         return PublicExpertSerializer  # List view → only limited info

    #     # Everyone else → public serializer only
    #     return PublicExpertSerializer

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return ExpertSerializer  # full serializer for writes
        return ExpertDynamicSerializer  # dynamic for list & retrieve

    def get_queryset(self):
        """Browse/search visibility: every expert, for both roles.

        Company users see the whole database here (list, retrieve, search,
        completeness-summary) so they can find experts registered by other
        companies too. What they get back for someone else's expert is still
        cut down to name/position/experience by ExpertDynamicSerializer,
        which routes non-owned rows through PublicExpertSerializer - this
        method only controls which rows are visible at all, not which fields.

        Dashboard KPIs (stats, this-week, this-month, incomplete-cv) must NOT
        widen the same way - a company's "this week" count should stay their
        own - so those call _own_queryset() instead of this one.
        """
        queryset = super().get_queryset()
        user = self.request.user

        # Only authenticated users with proper roles can access experts
        if not hasattr(user, 'role') or user.role not in ['admin', 'company']:
            return queryset.none()

        # ALWAYS exclude experts with null registered_by (orphaned experts)
        queryset = queryset.exclude(registered_by__isnull=True)

        key_words = self.request.query_params.get('key_words')
        if key_words:
            keywords = [kw.strip() for kw in key_words.split(',')]
            queryset = queryset.filter(key_words__overlap=keywords)

        # Every serialized expert carries a cv_completeness report, which reads
        # five related tables. Without this the list view would issue five extra
        # queries per row.
        return completeness_queryset(queryset)

    def _own_queryset(self):
        """Dashboard-KPI visibility: admins see everything, company users see
        only what they registered. Starts from get_queryset() so it still
        excludes orphaned experts and honours ?key_words=, then narrows
        further for company role."""
        queryset = self.get_queryset()
        user = self.request.user
        if getattr(user, 'role', None) == 'company':
            queryset = queryset.filter(registered_by=user)
        return queryset



    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        admin_id = request.query_params.get('admin_id')
        experts = self._own_queryset()

        if admin_id:
            experts = experts.filter(registered_by_id=admin_id)

        # get_queryset() attaches the completeness prefetch for serialization.
        # Most of this endpoint only counts rows, and a prefetch on a queryset
        # that is merely aggregated still costs its extra queries whenever the
        # result set is materialised. Keep the prefetched queryset for the
        # completeness summary (which needs the relations) and count on a bare
        # one.
        counting = experts.prefetch_related(None).select_related(None)

        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)

        # ── Previous month, for the month-over-month delta on the home page ──
        last_day_prev_month = start_of_month - timedelta(days=1)
        start_of_prev_month = last_day_prev_month.replace(day=1)

        # ── 12-month registration series (oldest → newest) for the trend chart ──
        monthly_counts = (
            counting.filter(created_at__date__gte=start_of_month - relativedelta(months=11))
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(count=Count("id"))
        )
        counts_by_month = {
            row["month"].strftime("%Y-%m"): row["count"]
            for row in monthly_counts
            if row["month"]
        }
        monthly_registrations = []
        for offset in range(11, -1, -1):
            bucket = start_of_month - relativedelta(months=offset)
            key = bucket.strftime("%Y-%m")
            monthly_registrations.append({
                "month": key,
                "label": bucket.strftime("%b"),
                "count": counts_by_month.get(key, 0),
            })

        # ── Experts whose CV has not been refreshed in over a year ──
        stale_cutoff = today - relativedelta(months=12)
        # Preview only — five rows of scalar fields, so skip the prefetch and
        # fetch just the columns the payload below reads.
        stale_experts = (
            counting.filter(updated_at__date__lt=stale_cutoff)
            .only("id", "first_name", "last_name", "expertise_area", "country", "updated_at")
            .order_by("updated_at")
        )
        outdated_preview = [
            {
                "id": expert.id,
                "first_name": expert.first_name,
                "last_name": expert.last_name,
                "expertise_area": expert.expertise_area or "",
                "country": expert.country or "",
                "updated_at": expert.updated_at,
                "months_stale": max(
                    0,
                    (today.year - expert.updated_at.date().year) * 12
                    + today.month - expert.updated_at.date().month,
                ),
            }
            for expert in stale_experts[:5]
        ]

        # ── Expert counters in one pass ──
        # These were eight separate .count() calls, i.e. eight scans of the
        # same rows. Conditional aggregates collapse them into a single query
        # over one scan; the numbers are identical.
        expert_counts = counting.aggregate(
            total_experts=Count("id"),
            registered_today=Count("id", filter=Q(created_at__date=today)),
            registered_this_week=Count("id", filter=Q(created_at__date__gte=start_of_week)),
            registered_this_month=Count("id", filter=Q(created_at__date__gte=start_of_month)),
            registered_this_year=Count("id", filter=Q(created_at__date__gte=start_of_year)),
            registered_prev_month=Count(
                "id",
                filter=Q(
                    created_at__date__gte=start_of_prev_month,
                    created_at__date__lt=start_of_month,
                ),
            ),
            # An expert counts as "updated" once it has been touched after creation.
            updated_count=Count("id", filter=~Q(updated_at__date=F("created_at__date"))),
            outdated_cv_count=Count("id", filter=Q(updated_at__date__lt=stale_cutoff)),
        )

        # ── User counters in one pass ──
        user_counts = User.objects.aggregate(
            company_users_count=Count("id", filter=Q(role="company")),
            admin_users_count=Count("id", filter=Q(role="admin")),
        )

        data = {
            **expert_counts,
            "outdated_cv_preview": outdated_preview,
            # Same scorer the search badges use, so the two never disagree.
            "cv_completeness": summarize_completeness(experts),
            "monthly_registrations": monthly_registrations,
            **user_counts,
            "companies_count": User.objects.exclude(company_name__isnull=True).exclude(company_name__exact="").values("company_name").distinct().count(),
            "recent_users": list(
                User.objects.order_by("-created_at").values(
                    "id", "first_name", "last_name", "email", "role", "company_name", "created_at"
                )[:5]
            ),
        }

        return Response(data)
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='this-month')
    def experts_this_month(self, request):
        today = now().date()
        start_of_month = today.replace(day=1)

        # Explicit ordering: paginating an unordered queryset lets Postgres
        # return rows in any order per page, so a record can appear twice or
        # not at all. Newest first also matches what this page is asking for.
        experts = self._own_queryset().filter(
            created_at__date__gte=start_of_month
        ).order_by('-created_at')

        page = self.paginate_queryset(experts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(experts, many=True)
        return Response(serializer.data) 
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='this-week')
    def experts_this_week(self, request):
        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())

        experts = self._own_queryset().filter(
            created_at__date__gte=start_of_week
        ).order_by('-created_at')

        page = self.paginate_queryset(experts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(experts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated], url_path='incomplete-cv')
    def incomplete_cv(self, request):
        """Experts whose CV falls short of the completeness threshold.

        This used to mean "has no CV sections at all", which hid the far more
        common case: a record with some sections filled and real gaps in the
        rest. It now uses the same weighted score the rest of the app shows,
        so this page and the search badges can never disagree.

        `?threshold=` overrides the cut-off (default: anything not complete),
        and results are ordered emptiest-first so the worst records lead.
        """
        try:
            threshold = float(request.query_params.get('threshold', COMPLETE_AT))
        except (TypeError, ValueError):
            threshold = COMPLETE_AT

        scored = [
            (expert, evaluate_completeness(expert)["percent"])
            for expert in self._own_queryset()
        ]
        experts = [
            expert
            for expert, percent in sorted(scored, key=lambda pair: pair[1])
            if percent < threshold
        ]

        page = self.paginate_queryset(experts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(experts, many=True)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='parse-cv'
    )
    def parse_cv(self, request):
        """Parse a CV and return the extracted fields WITHOUT saving anything.

        This backs the quick-upload flow, where the file is dropped first and
        the operator reviews what was found before a record is created.
        `upload_cv` still handles the parse-and-save path.
        """
        uploaded_file = request.FILES.get("cv_file")
        if not uploaded_file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)

        suffix = os.path.splitext(uploaded_file.name)[1].lower() or ".docx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        try:
            if suffix == ".pdf":
                # PDF carries no table structure PyPDF2 can read, so this
                # parses on plain text only — personal info, publications,
                # and countries of work experience. Education/employment/
                # certifications/research/languages stay empty; the DOCX
                # path below still gets those from its tables.
                pdf_text = extract_text(temp_path, filename=uploaded_file.name)
                if not pdf_text.strip():
                    raise ValueError("No extractable text in PDF")
                parsed = parse_full_cv(raw_text=pdf_text)
            else:
                parsed = parse_full_cv(docx_path=temp_path)
        except Exception as e:
            print(f"Error parsing CV: {e}")
            return Response(
                {"error": "Could not read that CV. Check the file and try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        expert = parsed.get("expert", {}) or {}
        detail = parsed.get("personal_detail", {}) or {}

        def as_text(value):
            if isinstance(value, (list, tuple)):
                return ", ".join(str(v) for v in value if v)
            return value or ""

        # Only fields the parser actually produces. It does NOT extract
        # nationality or years of experience, so those stay for the operator
        # to fill and the UI flags them as missing.
        fields = {
            "first_name": expert.get("first_name") or "",
            "last_name": expert.get("last_name") or "",
            "email": expert.get("email") or detail.get("email") or "",
            "country": expert.get("country") or detail.get("country") or "",
            "cv_language": expert.get("cv_language") or "",
            "expertise_area": as_text(expert.get("expertise_area")),
            "language_skills": expert.get("language_skills") or [],
            "countries_of_work_experience": as_text(
                expert.get("countries_of_work_experience")
            ),
            "current_position": detail.get("current_position") or "",
            "phone_number": detail.get("phone_number") or "",
        }
        extracted = [k for k, v in fields.items() if v not in (None, "", [])]

        return Response({
            "fields": fields,
            "extracted": extracted,
            "extracted_count": len(extracted),
            # Counts give the operator a sense of what else is in the file.
            "counts": {
                "education": len(parsed.get("education") or []),
                "work_experience": len(parsed.get("work_experience") or []),
                "research_experience": len(parsed.get("research_experience") or []),
            },
        })

    @action(
        detail=False,
        methods=['post'],
        permission_classes=[IsAuthenticated],
        parser_classes=[MultiPartParser, FormParser],
        url_path='upload_cv'
    )
    def upload_cv(self, request):
        uploaded_file = request.FILES.get("cv_file")
        if not uploaded_file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        expert_id = request.data.get("expert_id")  # get expert id from POST data
        if not expert_id:
            return Response({"error": "Expert id is required."}, status=status.HTTP_400_BAD_REQUEST)
    
        suffix = os.path.splitext(uploaded_file.name)[1].lower() or ".docx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        uploaded_file.seek(0)

        try:
            if suffix == ".pdf":
                pdf_text = extract_text(temp_path, filename=uploaded_file.name)
                if not pdf_text.strip():
                    raise ValueError("No extractable text in PDF")
                parsed_data = parse_full_cv(raw_text=pdf_text)
            else:
                parsed_data = parse_full_cv(docx_path=temp_path)

        except Exception as e:
            os.remove(temp_path)
            print(f"Error parsing CV: {e}")
            return Response({"error": f"Failed to parse CV: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

        try:
            with transaction.atomic():
                expert = self._save_parsed_data(parsed_data, uploaded_file, request.user,expert_id)
                return Response({
                    "message": "CV parsed and expert created successfully.",
                    "expert_id": expert.id
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error saving parsed data to DB: {e}") 
            return Response({"error": f"Saving to DB failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _save_parsed_data(self, data, cv_file, user, expert_id=None):
        expert_data = data["expert"]
        # language_skills_json = json.dumps(expert_data.get("language_skills", []))
        language_skills_json = expert_data.get("language_skills", [])

        print("cv_file: ",cv_file)

          
        if expert_id:
            try:
                expert = Expert.objects.get(pk=expert_id)
                print(f"Updating existing expert: {expert_id}")

                expert.first_name = expert.first_name or expert_data.get("first_name")
                expert.last_name = expert.last_name or expert_data.get("last_name")
                expert.email = expert.email or expert_data.get("email")
                expert.cv_language = expert.cv_language or expert_data.get("cv_language")
                expert.country = expert.country or expert_data.get("country")
                expert.expertise_area = expert.expertise_area or expert_data.get("expertise_area")
                expert.publications = expert.publications or expert_data.get("publications")
                expert.journals = expert.journals or expert_data.get("journals")
                expert.learning_module = expert.learning_module or expert_data.get("learning_module")
                expert.books = expert.books or expert_data.get("books")
                expert.language_skills =  language_skills_json
                expert.countries_of_work_experience = ", ".join(expert_data.get("countries_of_work_experience", [])) or expert.countries_of_work_experience
                if cv_file:
                    # For local storage, just assign the file directly
                    expert.cv_file = cv_file
                expert.registered_by = expert.registered_by or user

                expert.save()
            except Expert.DoesNotExist:
                print(f"Expert ID {expert_id} not found. Creating new expert.")
                expert = None
        else:
            expert = None

        if not expert:
            print("Creating new expert...")
            expert = Expert.objects.create(
                first_name=expert_data.get("first_name"),
                last_name=expert_data.get("last_name"),
                email=expert_data.get("email"),
                cv_language=expert_data.get("cv_language"),
                country=expert_data.get("country"),
                expertise_area=expert_data.get("expertise_area"),
                publications=expert_data.get("publications"),
                journals=expert_data.get("journals"),
                learning_module=expert_data.get("learning_module"),
                books=expert_data.get("books"),
                language_skills=language_skills_json,
                countries_of_work_experience=", ".join(expert_data.get("countries_of_work_experience", [])),
                cv_file=cv_file,
                registered_by=user
            )

        # Handle Personal Detail
        personal = data["personal_detail"]
        personal_detail, _ = PersonalDetail.objects.get_or_create(expert=expert)

        personal_detail.date_of_birth = personal_detail.date_of_birth or personal.get("date_of_birth")
        personal_detail.gender = personal_detail.gender or personal.get("gender") or "unspecified"
        personal_detail.country = personal_detail.country or personal.get("country")
        personal_detail.phone_number = personal_detail.phone_number or personal.get("phone_number")
        personal_detail.email = personal_detail.email or personal.get("email")
        personal_detail.cv_language = personal_detail.cv_language or personal.get("cv_language")
        personal_detail.current_position = personal_detail.current_position or personal.get("current_position")
        personal_detail.name_suffix = personal_detail.name_suffix or personal.get("name_suffix")
        personal_detail.save()

        # ---------- EDUCATION ----------
        educations = list(EducationalBackground.objects.filter(expert=expert))
        
        EducationalBackground.objects.filter(expert=expert).delete()

        for edu in data.get("education", []):
            print("Creating Education:", edu)
            EducationalBackground.objects.create(expert=expert, **edu)

        # ---------- WORK EXPERIENCE ----------
        works = list(WorkExperience.objects.filter(expert=expert))
        print("Deleting WorkExperience records:")
        for work in works:
            print(vars(work))
        WorkExperience.objects.filter(expert=expert).delete()

        for cert in data.get("certifications", []):
            work_data = {
                "position_title": cert.get("field_of_training", "Certification"),
                "organization_name": cert.get("place"),
                "start_date": cert.get("start_date"),
                "end_date": cert.get("end_date"),
                "country": None,
                "responsibilities": cert.get("description", cert.get("field_of_training")),
                "typee": cert.get("typee", "certification"),
                "description": cert.get("description", cert.get("field_of_training"))
            }
            print("Creating WorkExperience:", work_data)
            WorkExperience.objects.create(expert=expert, **work_data)

        # ---------- RESEARCH EXPERIENCE ----------
        researches = list(ResearchExperience.objects.filter(expert=expert))
        print("Deleting ResearchExperience records:")
        for res in researches:
            print(vars(res))        # Save actual work experiences (with typee = "work_experience")
        for work in data.get("work_experience", []):
            WorkExperience.objects.create(
                expert=expert,
                position_title=work.get("position_title"),
                organization_name=work.get("organization_name"),
                start_date=work.get("start_date"),
                end_date=work.get("end_date"),
                country=work.get("country"),
                responsibilities=work.get("responsibilities"),
                typee=work.get("typee", "work_experience"),
                description=work.get("responsibilities")
            )
        ResearchExperience.objects.filter(expert=expert).delete()

        for res in data.get("research_experience", []):
            print("Creating ResearchExperience:", res)
            ResearchExperience.objects.create(expert=expert, **res)

        # ---------- EXPERTISE ----------
        Expertise.objects.filter(expert=expert).delete()
        fields = [edu["field_of_study"] for edu in data.get("education", []) if edu.get("field_of_study")]
        if fields:
            key_words_str = ", ".join(list(set(fields)))
            print("Creating Expertise with keywords:", key_words_str)
            Expertise.objects.create(expert=expert, specialization=key_words_str, key_words=key_words_str)
        # --- NEW LOGIC FOR CALCULATING AND STORING TOTAL YEARS OF EXPERIENCE ---
        # year_of_experience = 0.0

        # # Calculate from Work Experience
        # for work_exp in WorkExperience.objects.filter(expert=expert):
        #     if work_exp.start_date and work_exp.end_date:
        #         duration = work_exp.end_date - work_exp.start_date
        #         year_of_experience += (duration.days / 365.25) # Approximate years

        # # Calculate from Research Experience
        # for research_exp in ResearchExperience.objects.filter(expert=expert):
        #     if research_exp.start_date and research_exp.end_date:
        #         duration = research_exp.end_date - research_exp.start_date
        #         year_of_experience += (duration.days / 365.25) # Approximate years
        date_ranges = []

    # Collect date ranges from WorkExperience and ResearchExperience
        for model in [WorkExperience, ResearchExperience]:
            for entry in model.objects.filter(expert=expert):
                if entry.start_date and entry.end_date and entry.end_date >= entry.start_date:
                    date_ranges.append((entry.start_date, entry.end_date))

    # Sort by start_date
        date_ranges.sort()

    # Merge overlapping/adjacent ranges
        merged_ranges = []
        for start, end in date_ranges:
            if not merged_ranges:
                merged_ranges.append((start, end))
            else:
                last_start, last_end = merged_ranges[-1]
                if start <= last_end + timedelta(days=1):  # Overlapping or touching
                    merged_ranges[-1] = (last_start, max(last_end, end))
                else:
                    merged_ranges.append((start, end))

        # Sum total days
        total_days = sum((end - start).days for start, end in merged_ranges)
        total_years = round(total_days / 365.25, 2)
        # Update the expert instance with the calculated total years of experience

        # and run migrations for this to work.
        expert.year_of_experience = int(total_years)
        expert.save()
        # --- END NEW LOGIC ---
        return expert

class CVBuilderAPIView(APIView):
    serializer_class = CVBuilderSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self, expert_id):
        try:
            return Expert.objects.get(id=expert_id)
        except Expert.DoesNotExist:
            return None

    @swagger_auto_schema(responses={200: CVBuilderSerializer})
    def get(self, request, expert_id):
        expert = self.get_object(expert_id)
        if not expert:
            return Response({"error": "Expert not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = CVBuilderSerializer(expert)
        return Response(serializer.data)

    @swagger_auto_schema(request_body=CVBuilderSerializer, responses={201: CVBuilderSerializer})
    def post(self, request, expert_id):
        try:
            expert = Expert.objects.get(id=expert_id)
            serializer = CVBuilderSerializer(
                data=request.data,
                context={'expert': expert}
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "status": "success",
                    "expert_id": expert.id,
                    "sections_updated": list(request.data.keys())
                }, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Expert.DoesNotExist:
            return Response(
                {"error": "Expert not found"},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @swagger_auto_schema(request_body=CVBuilderSerializer, responses={200: CVBuilderSerializer})
    def put(self, request, expert_id):
        expert = self.get_object(expert_id)
        if not expert:
            return Response({"error": "Expert not found"}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        data['expert_id'] = expert_id
        serializer = CVBuilderSerializer(expert, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(request_body=CVBuilderSerializer, responses={200: CVBuilderSerializer})
    def patch(self, request, expert_id):
        expert = self.get_object(expert_id)
        if not expert:
            return Response({"error": "Expert not found"}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        data['expert_id'] = expert_id
        serializer = CVBuilderSerializer(expert, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpertOwnershipMixin:
    """Shared write-guard for the nested per-expert viewsets below.

    All writes to an expert's education/experience/expertise/personal-detail
    records require owning that expert (or being admin) - the parent
    ExpertViewSet already enforces this for the expert record itself; these
    child endpoints previously had no such check at all, so any authenticated
    company user could create/update/delete another company's expert's
    records by posting to the nested URL directly.
    """

    def _check_expert_owned(self, expert_pk):
        user = self.request.user
        if getattr(user, "role", None) == "admin":
            return
        expert = Expert.objects.filter(pk=expert_pk).first()
        if not expert or expert.registered_by_id != getattr(user, "id", None):
            raise PermissionDenied("You do not have permission to modify this expert's record.")

    def perform_create(self, serializer):
        expert_pk = self.kwargs['expert_pk']
        self._check_expert_owned(expert_pk)
        serializer.save(expert_id=expert_pk)

    def perform_update(self, serializer):
        self._check_expert_owned(self.kwargs['expert_pk'])
        serializer.save()

    def perform_destroy(self, instance):
        self._check_expert_owned(self.kwargs['expert_pk'])
        instance.delete()


class AccessRequestViewSet(viewsets.ModelViewSet):
    """Requests from a company to unlock one expert's contact info + CV.

    Company users: see and create only their own requests, for experts they
    did not already register (registering an expert already gives full
    access to it - a request would be pointless). Cannot set price/status
    themselves; create is the only thing they can do besides read.

    Admins: see every request and act on it via the price/reject/mark_paid
    actions below, which are the only way status ever changes - there is no
    generic PATCH-the-status path, so every transition is explicit and
    auditable (reviewed_by + admin_note).
    """

    queryset = AccessRequest.objects.select_related('expert', 'requested_by', 'reviewed_by')
    serializer_class = AccessRequestSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']  # no generic PATCH/PUT/DELETE
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['expert', 'status']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if getattr(user, "role", None) == "admin":
            return queryset
        return queryset.filter(requested_by=user)

    def perform_create(self, serializer):
        expert = serializer.validated_data.get('expert')
        user = self.request.user

        if expert.registered_by_id == user.id:
            raise serializers.ValidationError(
                {"expert": "You already have full access to an expert you registered."}
            )

        existing = AccessRequest.objects.filter(
            expert=expert, requested_by=user, status__in=['pending', 'priced']
        ).first()
        if existing:
            raise serializers.ValidationError(
                {"expert": "You already have an open request for this expert."}
            )
        if AccessRequest.objects.filter(expert=expert, requested_by=user, status='paid').exists():
            raise serializers.ValidationError(
                {"expert": "You already have paid access to this expert."}
            )

        serializer.save(requested_by=user)

    def _require_admin(self):
        if getattr(self.request.user, "role", None) != "admin":
            raise PermissionDenied("Only an admin can act on access requests.")

    @action(detail=True, methods=['post'])
    def price(self, request, pk=None):
        """Admin sets a price, moving pending → priced."""
        self._require_admin()
        access_request = self.get_object()
        if access_request.status not in ('pending', 'priced'):
            return Response(
                {"detail": f"Cannot price a request that is already {access_request.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        price_value = request.data.get('price')
        try:
            price_value = float(price_value)
            if price_value <= 0:
                raise ValueError
        except (TypeError, ValueError):
            return Response({"price": ["A positive price is required."]}, status=status.HTTP_400_BAD_REQUEST)

        access_request.price = price_value
        access_request.status = 'priced'
        access_request.reviewed_by = request.user
        access_request.admin_note = request.data.get('admin_note', access_request.admin_note)
        access_request.save()
        return Response(AccessRequestSerializer(access_request, context={"request": request}).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Admin declines the request. Requester may file a new one later."""
        self._require_admin()
        access_request = self.get_object()
        if access_request.status == 'paid':
            return Response(
                {"detail": "Cannot reject a request that has already been paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        access_request.status = 'rejected'
        access_request.reviewed_by = request.user
        access_request.admin_note = request.data.get('admin_note', access_request.admin_note)
        access_request.save()
        return Response(AccessRequestSerializer(access_request, context={"request": request}).data)

    @action(detail=True, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        """Admin confirms an offline/manual payment. Grants access."""
        self._require_admin()
        access_request = self.get_object()
        if access_request.status != 'priced':
            return Response(
                {"detail": "Only a priced request can be marked paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        access_request.status = 'paid'
        access_request.paid_at = now()
        access_request.reviewed_by = request.user
        access_request.save()
        return Response(AccessRequestSerializer(access_request, context={"request": request}).data)


class EducationalBackgroundViewSet(ExpertOwnershipMixin, viewsets.ModelViewSet):
    queryset = EducationalBackground.objects.all()
    serializer_class = EducationalBackgroundSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return EducationalBackground.objects.none()
        return EducationalBackground.objects.filter(expert_id=expert_pk)

class WorkExperienceViewSet(ExpertOwnershipMixin, viewsets.ModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return WorkExperience.objects.none()
        return WorkExperience.objects.filter(expert_id=expert_pk)

class PersonalDetailViewSet(ExpertOwnershipMixin, viewsets.ModelViewSet):
    queryset = PersonalDetail.objects.all()
    serializer_class = PersonalDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Personal detail carries phone + date of birth, unlike the other
        nested resources - so unlike them, this one is also locked for READS,
        not just writes: a company user can only ever fetch this for an
        expert they registered (or as admin)."""
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return PersonalDetail.objects.none()
        queryset = PersonalDetail.objects.filter(expert_id=expert_pk)
        user = self.request.user
        if getattr(user, "role", None) != "admin":
            queryset = queryset.filter(expert__registered_by_id=getattr(user, "id", None))
        return queryset

class ResearchExperienceViewSet(ExpertOwnershipMixin, viewsets.ModelViewSet):
    queryset = ResearchExperience.objects.all()
    serializer_class = ResearchExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return ResearchExperience.objects.none()
        return ResearchExperience.objects.filter(expert_id=expert_pk)

class ExpertiseViewSet(ExpertOwnershipMixin, viewsets.ModelViewSet):
    queryset = Expertise.objects.all()
    serializer_class = ExpertiseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return Expertise.objects.none()
        return Expertise.objects.filter(expert_id=expert_pk)

class ExpertSearchView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data
        queryset = Expert.objects.all()
        if 'nationality' in data:
            queryset = queryset.filter(nationality__icontains=data['nationality'])
        if 'first_name' in data:
            queryset = queryset.filter(first_name__icontains=data['first_name'])
        if 'last_name' in data:
            queryset = queryset.filter(last_name__icontains=data['last_name'])
        if 'expertise_area' in data:
            queryset = queryset.filter(expertise_area__icontains=data['expertise_area'])
        if 'specialization' in data:
            queryset = queryset.filter(expertise__specialization__icontains=data['specialization'])

        if 'key_words' in data and isinstance(data['key_words'], list) and data['key_words']:
            queryset = queryset.filter(key_words__overlap=data['key_words'])

        # ExpertSerializer walks five related tables per row (work, education,
        # research, expertise, personal detail) plus the completeness report.
        # Without the prefetch this issued a query per relation per result.
        queryset = completeness_queryset(queryset.distinct())

        serializer = ExpertSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class PublicLandingIndexThrottle(AnonRateThrottle):
    """Dedicated, tighter budget for the unauthenticated landing endpoint."""
    scope = 'landing_index'


class PublicLandingIndexView(APIView):
    """Aggregate counts + anonymised teaser rows for the public landing page.

    This is the ONLY expert endpoint reachable without authentication, so it
    returns no personally identifying data — see LandingIndexTeaserSerializer.
    Response shape:

        {
          "totals":  {"experts": int, "countries": int, "sectors": int},
          "samples": [{"code", "sector", "country", "seniority"}, ...]
        }
    """

    permission_classes = [AllowAny]
    authentication_classes = []          # never touch auth headers here
    throttle_classes = [PublicLandingIndexThrottle]

    SAMPLE_SIZE = 24

    def get(self, request):
        visible = Expert.objects.filter(is_deleted=False)

        countries = (
            visible.exclude(country__exact="")
                   .values_list("country", flat=True)
                   .distinct()
                   .count()
        )
        sectors = (
            visible.exclude(expertise_area__isnull=True)
                   .exclude(expertise_area__exact="")
                   .values_list("expertise_area", flat=True)
                   .distinct()
                   .count()
        )

        # newest first so the strip feels live, capped so the public page
        # can never be used to enumerate the database
        samples = visible.order_by("-created_at")[: self.SAMPLE_SIZE]

        return Response({
            "totals": {
                "experts": visible.count(),
                "countries": countries,
                "sectors": sectors,
            },
            "samples": LandingIndexTeaserSerializer(samples, many=True).data,
        })
