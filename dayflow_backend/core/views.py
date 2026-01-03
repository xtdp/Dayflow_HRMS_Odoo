from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from .permissions import IsAdminUser, IsOwnerOrAdmin
from .models import User, Attendance, LeaveRequest, Payroll
from .serializers import UserSerializer, AttendanceSerializer, LeaveSerializer, PayrollSerializer

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['username', 'email', 'employee_id']

    def get_permissions(self):
        if self.action in ['login']:
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'])
    def login(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            serializer = UserSerializer(user)
            return Response({
                "message": "Login successful",
                "user": serializer.data 
            })
            
        return Response({"error": "Invalid credentials"})


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset.all()
        return self.queryset.filter(employee=user)

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset.all()
        return self.queryset.filter(employee=user)

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user, status='PENDING')


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return self.queryset.all()
        return self.queryset.filter(employee=user)

    def perform_create(self, serializer):
        serializer.save()