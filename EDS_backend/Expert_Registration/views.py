import os
import tempfile
from django.utils.timezone import now
from datetime import timedelta
import json # Import json for serializing lists
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from .models import User, Expert, EducationalBackground, WorkExperience, PersonalDetail, Expertise, ResearchExperience
from .serializers import (UserSerializer, ExpertSerializer,
                            CVBuilderSerializer, LoginSerializer,
                            PasswordResetSerializer, PasswordResetConfirmSerializer,
                            ChangePasswordSerializer, EducationalBackgroundSerializer, 
                            ResearchExperienceSerializer, WorkExperienceSerializer,
                            ExpertiseSerializer, PersonalDetailSerializer, PublicExpertSerializer,ExpertDynamicSerializer)
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from django.db.models import Q
from django.db.models import Q
from django.db import transaction
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .tokens import create_jwt_pair_user
from rest_framework.generics import GenericAPIView
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import action
from django.contrib.auth import update_session_auth_hash
from .cv_parser import parse_full_cv
from rest_framework.filters import SearchFilter, OrderingFilter
from .filters import ExpertFilter
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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        
        
        if getattr(self.request.user, "role", None) == "admin":
            return User.objects.all()
        if self.request.user.is_authenticated:
            return User.objects.filter(id=self.request.user.id)
        return User.objects.none()

    def get_permissions(self):
        if self.action in ['list', 'create', 'update', 'partial_update', 'destroy', 'reset_password', 'company_names']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_staff']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['first_name', 'last_name', 'email', 'role']
    ordering = ['-id']
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
        queryset = super().get_queryset()
        user = self.request.user
        
        # Only authenticated users with proper roles can access experts
        if not hasattr(user, 'role') or user.role not in ['admin', 'company']:
            return queryset.none()
        
        # ALWAYS exclude experts with null registered_by (orphaned experts)
        queryset = queryset.exclude(registered_by__isnull=True)
        
        # Admin users see all experts (except orphaned ones)
        if user.role == 'admin':
            # Admins can see all experts from all companies
            pass  # No additional filtering needed
        elif user.role == 'company':
            # Company users only see experts they registered
            queryset = queryset.filter(registered_by=user)
        
        key_words = self.request.query_params.get('key_words')
        if key_words:
            keywords = [kw.strip() for kw in key_words.split(',')]
            queryset = queryset.filter(key_words__overlap=keywords)
        
        return queryset



    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        admin_id = request.query_params.get('admin_id')
        experts = self.get_queryset()

        if admin_id:
            experts = experts.filter(registered_by_id=admin_id)

        today = now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        start_of_year = today.replace(month=1, day=1)

        data = {
            "total_experts": experts.count(),
            "registered_today": experts.filter(created_at__date=today).count(),
            "registered_this_week": experts.filter(created_at__date__gte=start_of_week).count(),
            "registered_this_month": experts.filter(created_at__date__gte=start_of_month).count(),
            "registered_this_year": experts.filter(created_at__date__gte=start_of_year).count(),
            "company_users_count": User.objects.filter(role="company").count(),
            "admin_users_count": User.objects.filter(role="admin").count(),
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

        experts = self.get_queryset().filter(created_at__date__gte=start_of_month)

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
        
        experts = self.get_queryset().filter(created_at__date__gte=start_of_week)

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
        url_path='upload_cv'
    )
    def upload_cv(self, request):
        uploaded_file = request.FILES.get("cv_file")
        if not uploaded_file:
            return Response({"error": "No file uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        expert_id = request.data.get("expert_id")  # get expert id from POST data
        if not expert_id:
            return Response({"error": "Expert id is required."}, status=status.HTTP_400_BAD_REQUEST)
    
        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)
            temp_path = temp_file.name

        uploaded_file.seek(0)

        try:
            parsed_data = parse_full_cv(temp_path)


        except Exception as e:
            os.remove(temp_path)
            print(f"Error parsing CV: {e}") 
            return Response({"error": f"Failed to parse CV: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        finally:
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

class EducationalBackgroundViewSet(viewsets.ModelViewSet):
    queryset = EducationalBackground.objects.all()
    serializer_class = EducationalBackgroundSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination


    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return EducationalBackground.objects.none()
        return EducationalBackground.objects.filter(expert_id=expert_pk)

    def perform_create(self, serializer):
        expert = Expert.objects.get(pk=self.kwargs['expert_pk'])
        serializer.save(expert=expert)

class WorkExperienceViewSet(viewsets.ModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return WorkExperience.objects.none()
        return WorkExperience.objects.filter(expert_id=expert_pk)


    def perform_create(self, serializer):
        expert = Expert.objects.get(pk=self.kwargs['expert_pk'])
        serializer.save(expert=expert)

class PersonalDetailViewSet(viewsets.ModelViewSet):
    queryset = PersonalDetail.objects.all()
    serializer_class = PersonalDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return PersonalDetail.objects.none()
        return PersonalDetail.objects.filter(expert_id=expert_pk)

    def perform_create(self, serializer):
        expert = Expert.objects.get(pk=self.kwargs['expert_pk'])
        serializer.save(expert=expert)

class ResearchExperienceViewSet(viewsets.ModelViewSet):
    queryset = ResearchExperience.objects.all()
    serializer_class = ResearchExperienceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = LargeSizePagination

    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return ResearchExperience.objects.none()
        return ResearchExperience.objects.filter(expert_id=expert_pk)

    def perform_create(self, serializer):
        expert = Expert.objects.get(pk=self.kwargs['expert_pk'])
        serializer.save(expert=expert)

class ExpertiseViewSet(viewsets.ModelViewSet):
    queryset = Expertise.objects.all()
    serializer_class = ExpertiseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        expert_pk = self.kwargs.get('expert_pk')
        if expert_pk is None:
            return Expertise.objects.none()
        return Expertise.objects.filter(expert_id=expert_pk)

    def perform_create(self, serializer):
        expert = Expert.objects.get(pk=self.kwargs['expert_pk'])
        serializer.save(expert=expert)

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

        queryset = queryset.distinct()
        
        serializer = ExpertSerializer(queryset, many=True)
        return Response(serializer.data)