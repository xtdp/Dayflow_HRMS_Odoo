from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Attendance, LeaveRequest, Payroll
User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'employee_id', 'department', 'designation',
            'phone', 'address', 'location', 'joining_date',
            'paid_leave_balance', 'sick_leave_balance',
            'profile_picture', 'resume'
        ]

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Payroll
        fields = '__all__'