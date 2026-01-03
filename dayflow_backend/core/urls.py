from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from .views import UserViewSet, AttendanceViewSet, LeaveViewSet, PayrollViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'leaves', LeaveViewSet, basename='leave')
router.register(r'payroll', PayrollViewSet, basename='payroll')

urlpatterns = [
    path('auth/login/', UserViewSet.as_view({'post': 'login'}), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    path('auth/me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),
    path('auth/profile/', UserViewSet.as_view({'patch': 'update_profile'}), name='update-profile'),
    
    path('', include(router.urls)),
]