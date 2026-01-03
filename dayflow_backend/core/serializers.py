from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import Attendance, LeaveRequest, Payroll
from datetime import date
from decimal import Decimal

User = get_user_model()


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True, max_length=150)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'password_confirm', 'email',
            'first_name', 'last_name', 'role', 'employee_id',
            'department', 'designation', 'phone', 'address',
            'location', 'joining_date', 'paid_leave_balance',
            'sick_leave_balance', 'profile_picture', 'resume',
            'is_active', 'date_joined', 'last_login'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate_email(self, value):
        """Validate email uniqueness"""
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk if user else None).exists():
            raise serializers.ValidationError("Email already in use")
        return value.lower()

    def validate_employee_id(self, value):
        """Validate employee_id uniqueness"""
        if value:
            user = self.instance
            if User.objects.filter(employee_id=value).exclude(pk=user.pk if user else None).exists():
                raise serializers.ValidationError("Employee ID already exists")
        return value

    def validate_phone(self, value):
        """Validate phone number format"""
        if value:
            # Remove spaces and dashes
            phone = value.replace(' ', '').replace('-', '')
            if not phone.isdigit() or len(phone) < 10:
                raise serializers.ValidationError("Invalid phone number format")
        return value

    def validate(self, attrs):
        """Validate password confirmation"""
        password = attrs.get('password')
        password_confirm = attrs.pop('password_confirm', None)
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match"
            })
        
        # Validate joining date is not in the future
        joining_date = attrs.get('joining_date')
        if joining_date and joining_date > date.today():
            raise serializers.ValidationError({
                "joining_date": "Joining date cannot be in the future"
            })
        
        return attrs

    def create(self, validated_data):
        """Create user with hashed password"""
        # Remove password_confirm if it exists
        validated_data.pop('password_confirm', None)
        
        return User.objects.create_user(**validated_data)

    def update(self, instance, validated_data):
        """Update user, handling password separately"""
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'employee_username',
            'date', 'check_in', 'check_out', 'work_hours',
            'extra_hours', 'status'
        ]
        read_only_fields = ['work_hours', 'extra_hours']

    def validate_date(self, value):
        """Ensure date is not in the future"""
        if value > date.today():
            raise serializers.ValidationError("Attendance date cannot be in the future")
        return value

    def validate(self, attrs):
        """Validate check_in and check_out times"""
        check_in = attrs.get('check_in')
        check_out = attrs.get('check_out')
        
        if check_in and check_out:
            if check_out <= check_in:
                raise serializers.ValidationError({
                    "check_out": "Check-out time must be after check-in time"
                })
        
        # Prevent duplicate attendance for same employee and date
        employee = attrs.get('employee')
        attendance_date = attrs.get('date', date.today())
        
        if employee and attendance_date:
            existing = Attendance.objects.filter(
                employee=employee,
                date=attendance_date
            )
            
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError(
                    "Attendance record already exists for this date"
                )
        
        return attrs


class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    days_count = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'employee', 'employee_name', 'employee_username',
            'leave_type', 'start_date', 'end_date', 'days_count',
            'reason', 'attachment', 'status', 'admin_comment'
        ]
        read_only_fields = ['status', 'admin_comment']

    def get_days_count(self, obj):
        """Calculate number of leave days"""
        if obj.start_date and obj.end_date:
            return (obj.end_date - obj.start_date).days + 1
        return 0

    def validate_start_date(self, value):
        """Validate start date is not in the past"""
        if value < date.today():
            raise serializers.ValidationError(
                "Start date cannot be in the past"
            )
        return value

    def validate(self, attrs):
        """Validate leave request dates and duration"""
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        leave_type = attrs.get('leave_type')
        
        # Validate end date is after start date
        if start_date and end_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    "end_date": "End date must be after start date"
                })
            
            # Calculate days
            days = (end_date - start_date).days + 1
            
            # Validate maximum leave duration (e.g., 30 days)
            if days > 30:
                raise serializers.ValidationError(
                    "Leave duration cannot exceed 30 days"
                )
        
        # Validate overlapping leave requests
        employee = attrs.get('employee') or (self.instance.employee if self.instance else None)
        if employee and start_date and end_date:
            overlapping = LeaveRequest.objects.filter(
                employee=employee,
                status__in=['PENDING', 'APPROVED'],
                start_date__lte=end_date,
                end_date__gte=start_date
            )
            
            if self.instance:
                overlapping = overlapping.exclude(pk=self.instance.pk)
            
            if overlapping.exists():
                raise serializers.ValidationError(
                    "You already have a leave request for overlapping dates"
                )
        
        # Validate reason is provided
        reason = attrs.get('reason')
        if not reason or len(reason.strip()) < 10:
            raise serializers.ValidationError({
                "reason": "Please provide a detailed reason (minimum 10 characters)"
            })
        
        return attrs


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.get_full_name', read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    gross_salary = serializers.SerializerMethodField()
    total_deductions = serializers.SerializerMethodField()
    
    class Meta:
        model = Payroll
        fields = [
            'id', 'employee', 'employee_name', 'employee_username',
            'month', 'basic_salary', 'hra', 'standard_allowance',
            'other_allowances', 'gross_salary', 'pf', 'professional_tax',
            'total_deductions', 'net_salary'
        ]
        read_only_fields = ['net_salary']

    def get_gross_salary(self, obj):
        """Calculate gross salary"""
        return float(
            obj.basic_salary + obj.hra + 
            obj.standard_allowance + obj.other_allowances
        )

    def get_total_deductions(self, obj):
        """Calculate total deductions"""
        return float(obj.pf + obj.professional_tax)

    def validate_month(self, value):
        """Validate month format"""
        if value > date.today():
            raise serializers.ValidationError(
                "Payroll month cannot be in the future"
            )
        return value

    def validate(self, attrs):
        """Validate payroll amounts"""
        # Convert Decimal to float for calculations
        basic_salary = float(attrs.get('basic_salary', 0))
        hra = float(attrs.get('hra', 0))
        pf = float(attrs.get('pf', 0))
        
        # Validate positive amounts
        for field in ['basic_salary', 'hra', 'standard_allowance', 
                     'other_allowances', 'pf', 'professional_tax']:
            value = float(attrs.get(field, 0))
            if value < 0:
                raise serializers.ValidationError({
                    field: "Amount cannot be negative"
                })
        
        # Validate PF is reasonable (typically 12% of basic)
        if basic_salary > 0 and pf > basic_salary * 0.15:
            raise serializers.ValidationError({
                "pf": "PF amount seems too high (should be around 12% of basic)"
            })
        
        # Validate HRA is reasonable (typically 40-50% of basic)
        if basic_salary > 0 and hra > basic_salary * 0.60:
            raise serializers.ValidationError({
                "hra": "HRA amount seems too high (should be 40-50% of basic)"
            })
        
        # Check for duplicate payroll entry
        employee = attrs.get('employee')
        month = attrs.get('month')
        
        if employee and month:
            existing = Payroll.objects.filter(
                employee=employee,
                month=month
            )
            
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError(
                    "Payroll entry already exists for this employee and month"
                )
        
        return attrs