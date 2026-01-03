from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, AttendanceViewSet, LeaveViewSet, PayrollViewSet


router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'leaves', LeaveViewSet, basename='leave')
router.register(r'payroll', PayrollViewSet, basename='payroll')


urlpatterns = [
    path('users/login/', UserViewSet.as_view({'post': 'login'}), name='login'),
    path('', include(router.urls)),
]