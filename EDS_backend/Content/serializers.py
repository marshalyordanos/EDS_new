from rest_framework import serializers
from .models import BlogPost, Testimonial


class BlogPostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'body', 'cover_image',
            'author', 'author_name', 'status', 'published_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slug', 'author', 'created_at', 'updated_at']


class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(read_only=True)

    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'cover_image', 'author_name', 'status', 'published_at', 'created_at']



class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ['id', 'name', 'role', 'organization', 'quote', 'photo', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
