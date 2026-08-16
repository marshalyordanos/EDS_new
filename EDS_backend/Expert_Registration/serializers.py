from rest_framework import serializers
from django.contrib.auth import authenticate
from django.forms import ValidationError
from django.core.validators import FileExtensionValidator
from django.contrib.auth.password_validation import validate_password
from . models import ( User,
                    Expert,
                    PersonalDetail,
                    EducationalBackground,
                    WorkExperience,
                    Expertise,
                    ResearchExperience,
                    AccessRequest
                    )
from .completeness import evaluate as evaluate_completeness


class CompletenessMixin(serializers.Serializer):
    """Adds the read-only `cv_completeness` field.

    Subclasses Serializer rather than being a plain mixin: DRF collects
    declared fields via its serializer metaclass, so a field declared on a
    bare object is invisible and the name falls through to model
    introspection, which then fails on an attribute the model does not have.

    Carries the full section breakdown even in list responses: the search
    results let you click a score and see exactly what is missing, and that
    drill-down has to be answerable without a second round trip per row.
    Scoring is pure Python over prefetched relations — see
    `completeness.completeness_queryset`, which every listing view applies.
    """

    cv_completeness = serializers.SerializerMethodField()

    def get_cv_completeness(self, obj):
        return evaluate_completeness(obj)

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField()
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        help_text="Current password"
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        min_length=8,
        help_text="New password (minimum 8 characters)"
    )
    

    def validate(self, attrs):
        new_password = attrs.get('new_password')
        
        old_password = attrs.get('old_password')
        if new_password == old_password:
            raise serializers.ValidationError({
                'new_password': 'New password must be different from old password.'
            })
        try:
            validate_password(new_password)
        except ValidationError as e:
            raise serializers.ValidationError({
                'new_password': e.messages
            })
        
        return attrs

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,       # ✅ make optional
        allow_blank=True,     # ✅ allow blank input
        min_length=0          # ✅ disable blank validation error
    )

    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'password',
            'role', 'company_name', 'is_active', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'password': {'required': False, 'allow_blank': True},
            'company_name': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        role = attrs.get('role') or getattr(self.instance, 'role', None)
        company_name = attrs.get('company_name', '').strip()
        if role == 'company' and not company_name:
            raise serializers.ValidationError({'company_name': 'Company name is required for company users.'})
        return attrs

    def create(self, validated_data):
        # If password not provided or blank, use default
        password = validated_data.pop('password', None)
        if not password:
            password = "Dab@2025"

        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password.")
        data['user'] = user
        return data

def validate_file_size(value):
    limit = 5 * 1024 * 1024
    if value.size > limit:
        raise ValidationError("File size too large. File size should not exceed 5MB.")


class PersonalDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalDetail
        fields = '__all__'
        extra_kwargs = {
            'expert': {'required': False}
        }


class EducationalBackgroundSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationalBackground
        fields = '__all__'
        extra_kwargs = {
            'expert': {'required': False}
        }

class WorkExperienceSerializer(serializers.ModelSerializer):
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=False)
    class Meta:
        model = WorkExperience
        fields = '__all__'
        extra_kwargs = {
            'expert': {'required': False}
        }
        
    # def validate(self, data):
    #     if data.get('end_date') and data['end_date'] < data['start_date']:
    #         raise serializers.ValidationError(
    #             {"end_date": "Must be after start date"}
    #         )
    #     return data


class ExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expertise
        fields = '__all__'
        extra_kwargs = {
            'expert': {'required': False}
        }


class ResearchExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchExperience
        fields = '__all__'
        extra_kwargs = {
            'expert': {'required': False}
        }

