from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from .models import Attendance, LeaveRequest, Payroll
from .serializers import UserSerializer, AttendanceSerializer, LeaveSerializer, PayrollSerializer
User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

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
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        attendance = Attendance.objects.create(
            employee=request.user,
            date=data.get('date'),
            check_in=data.get('check_in'),
            check_out=data.get('check_out'),
            work_hours=data.get('work_hours'),
            extra_hours=data.get('extra_hours'),
            status=data.get('status', 'ABSENT')
        )

        serializer = self.get_serializer(attendance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        instance.check_out = data.get('check_out', instance.check_out)
        instance.work_hours = data.get('work_hours', instance.work_hours)
        instance.extra_hours = data.get('extra_hours', instance.extra_hours)
        instance.status = data.get('status', instance.status)
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        
        leave_request = LeaveRequest.objects.create(
            employee=request.user,
            leave_type=data.get('leave_type'),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            reason=data.get('reason'),
            status='PENDING'
        )
        
        serializer = self.get_serializer(leave_request)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        
        instance.status = data.get('status', instance.status)
        instance.admin_comment = data.get('admin_comment', instance.admin_comment)
        instance.save()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        
        employee_id = data.get('employee')

        try:
            employee_obj = User.objects.get(id=employee_id)
        except User.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        payroll = Payroll.objects.create(
            employee=employee_obj,
            month=data.get('month'),
            basic_salary=data.get('basic_salary', 0),
            hra=data.get('hra', 0),
            other_allowances=data.get('other_allowances', 0),
            pf=data.get('pf', 0),
            professional_tax=data.get('professional_tax', 0),
            net_salary=data.get('net_salary', 0)
        )
        
        serializer = self.get_serializer(payroll)
        return Response(serializer.data, status=status.HTTP_201_CREATED)