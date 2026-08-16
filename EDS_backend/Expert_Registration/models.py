from django.utils.timezone import now
from django.db import models, IntegrityError, transaction

from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from django_countries.fields import CountryField
from django.forms import ValidationError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db.models import JSONField
from django.contrib.postgres.fields import ArrayField
from django.contrib.postgres.indexes import GinIndex
from cloudinary_storage.storage import RawMediaCloudinaryStorage
from django.conf import settings

import uuid


def cv_storage():
    """Storage backend for CV uploads.

    Cloudinary only - CVs are never written to local disk, in any
    environment. Kept as a function (rather than assigning the field
    `storage=RawMediaCloudinaryStorage()` directly) because migrations
    serialize this callable by import path, not the instance, so existing
    migrations do not change.
    """
    return RawMediaCloudinaryStorage()

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)

        # ✅ Use default password if none is given
        if not password:
            password = "Dab@2025"

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    # def create_user(self, email, password=None, **extra_fields):
    #     if not email:
    #         raise ValueError('The Email field must be set')
    #     email = self.normalize_email(email) 
    #     user = self.model(email=email, **extra_fields)
    #     user.set_password(password)
    #     user.save(using=self._db)
        # return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('company', 'Company User'),
        ('admin', 'Admin'),
        ('content_manager','Content_Manager')
    ]
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='company')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    company_name = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        # stats filters by role and groups by company_name on every dashboard
        # load; the user list orders by -created_at.
        indexes = [
            models.Index(fields=['role'], name='user_role_idx'),
            models.Index(fields=['company_name'], name='user_company_idx'),
            models.Index(fields=['-created_at'], name='user_created_idx'),
        ]

    def __str__(self):
        return self.email

def generate_unique_code():
    return uuid.uuid4().hex[:12].upper()
class Expert(models.Model):
    first_name = models.CharField(max_length=100, db_index = True)
    last_name = models.CharField(max_length=100, db_index = True)
    email = models.EmailField(unique=True, db_index = True)


    code = models.CharField(
    max_length=50,
    unique=True,
    editable=False,
    db_index=True,
    null=True,
    blank=True,
)


    cv_file = models.FileField(
        upload_to='documents/%Y/%m/%d/',
        storage=cv_storage,
        blank= True,
null =True
        
    )
    
    def get_resume_url(self):
        """Get secure URL for the resume"""
        if self.cv_file:
            url = self.cv_file.url
            if url.startswith('http://'):
                url = url.replace('http://', 'https://')
            return url
        return None
    
    resume_text = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    cv_language = models.CharField(max_length=20, db_index = True,choices=[("English", "English"), ("Amharic", "Amharic")], default="English")
    expertise_area = models.TextField(blank=True,db_index = True, null=True)
    country = models.CharField(blank = True, max_length = 200, db_index = True)

    year_of_experience = models.PositiveIntegerField(db_index = True,verbose_name = "year of experience / seniority",null=True,blank=True)
    nationality = models.CharField(blank = True, max_length = 200)
    countries_of_work_experience = models.TextField(blank=True, null=True)
    key_words = ArrayField(models.CharField(max_length=100), default=list, blank=True, help_text="List of keywords or specializations")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    registered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='experts_registered')
    publications = models.TextField(blank=True, default='')
    journals = models.TextField(null=True, blank=True)
    learning_module = models.TextField(null=True, blank=True)
    language_skills = JSONField(blank=True, default=dict, null=True)
    books = models.TextField(blank=True, default='', null=True)

    def get_country(self):
        return self.countries_of_work_experience.split(",") if self.countries_of_work_experience else []
    
    def set_country(self, country_list):
        self.countries_of_work_experience = ','.join(country_list)
    
    def get_books(self):
        return self.books.split("*") if self.books else []
    
    def set_books(self, books_list):
        self.books = '*'.join(books_list)
    
    def set_publications(self, publications_list):
        self.publications = '*'.join(publications_list)
        
    def get_publications(self):
        return self.publications.split('*') if self.publications else []
    
    # def delete(self, *args, **kwargs):
    #     self.is_deleted = True
    #     self.deleted_at = now()
    #     self.save()

    def delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)  # Hard delete
    
    def __str__(self):
        return self.first_name
    def generate_unique_code(self):
        """Generate a truly unique code"""
        while True:
            code = uuid.uuid4().hex[:12].upper()
            if not Expert.objects.filter(code=code).exists():
                return code

    def save(self, *args, **kwargs):
        if not self.code:
            self.code = self.generate_unique_code()
        # use transaction to avoid race conditions
        try:
            with transaction.atomic():
                super().save(*args, **kwargs)
        except IntegrityError:
            # In case of rare race condition, regenerate and retry
            self.code = self.generate_unique_code()
            super().save(*args, **kwargs)


    class Meta:
        # Indexes below back the queries the console actually issues. The
        # single-column db_index flags above cover equality lookups on their
        # own fields; these cover the composite and non-equality patterns
        # those flags cannot serve.
        indexes = [
            # Default list ordering is `created_at`, and every list is first
            # narrowed by registered_by (company scope) or is_deleted. Without
            # this the list endpoint is a seq scan + sort on every request.
            models.Index(
                fields=['registered_by', '-created_at'],
                name='expert_regby_created_idx',
            ),
            models.Index(fields=['-created_at'], name='expert_created_idx'),

            # Dashboard "outdated CVs" and the cv_updated_* filters range-scan
            # this; stats also groups registrations by month.
            models.Index(fields=['-updated_at'], name='expert_updated_idx'),

            # is_deleted is a filter on nearly every read but is low-cardinality,
            # so it only earns an index paired with the ordering column.
            models.Index(
                fields=['is_deleted', '-created_at'],
                name='expert_deleted_created_idx',
            ),

            # key_words is an ArrayField queried with __overlap, which only a
            # GIN index can serve — a btree is unusable for containment.
            GinIndex(fields=['key_words'], name='expert_keywords_gin'),

            # Free-text search hits resume_text with icontains; gin_trgm_ops
            # makes that an index scan instead of a full-table LIKE. Guarded by
            # the pg_trgm extension, created in the accompanying migration.
            GinIndex(
                fields=['resume_text'],
                name='expert_resume_trgm',
                opclasses=['gin_trgm_ops'],
            ),
            GinIndex(
                fields=['expertise_area'],
                name='expert_expertise_trgm',
                opclasses=['gin_trgm_ops'],
            ),
        ]



