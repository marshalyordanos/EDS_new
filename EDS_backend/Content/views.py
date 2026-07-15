from django.utils.timezone import now
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import BlogPost, Testimonial
from .serializers import BlogPostSerializer, BlogPostListSerializer, TestimonialSerializer
from .permissions import IsContentManagerOrAdmin


class BlogPostViewSet(viewsets.ModelViewSet):
    queryset = BlogPost.objects.all()
    serializer_class = BlogPostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsContentManagerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated or user.role not in ('content_manager', 'admin'):
            return BlogPost.objects.filter(status='published')
        return BlogPost.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsContentManagerOrAdmin])
    def publish(self, request, slug=None):
        post = self.get_object()
        post.status = 'published'
        post.published_at = now()
        post.save()
        return Response({'status': 'published'})

    @action(detail=True, methods=['post'], permission_classes=[IsContentManagerOrAdmin])
    def unpublish(self, request, slug=None):
        post = self.get_object()
        post.status = 'draft'
        post.published_at = None
        post.save()
        return Response({'status': 'draft'})


class TestimonialViewSet(viewsets.ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsContentManagerOrAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated or user.role not in ('content_manager', 'admin'):
            return Testimonial.objects.filter(is_active=True)
        return Testimonial.objects.all()


@api_view(['POST'])
@permission_classes([AllowAny])
def contact_form(request):
    data = request.data
    name = data.get('name', '').strip()
    organization = data.get('organization', '').strip()
    email = data.get('email', '').strip()
    country = data.get('country', '').strip()
    purpose = data.get('purpose', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return Response(
            {'error': 'Name, email, and message are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    subject = f"AfriDATAi Contact: {purpose or 'General Inquiry'} — {name}"
    body = (
        f"Name: {name}\n"
        f"Organization: {organization or '—'}\n"
        f"Email: {email}\n"
        f"Country: {country or '—'}\n"
        f"Purpose: {purpose or '—'}\n\n"
        f"Message:\n{message}"
    )

    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['business@afridatai.com'],
        fail_silently=False,
    )

    return Response({'success': True}, status=status.HTTP_200_OK)
