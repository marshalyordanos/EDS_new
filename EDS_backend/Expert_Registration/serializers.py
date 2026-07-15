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
                    ResearchExperience
                    )

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
            'role', 'company_name', 'created_at', 'updated_at'
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



class ExpertSerializer(serializers.ModelSerializer):
    cv_file = serializers.FileField(
        required=False,
        validators=[
            FileExtensionValidator(allowed_extensions=['pdf', 'doc', 'docx']),
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

           
        ]
        extra_kwargs = {
            'registered_by': {'required': True, 'allow_null': False}
        }

    def update(self, instance, validated_data):
        if 'cv_file' in validated_data:
            if instance.cv_file:
                instance.cv_file.delete()
            instance.cv_file = validated_data['cv_file']
        return super().update(instance, validated_data)

    def get_yours(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.registered_by_id == request.user.id

class PublicExpertSerializer(serializers.ModelSerializer):
    work_experiences = WorkExperienceSerializer(source='workexperience_set', many=True, read_only=True)
    educational_backgrounds = EducationalBackgroundSerializer(source='educationalbackground_set', many=True, read_only=True)
    research_experiences = ResearchExperienceSerializer(source='researchexperience_set', many=True, read_only=True)
    expertises = ExpertiseSerializer(source='expertise_set', many=True, read_only=True)

    yours = serializers.SerializerMethodField()

    class Meta:
        model = Expert
        fields = [
            'id',
            'expertises',
            'work_experiences',
            'educational_backgrounds',
            'research_experiences',
            'expertise_area',
            'year_of_experience',
            'nationality',
            'countries_of_work_experience',
            'yours',  # 👈 include here
            'code'

        ]
    def get_yours(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.registered_by_id == request.user.id    

class ExpertDynamicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expert
        fields = "__all__"  # required but not used directly

    def to_representation(self, instance):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        user_role = getattr(user, "role", None)

        # Admin → full access to all experts
        if user_role == "admin":
            return ExpertSerializer(instance, context=self.context).data

        # Company → full access only if they registered this expert, public for others
        if user_role == "company":
            if instance.registered_by_id == getattr(user, "id", None):
                return ExpertSerializer(instance, context=self.context).data
            return PublicExpertSerializer(instance, context=self.context).data

        # Other users → public only
        return PublicExpertSerializer(instance, context=self.context).data