class CVBuilderSerializer(serializers.Serializer):
    expert_id = serializers.IntegerField(required=True, write_only=True)
    personal_detail = PersonalDetailSerializer(required=False)
    education = EducationalBackgroundSerializer(many=True, required=False)
    experience = WorkExperienceSerializer(many=True, required=False)
    expertise = ExpertiseSerializer(required=False)
    research_experience = ResearchExperienceSerializer(many= True, required = False)
    
    def validate_expert_id(self, value):
        if not Expert.objects.filter(id=value).exists():
            raise serializers.ValidationError("Expert does not exist")
        return value

    def create(self, validated_data):
        expert = Expert.objects.get(id=validated_data['expert_id'])
        if 'personal_detail' in validated_data:
            PersonalDetail.objects.create(expert=expert, **validated_data['personal_detail'])
        
        if 'education' in validated_data:
            for edu in validated_data['education']:
                EducationalBackground.objects.create(expert=expert, **edu)
        
        if 'experience' in validated_data:
            for exp in validated_data['experience']:
                WorkExperience.objects.create(expert=expert, **exp)
        
        if 'expertise' in validated_data:
            Expertise.objects.create(expert=expert, **validated_data['expertise'])
        
        if 'research_experience' in validated_data:
            for research_exp in validated_data['research_experience']:
                ResearchExperience.objects.create(expert=expert, **research_exp)
        
        return expert

    def to_representation(self, instance):
        data = {
            "expert_id": instance.id,
            
            "personal_detail": PersonalDetailSerializer(
                getattr(instance, "personaldetail", None)
            ).data if hasattr(instance, "personaldetail") else None,
            
            "education": EducationalBackgroundSerializer(
                instance.educationalbackground_set.all(), many=True
            ).data,
            
            "experience": WorkExperienceSerializer(
                instance.workexperience_set.all(), many=True
            ).data,

            "expertise": ExpertiseSerializer(
                instance.expertise_set.all(), many=True
            ).data,

            "research_experience": ResearchExperienceSerializer(
                instance.researchexperience_set.all(), many=True
            ).data,
        }
        return data
    
    def update(self, instance, validated_data):
        personal_detail_data = validated_data.get("personal_detail")
        if personal_detail_data:
            PersonalDetail.objects.update_or_create(
                expert=instance, defaults=personal_detail_data
            )

        education_data = validated_data.get("education")
        if education_data is not None:
            instance.educationalbackground_set.all().delete()
            for edu in education_data:
                EducationalBackground.objects.create(expert=instance, **edu)

        experience_data = validated_data.get("experience")
        if experience_data is not None:
            instance.workexperience_set.all().delete()
            for exp in experience_data:
                WorkExperience.objects.create(expert=instance, **exp)

        expertise_data = validated_data.get("expertise")
        if expertise_data:
            Expertise.objects.update_or_create(
                expert=instance, defaults=expertise_data
            )

        research_experience_data = validated_data.get("research_experience")
        if research_experience_data is not None:
            instance.researchexperience_set.all().delete()
            for research_exp in research_experience_data:
                ResearchExperience.objects.create(expert=instance, **research_exp)

        return instance



