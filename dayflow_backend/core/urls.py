from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *


router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leaves', LeaveViewSet)
router.register(r'payroll', PayrollViewSet)


urlpatterns = [
    path('', include(router.urls)),
]