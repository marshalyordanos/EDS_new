from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.db import models
from django.utils.text import slugify
from cloudinary_storage.storage import MediaCloudinaryStorage
from Expert_Registration.models import User


def content_image_storage():
    """Storage backend for blog covers and testimonial photos.

    Cloudinary in production; local disk when USE_CLOUDINARY is off, so local
    dev works without Cloudinary credentials. Mirrors
    Expert_Registration.models.cv_storage - referenced by name here too, so
    migrations serialize the callable rather than a storage instance.
    """
    if getattr(settings, 'USE_CLOUDINARY', True):
        return MediaCloudinaryStorage()
    return FileSystemStorage()


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    body = models.TextField()
    cover_image = models.ImageField(
        upload_to='blog/covers/',
        storage=content_image_storage,
        blank=True,
        null=True,
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='blog_posts',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # The public blog list is always "published, newest first"; a composite
        # index serves the filter and the sort in one scan.
        indexes = [
            models.Index(fields=['status', '-created_at'], name='blog_status_created_idx'),
        ]

    @property
    def author_name(self):
        if self.author:
            return (
            f"{self.author.first_name} {self.author.last_name}".strip()
            or self.author.email
        )
        return None

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Testimonial(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=150, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    quote = models.TextField()
    photo = models.ImageField(
        upload_to='testimonials/',
        storage=content_image_storage,
        blank=True,
        null=True,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Public list is "active, newest first" — same shape as BlogPost.
        indexes = [
            models.Index(fields=['is_active', '-created_at'], name='testimonial_active_idx'),
        ]

    def __str__(self):
        return f"{self.name} — {self.organization}"