class PersonalDetail(models.Model):
    expert = models.OneToOneField(Expert, on_delete=models.CASCADE)
    date_of_birth = models.DateField(null=True, blank=True) 
    gender = models.CharField(max_length=30, choices=[('female', 'Female'), ('male', 'Male'), ('unspecified', 'Unspecified')], default='unspecified', null=True, blank=True)
    country = models.CharField(max_length=120, blank=True, null=True) 
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    
    cv_language = models.CharField(
        max_length=20,
        choices=[("English", "English"), ("Amharic", "Amharic")],
        help_text="Language for generated CV documents"
    )
    
    current_position = models.CharField(max_length=255, blank=True, null=True)
    name_suffix = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):
        return self.email


class EducationalBackground(models.Model):
    LEVEL = (('diploma', 'Diploma'), ('degree', 'Degree'), ('masters', 'Masters'), ('phd', 'PHD'))
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE)
    institution_name = models.TextField()
    education_level = models.CharField(max_length=50, choices=LEVEL)
    field_of_study = models.CharField(max_length=255)
    year_of_grad = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-year_of_grad']
        # The FK index alone serves the lookup but not the ordering, so each
        # prefetched expert still costs a sort. Ordering the index the same way
        # the model does makes the prefetch a plain index scan.
        indexes = [
            models.Index(fields=['expert', '-year_of_grad'], name='edu_expert_grad_idx'),
        ]

    def __str__(self):
        return f'{self.education_level} {self.expert}'