class ExpertSerializer(CompletenessMixin, serializers.ModelSerializer):
    cv_file = serializers.FileField(
        required=False,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'docx']),
            validate_file_size
        ]
    )
    work_experiences = WorkExperienceSerializer(source='workexperience_set', many=True, read_only=True)
    educational_backgrounds = EducationalBackgroundSerializer(source='educationalbackground_set', many=True, read_only=True)
    research_experiences = ResearchExperienceSerializer(source='researchexperience_set', many=True, read_only=True)
    personal_detail = PersonalDetailSerializer(read_only=True)
    expertises = ExpertiseSerializer(source='expertise_set', many=True, read_only=True)

    yours = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            *[field.name for field in Expert._meta.get_fields() if field.concrete and not field.many_to_many],
            'work_experiences',
            'educational_backgrounds',
            'research_experiences',
            'personal_detail',
            'expertises',
                        'yours',  # 👈 include it here
            'cv_completeness',


        ]
        extra_kwargs = {
            'registered_by': {'required': True, 'allow_null': False}
        }

    def update(self, instance, validated_data):
        # Keep a handle on the old file and delete it only after the new one is
        # stored - deleting first loses the CV outright if the upload fails.
        old_cv = instance.cv_file if 'cv_file' in validated_data and instance.cv_file else None
        updated = super().update(instance, validated_data)
        if old_cv and old_cv.name != updated.cv_file.name:
            old_cv.delete(save=False)
        return updated

    def get_yours(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.registered_by_id == request.user.id

class PublicExpertSerializer(serializers.ModelSerializer):
    """Trimmed view for experts the viewer did NOT register.

    Shows name, position, years of experience, field/expertise, and the
    education / work / research history - the professional record. Excludes
    contact details (email, phone), cv_file, resume_text, and cv_completeness
    (a registering-company metric, not something other companies should see
    on experts that are not theirs). Deliberately does NOT inherit
    CompletenessMixin, so that field cannot reappear by a future field-list
    edit alone. Full detail (contact info, CV, completeness) stays exclusive
    to ExpertSerializer, reached only for an expert's own registering
    company or an admin.
    """

    work_experiences = WorkExperienceSerializer(source='workexperience_set', many=True, read_only=True)
    educational_backgrounds = EducationalBackgroundSerializer(source='educationalbackground_set', many=True, read_only=True)
    research_experiences = ResearchExperienceSerializer(source='researchexperience_set', many=True, read_only=True)
    current_position = serializers.SerializerMethodField()
    yours = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            'id',
            'first_name',
            'last_name',
            'current_position',
            'expertise_area',
            'year_of_experience',
            'work_experiences',
            'educational_backgrounds',
            'research_experiences',
            'yours',  # 👈 include here
        ]
    def get_yours(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.registered_by_id == request.user.id

    def get_current_position(self, obj):
        personal = getattr(obj, "personaldetail", None)
        return personal.current_position if personal else None


class PurchasedExpertSerializer(PublicExpertSerializer):
    """Same professional record as PublicExpertSerializer, plus the contact
    info and CV a company unlocked by paying for an AccessRequest.

    Deliberately does NOT add cv_completeness or the internal `code` - a
    paid request buys the contact details and the CV, which is what was
    requested and priced, not the full owner-equivalent record.
    """

    email = serializers.EmailField(read_only=True)
    cv_file = serializers.FileField(read_only=True)
    phone_number = serializers.SerializerMethodField()

    class Meta(PublicExpertSerializer.Meta):
        fields = PublicExpertSerializer.Meta.fields + ['email', 'phone_number', 'cv_file']

    def get_phone_number(self, obj):
        personal = getattr(obj, "personaldetail", None)
        return personal.phone_number if personal else None


class ExpertDynamicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expert
        fields = "__all__"  # required but not used directly

    def _paid_expert_ids(self, user):
        """Expert ids this company user has paid to unlock.

        Fetched once per request and memoised on the serializer context, which
        is shared across every row in a list. Asking per expert instead turned
        a listing into one extra query per result — invisible on a page of ten
        and ruinous on the large page sizes this API allows.
        """
        cache_key = "_paid_expert_ids"
        cached = self.context.get(cache_key)
        if cached is not None:
            return cached

        user_id = getattr(user, "id", None)
        paid = (
            set(
                AccessRequest.objects.filter(
                    requested_by_id=user_id, status='paid'
                ).values_list('expert_id', flat=True)
            )
            if user_id is not None
            else set()
        )
        # `context` is a plain dict shared by every row of this response, so
        # writing through it is what makes the memoisation effective. When a
        # caller builds a serializer without context this degrades to one
        # query per instance, which is the old behaviour, not a regression.
        try:
            self.context[cache_key] = paid
        except TypeError:
            pass
        return paid

    def to_representation(self, instance):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        user_role = getattr(user, "role", None)

        # Admin → full access to all experts
        if user_role == "admin":
            return ExpertSerializer(instance, context=self.context).data

        # Company → full access only if they registered this expert
        if user_role == "company":
            if instance.registered_by_id == getattr(user, "id", None):
                return ExpertSerializer(instance, context=self.context).data

            # Otherwise: contact info + CV only if they paid for access to
            # THIS expert via an AccessRequest.
            if instance.pk in self._paid_expert_ids(user):
                return PurchasedExpertSerializer(instance, context=self.context).data

            return PublicExpertSerializer(instance, context=self.context).data

        # Other users → public only
        return PublicExpertSerializer(instance, context=self.context).data


class AccessRequestSerializer(serializers.ModelSerializer):
    """Request to unlock one expert's contact info + CV.

    price / admin_note / status are read_only here - a company user must not
    be able to set their own price or mark themselves approved. Admin-only
    writes go through the dedicated `price`/`reject` actions on the viewset
    instead of a generic update, so the allowed transitions stay explicit
    rather than "whatever fields the request happened to include".
    """

    expert_name = serializers.SerializerMethodField()
    requested_by_name = serializers.SerializerMethodField()
    requested_by_company = serializers.CharField(source='requested_by.company_name', read_only=True)
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)

    class Meta:
        model = AccessRequest
        fields = [
            'id', 'expert', 'expert_name',
            'requested_by', 'requested_by_name', 'requested_by_company', 'requested_by_email',
            'status', 'price', 'admin_note', 'reviewed_by',
            'created_at', 'updated_at', 'paid_at',
        ]
        read_only_fields = [
            'status', 'price', 'admin_note', 'reviewed_by',
            'created_at', 'updated_at', 'paid_at', 'requested_by',
        ]

    def get_expert_name(self, obj):
        return f"{obj.expert.first_name} {obj.expert.last_name}".strip()

    def get_requested_by_name(self, obj):
        name = f"{obj.requested_by.first_name} {obj.requested_by.last_name}".strip()
        return name or obj.requested_by.email


class LandingIndexTeaserSerializer(serializers.ModelSerializer):
    """Anonymised teaser row for the PUBLIC landing page.

    Deliberately minimal: no name, email, CV file, resume text, or nested
    work/education history. Those fields either identify the expert outright
    or (via employer + dates) allow re-identification, and this serializer is
    reachable without authentication.

    Only add a field here if it is safe for anyone on the internet to read.
    """

    sector = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    seniority = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = ["code", "sector", "country", "seniority"]

    def get_sector(self, obj):
        # expertise_area is free text; show only the leading clause so a
        # long, uniquely-phrased specialism cannot single someone out.
        area = (obj.expertise_area or "").strip()
        if not area:
            return "General practice"
        head = area.replace(";", ",").split(",")[0].strip()
        return (head[:60] or "General practice")

    def get_country(self, obj):
        return (obj.country or obj.nationality or "").strip() or "Unspecified"

    def get_seniority(self, obj):
        years = obj.year_of_experience
        if not years:
            return "Practitioner"
        if years >= 15:
            return "Principal"
        if years >= 8:
            return "Senior"
        return "Practitioner"
