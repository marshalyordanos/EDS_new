from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, TestimonialViewSet, contact_form

router = DefaultRouter()
router.register(r'blog', BlogPostViewSet, basename='blog')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_form, name='contact-form'),
]
