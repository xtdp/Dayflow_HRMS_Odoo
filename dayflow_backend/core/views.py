from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from django.contrib.auth import authenticate, get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from .permissions import IsAdminUser, IsOwnerOrAdmin
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import User, Attendance, LeaveRequest, Payroll
from .serializers import (
    UserSerializer, 
    AttendanceSerializer, 
    LeaveSerializer, 
    PayrollSerializer,
    UserLoginSerializer
)
import logging

from core import serializers

logger = logging.getLogger(__name__)
User = get_user_model()


class LoginRateThrottle(AnonRateThrottle):
    """Custom throttle for login attempts"""
    scope = 'login'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['username', 'email', 'employee_id', 'department']
    filterset_fields = ['role', 'department', 'is_active']

    def get_permissions(self):
        if self.action in ['login', 'create']:
            return [permissions.AllowAny()]
        elif self.action in ['me', 'update_profile']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_throttles(self):
        if self.action == 'login':
            return [LoginRateThrottle()]
        return super().get_throttles()

    def create(self, request, *args, **kwargs):
        """Override create to add validation and logging"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        if User.objects.filter(email=request.data.get('email')).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        self.perform_create(serializer)
        logger.info(f"New user created: {serializer.data.get('username')}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Secure login endpoint with JWT token generation"""
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user:
            if not user.is_active:
                logger.warning(f"Inactive user login attempt: {username}")
                return Response(
                    {"error": "Account is inactive"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"Successful login: {username}")
            
            return Response({
                "message": "Login successful",
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        logger.warning(f"Failed login attempt for username: {username}")
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        """Allow users to update their own profile"""
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)
        
        restricted_fields = ['role', 'is_staff', 'is_superuser', 'employee_id']
        if not user.role == 'ADMIN':
            for field in restricted_fields:
                if field in request.data:
                    return Response(
                        {"error": f"Cannot modify field: {field}"},
                        status=status.HTTP_403_FORBIDDEN
                    )
        
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        logger.info(f"Profile updated for user: {user.username}")
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['date', 'status', 'employee']
    ordering_fields = ['date', 'check_in']

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        if user.role == 'ADMIN':
            employee_id = self.request.query_params.get('employee_id')
            if employee_id:
                queryset = queryset.filter(employee_id=employee_id)
            return queryset
        
        return queryset.filter(employee=user)

    def perform_create(self, serializer):
        """Ensure attendance is created for the authenticated user"""
        if self.request.user.role != 'ADMIN':
            serializer.save(employee=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Handle employee check-in"""
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        if Attendance.objects.filter(employee=request.user, date=today).exists():
            return Response(
                {"error": "Already checked in today"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance = Attendance.objects.create(
            employee=request.user,
            date=today,
            check_in=current_time,
            status='PRESENT'
        )
        
        logger.info(f"Check-in recorded for {request.user.username} at {current_time}")
        
        return Response({
            "status": "Checked in successfully",
            "time": attendance.check_in,
            "date": attendance.date
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Handle employee check-out and calculate work hours"""
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        try:
            attendance = Attendance.objects.get(employee=request.user, date=today)
            
            if attendance.check_out:
                return Response(
                    {"error": "Already checked out today"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            attendance.check_out = current_time
            
            check_in_datetime = datetime.combine(today, attendance.check_in)
            check_out_datetime = datetime.combine(today, current_time)
            work_duration = check_out_datetime - check_in_datetime
            
            hours = work_duration.total_seconds() / 3600
            attendance.work_hours = f"{hours:.2f}"
            
            if hours > 8:
                attendance.extra_hours = f"{(hours - 8):.2f}"
            
            attendance.save()
            
            logger.info(f"Check-out recorded for {request.user.username} at {current_time}")
            
            return Response({
                "status": "Checked out successfully",
                "check_in": attendance.check_in,
                "check_out": attendance.check_out,
                "work_hours": attendance.work_hours,
                "extra_hours": attendance.extra_hours or "0.00"
            })
            
        except Attendance.DoesNotExist:
            return Response(
                {"error": "No check-in record found for today"},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Get monthly attendance summary"""
        user = request.user
        month = request.query_params.get('month', timezone.now().month)
        year = request.query_params.get('year', timezone.now().year)
        
        try:
            month = int(month)
            year = int(year)
        except ValueError:
            return Response(
                {"error": "Invalid month or year"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user.role == 'ADMIN':
            employee_id = request.query_params.get('employee_id')
            if employee_id:
                attendance_records = Attendance.objects.filter(
                    employee_id=employee_id,
                    date__month=month,
                    date__year=year
                )
            else:
                attendance_records = Attendance.objects.filter(
                    date__month=month,
                    date__year=year
                )
        else:
            attendance_records = Attendance.objects.filter(
                employee=user,
                date__month=month,
                date__year=year
            )
        
        total_days = attendance_records.count()
        present_days = attendance_records.filter(status='PRESENT').count()
        absent_days = attendance_records.filter(status='ABSENT').count()
        half_days = attendance_records.filter(status='HALF_DAY').count()
        
        return Response({
            "month": month,
            "year": year,
            "total_days": total_days,
            "present": present_days,
            "absent": absent_days,
            "half_day": half_days
        })


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'leave_type']
    ordering_fields = ['start_date', 'status']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset.all()
        return self.queryset.filter(employee=user)

    def perform_create(self, serializer):
        """Create leave request with validation"""
        user = self.request.user
        leave_type = serializer.validated_data.get('leave_type')
        start_date = serializer.validated_data.get('start_date')
        end_date = serializer.validated_data.get('end_date')
        
        days_requested = (end_date - start_date).days + 1
        
        if leave_type == 'PAID' and user.paid_leave_balance < days_requested:
            raise serializers.ValidationError(
                "Insufficient paid leave balance"
            )
        elif leave_type == 'SICK' and user.sick_leave_balance < days_requested:
            raise serializers.ValidationError(
                "Insufficient sick leave balance"
            )
        
        serializer.save(employee=user, status='PENDING')
        logger.info(f"Leave request created by {user.username}")

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def approve(self, request, pk=None):
        """Approve leave request (Admin only)"""
        leave_request = self.get_object()
        
        if leave_request.status != 'PENDING':
            return Response(
                {"error": "Leave request is not pending"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave_request.status = 'APPROVED'
        leave_request.admin_comment = request.data.get('comment', '')
        leave_request.save()
        
        employee = leave_request.employee
        days = (leave_request.end_date - leave_request.start_date).days + 1
        
        if leave_request.leave_type == 'PAID':
            employee.paid_leave_balance -= days
        elif leave_request.leave_type == 'SICK':
            employee.sick_leave_balance -= days
        
        employee.save()
        
        logger.info(f"Leave approved for {employee.username} by {request.user.username}")
        
        return Response(LeaveSerializer(leave_request).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminUser])
    def reject(self, request, pk=None):
        """Reject leave request (Admin only)"""
        leave_request = self.get_object()
        
        if leave_request.status != 'PENDING':
            return Response(
                {"error": "Leave request is not pending"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        leave_request.status = 'REJECTED'
        leave_request.admin_comment = request.data.get('comment', '')
        leave_request.save()
        
        logger.info(f"Leave rejected for {leave_request.employee.username} by {request.user.username}")
        
        return Response(LeaveSerializer(leave_request).data)


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['employee', 'month']
    ordering_fields = ['month']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset.all()
        return self.queryset.filter(employee=user)

    def get_permissions(self):
        """Only admins can create, update, or delete payroll"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        """Log payroll creation"""
        serializer.save()
        logger.info(f"Payroll created for {serializer.instance.employee.username}")