class WorkExperience(models.Model):
    TYPE_CHOICES = [
        ("work_experience", "Work Experience"),
        ("certification", "Certificate")
    ]
    
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE)
    position_title = models.CharField(max_length=500, null=True, blank=True) 
    organization_name = models.CharField(max_length=500, null=True, blank=True) 
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    responsibilities = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    
    
    typee = models.CharField(max_length=20, choices=TYPE_CHOICES, default="work_experience", null=True, blank=True) 
    description = models.TextField(null=True, blank=True)
    
    # def clean(self):
    #     if self.end_date and self.start_date and self.end_date < self.start_date:
    #         raise ValidationError("End date must be after start date")

    class Meta:
        ordering = ['-start_date']
        # Matches the model ordering so the completeness prefetch and the
        # nested work-experience endpoint both scan rather than sort.
        indexes = [
            models.Index(fields=['expert', '-start_date'], name='work_expert_start_idx'),
        ]


class Expertise(models.Model):
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE) 
    specialization = models.TextField(null=True, blank=True) # Added null=True
    key_words = models.JSONField(blank=True, default=list, null=True) # Added null=True

    def __str__(self):
        return f"Expertise of: {self.expert}"


class ResearchExperience(models.Model):
    expert = models.ForeignKey(Expert, on_delete=models.CASCADE)
    # Increased max_length to 500
    position = models.CharField(max_length=500, null=True, blank=True) 
    start_date = models.DateField(null=True, blank=True) # Made nullable
    end_date = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True) # Made nullable
    email = models.EmailField(blank=True, null=True) # Removed unique=True and added null=True
    client = models.CharField(max_length=255, null=True, blank=True) # Made nullable
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    project_name = models.TextField(null=True, blank=True) # Added project_name from prev analysis
    category = models.CharField(max_length=255, blank=True, null=True) # Added category from prev analysis

    class Meta:
        # filter_funding_agencies runs icontains over client and project_name
        # across the whole table; trigram indexes turn those into index scans.
        indexes = [
            GinIndex(
                fields=['client'],
                name='research_client_trgm',
                opclasses=['gin_trgm_ops'],
            ),
            GinIndex(
                fields=['project_name'],
                name='research_project_trgm',
                opclasses=['gin_trgm_ops'],
            ),
        ]

    # def __str__(self):
        # return self.


class AccessRequest(models.Model):
    """A company's request to unlock one expert's contact info + CV.

    Company users only see the trimmed public view (name/position/experience)
    for experts they did not register - see PublicExpertSerializer and
    ExpertViewSet.retrieve. This is the paper trail for how a company earns
    the full view on one specific expert: they request it, an admin prices
    and accepts (or rejects) it, and once marked paid the requester gets
    full access to that one expert only. Access is NOT granted by simply
    having a paid request row - the permission check (in views.py) queries
    for a paid AccessRequest matching (expert, requested_by) directly, so
    there is exactly one source of truth for "can this company see this
    expert's contact info and CV".
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),   # just filed, admin has not acted yet
        ('priced', 'Priced'),     # admin set a price, awaiting payment
        ('rejected', 'Rejected'), # admin declined; requester can request again
        ('paid', 'Paid'),         # payment confirmed by admin; access granted
    ]

    expert = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='access_requests')
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='access_requests_made'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    admin_note = models.TextField(blank=True, default='')
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='access_requests_reviewed',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            # The access check asks "is there a paid row for this
            # (expert, requester)?" on every expert a company user views.
            # The partial unique constraint below cannot serve it — that one
            # only covers pending/priced — so without this the planner falls
            # back to filtering expert_id and status in memory.
            models.Index(
                fields=['requested_by', 'expert', 'status'],
                name='accessreq_user_expert_status',
            ),
            # Admin queue: list by status, newest first.
            models.Index(fields=['status', '-created_at'], name='accessreq_status_created'),
            # Django does not create an index for the FK when the only other
            # index on it is the partial constraint.
            models.Index(fields=['expert'], name='accessreq_expert_idx'),
        ]
        constraints = [
            # Only one row may be "in flight" (pending/priced) per company+expert
            # at a time - a rejected request frees the pair up to request again,
            # and a paid request means access already exists so a duplicate
            # in-flight request would be pointless.
            models.UniqueConstraint(
                fields=['expert', 'requested_by'],
                condition=models.Q(status__in=['pending', 'priced']),
                name='one_active_access_request_per_expert_requester',
            )
        ]

    def __str__(self):
        return f"{self.requested_by} → {self.expert} ({self.status})"


        