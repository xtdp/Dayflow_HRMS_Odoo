from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

# Create your models here.

class Role(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin/HR'
    EMPLOYEE = 'EMPLOYEE', 'Employee'

class AttendanceStatus(models.TextChoices):
    PRESENT = 'PRESENT', 'Present'
    ABSENT = 'ABSENT', 'Absent'
    HALF_DAY = 'HALF_DAY', 'Half Day'
    ON_LEAVE = 'ON_LEAVE', 'On Leave'

class LeaveType(models.TextChoices):
    PAID = 'PAID', 'Paid Leave'
    SICK = 'SICK', 'Sick Leave'
    UNPAID = 'UNPAID', 'Unpaid Leave'

class LeaveStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'



class User(AbstractUser):
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.EMPLOYEE, null=True, blank=True)
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)
    designation = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    joining_date = models.DateField(null=True, blank=True)
    paid_leave_balance = models.IntegerField(default=24, null=True, blank=True)
    sick_leave_balance = models.IntegerField(default=12, null=True, blank=True)
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='team')

class Attendance(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attendance', null=True, blank=True)
    date = models.DateField(default=timezone.now, null=True, blank=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    work_hours = models.CharField(max_length=10, null=True, blank=True)
    extra_hours = models.CharField(max_length=10, null=True, blank=True)
    status = models.CharField(max_length=20, choices=AttendanceStatus.choices, default=AttendanceStatus.ABSENT, null=True, blank=True)

class LeaveRequest(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves', null=True, blank=True)
    leave_type = models.CharField(max_length=20, choices=LeaveType.choices, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    reason = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=LeaveStatus.choices, default=LeaveStatus.PENDING, null=True, blank=True)
    admin_comment = models.TextField(null=True, blank=True)

class Payroll(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payrolls', null=True, blank=True)
    month = models.DateField(null=True, blank=True)
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    hra = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    other_allowances = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    pf = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    professional_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True, blank=True)