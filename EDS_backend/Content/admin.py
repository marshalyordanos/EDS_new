from django.contrib import admin
from .models import BlogPost, Testimonial


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'status', 'published_at', 'created_at']
    list_filter = ['status']
    search_fields = ['title', 'body']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'role', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'organization', 'quote']
