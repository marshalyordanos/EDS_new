from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from django.urls import path, include
from .views import( UserViewSet, ExpertViewSet, LoginView,
                    PasswordResetConfirmView, PasswordResetViewSet,
                    CVBuilderAPIView, ChangePasswordView,
                    EducationalBackgroundViewSet,
                    PersonalDetailViewSet,
                    ResearchExperienceViewSet,
                    ExpertiseViewSet, WorkExperienceViewSet,
                    ExpertSearchView
                    )
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import views as auth_view


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'experts', ExpertViewSet, basename='expert')

experts_router = NestedDefaultRouter(router, r'experts', lookup='expert')
experts_router.register(r'education', EducationalBackgroundViewSet, basename='expert-education')

experts_router.register(r'personal_detail',PersonalDetailViewSet, basename='personal')
experts_router.register(r'work_experience',WorkExperienceViewSet, basename='work')
experts_router.register(r'research_experience',ResearchExperienceViewSet, basename='research')
experts_router.register(r'expertise',ExpertiseViewSet, basename='expertise')


urlpatterns = [
    path('api/v1/', include(router.urls)),
    path('api/v1/', include(experts_router.urls)),
    path('api/auth/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/password_reset/', PasswordResetViewSet.as_view(), name='api_password_reset'),
    path('api/password_reset/confirm/', PasswordResetConfirmView.as_view(), name='api_password_reset_confirm'),
    path('api/v1/changepassword/', ChangePasswordView.as_view(), name = 'change-password'),
    
    
    # path('api/v1/experts/register/', ExpertViewSet.as_view({'post': 'create'}), name='expert-register'),
    path('api/v1/experts/<int:expert_id>/build-cv/', CVBuilderAPIView.as_view(), name='build-cv'),
    path('api/v1/experts/search/', ExpertSearchView.as_view(), name='expert-search'),


]


