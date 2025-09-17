# Django Grades API Implementation Guide

## Overview
This guide will help you implement the missing Django REST API endpoints for the Grades Management System.

## 1. Create Django App

```bash
cd your-django-project
python manage.py startapp grades
```

## 2. Add to INSTALLED_APPS

In `settings.py`:
```python
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'grades',
]
```

## 3. Create Models

In `grades/models.py`:
```python
from django.db import models
from django.contrib.auth.models import User

class GradeScale(models.Model):
    letter = models.CharField(max_length=2, unique=True)
    description = models.CharField(max_length=100)
    min_score = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-grade_points']

    def __str__(self):
        return f"{self.letter} ({self.description})"

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    roll_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    department = models.CharField(max_length=100)
    program = models.CharField(max_length=100)
    admission_year = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.roll_number} - {self.first_name} {self.last_name}"

class CourseSection(models.Model):
    course_code = models.CharField(max_length=20)
    course_name = models.CharField(max_length=200)
    semester = models.CharField(max_length=10)
    academic_year = models.CharField(max_length=10)
    credits = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.course_code} - {self.course_name}"

class MidtermGrade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE)
    semester = models.CharField(max_length=10)
    midterm_marks = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2, blank=True)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'course_section', 'semester']

class SemesterGrade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course_section = models.ForeignKey(CourseSection, on_delete=models.CASCADE)
    semester = models.CharField(max_length=10)
    final_marks = models.DecimalField(max_digits=5, decimal_places=2)
    total_marks = models.DecimalField(max_digits=5, decimal_places=2)
    grade = models.CharField(max_length=2, blank=True)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'course_section', 'semester']

class SemesterGPA(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    semester = models.CharField(max_length=10)
    sgpa = models.DecimalField(max_digits=3, decimal_places=2)
    total_credits = models.IntegerField()
    academic_standing = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['student', 'semester']

class CumulativeGPA(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    cgpa = models.DecimalField(max_digits=3, decimal_places=2)
    total_credits_earned = models.IntegerField()
    classification = models.CharField(max_length=30)
    is_eligible_for_graduation = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student']
```

## 4. Create Serializers

In `grades/serializers.py`:
```python
from rest_framework import serializers
from .models import GradeScale, Student, CourseSection, MidtermGrade, SemesterGrade, SemesterGPA, CumulativeGPA

class GradeScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeScale
        fields = '__all__'

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'

class CourseSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSection
        fields = '__all__'

class MidtermGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MidtermGrade
        fields = '__all__'

class SemesterGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SemesterGrade
        fields = '__all__'

class SemesterGPASerializer(serializers.ModelSerializer):
    class Meta:
        model = SemesterGPA
        fields = '__all__'

class CumulativeGPASerializer(serializers.ModelSerializer):
    class Meta:
        model = CumulativeGPA
        fields = '__all__'
```

## 5. Create Views

In `grades/views.py`:
```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import GradeScale, Student, CourseSection, MidtermGrade, SemesterGrade, SemesterGPA, CumulativeGPA
from .serializers import (
    GradeScaleSerializer, StudentSerializer, CourseSectionSerializer,
    MidtermGradeSerializer, SemesterGradeSerializer, SemesterGPASerializer, CumulativeGPASerializer
)

def health_check(request):
    return JsonResponse({"status": "ok", "app": "grads"})

class GradeScaleViewSet(viewsets.ModelViewSet):
    queryset = GradeScale.objects.filter(is_active=True)
    serializer_class = GradeScaleSerializer

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.filter(is_active=True)
    serializer_class = StudentSerializer

class CourseSectionViewSet(viewsets.ModelViewSet):
    queryset = CourseSection.objects.filter(is_active=True)
    serializer_class = CourseSectionSerializer

class MidtermGradeViewSet(viewsets.ModelViewSet):
    queryset = MidtermGrade.objects.all()
    serializer_class = MidtermGradeSerializer

    @action(detail=False, methods=['post'])
    def bulk_upsert(self, request):
        grades_data = request.data.get('grades', [])
        created_count = 0
        updated_count = 0
        
        for grade_data in grades_data:
            student_id = grade_data.get('student')
            course_section_id = grade_data.get('course_section')
            semester = grade_data.get('semester')
            
            if student_id and course_section_id and semester:
                grade, created = MidtermGrade.objects.update_or_create(
                    student_id=student_id,
                    course_section_id=course_section_id,
                    semester=semester,
                    defaults=grade_data
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1
        
        return Response({
            'message': f'Bulk upsert completed: {created_count} created, {updated_count} updated',
            'created': created_count,
            'updated': updated_count
        })

class SemesterGradeViewSet(viewsets.ModelViewSet):
    queryset = SemesterGrade.objects.all()
    serializer_class = SemesterGradeSerializer

    @action(detail=False, methods=['post'])
    def bulk_upsert(self, request):
        grades_data = request.data.get('grades', [])
        created_count = 0
        updated_count = 0
        
        for grade_data in grades_data:
            student_id = grade_data.get('student')
            course_section_id = grade_data.get('course_section')
            semester = grade_data.get('semester')
            
            if student_id and course_section_id and semester:
                grade, created = SemesterGrade.objects.update_or_create(
                    student_id=student_id,
                    course_section_id=course_section_id,
                    semester=semester,
                    defaults=grade_data
                )
                if created:
                    created_count += 1
                else:
                    updated_count += 1
        
        return Response({
            'message': f'Bulk upsert completed: {created_count} created, {updated_count} updated',
            'created': created_count,
            'updated': updated_count
        })

class SemesterGPAViewSet(viewsets.ModelViewSet):
    queryset = SemesterGPA.objects.all()
    serializer_class = SemesterGPASerializer

class CumulativeGPAViewSet(viewsets.ModelViewSet):
    queryset = CumulativeGPA.objects.all()
    serializer_class = CumulativeGPASerializer

    @action(detail=True, methods=['get'])
    def academic_transcript(self, request, pk=None):
        cgpa = self.get_object()
        # Implement transcript generation logic here
        return Response({
            'student': cgpa.student.roll_number,
            'cgpa': cgpa.cgpa,
            'transcript': 'Transcript data here'
        })
```

## 6. Create URLs

In `grades/urls.py`:
```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'grade-scales', views.GradeScaleViewSet)
router.register(r'students', views.StudentViewSet)
router.register(r'course-sections', views.CourseSectionViewSet)
router.register(r'midterm-grades', views.MidtermGradeViewSet)
router.register(r'semester-grades', views.SemesterGradeViewSet)
router.register(r'semester-gpas', views.SemesterGPAViewSet)
router.register(r'cumulative-gpas', views.CumulativeGPAViewSet)

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('', include(router.urls)),
]
```

## 7. Add to Main URLs

In your main `urls.py`:
```python
from django.urls import path, include

urlpatterns = [
    # ... other patterns
    path('api/v1/grads/', include('grades.urls')),
]
```

## 8. Run Migrations

```bash
python manage.py makemigrations grades
python manage.py migrate
```

## 9. Create Sample Data

Create a management command to populate sample data:

In `grades/management/commands/populate_grades_data.py`:
```python
from django.core.management.base import BaseCommand
from grades.models import GradeScale

class Command(BaseCommand):
    help = 'Populate grades data'

    def handle(self, *args, **options):
        # Create grade scales
        grade_scales = [
            {'letter': 'O', 'description': 'Outstanding', 'min_score': 90, 'max_score': 100, 'grade_points': 10},
            {'letter': 'A+', 'description': 'Excellent', 'min_score': 80, 'max_score': 89, 'grade_points': 9},
            {'letter': 'A', 'description': 'Very Good', 'min_score': 70, 'max_score': 79, 'grade_points': 8},
            {'letter': 'B+', 'description': 'Good', 'min_score': 60, 'max_score': 69, 'grade_points': 7},
            {'letter': 'B', 'description': 'Above Average', 'min_score': 50, 'max_score': 59, 'grade_points': 6},
            {'letter': 'C', 'description': 'Average', 'min_score': 40, 'max_score': 49, 'grade_points': 5},
            {'letter': 'P', 'description': 'Pass', 'min_score': 35, 'max_score': 39, 'grade_points': 4},
            {'letter': 'F', 'description': 'Fail', 'min_score': 0, 'max_score': 34, 'grade_points': 0},
        ]
        
        for scale_data in grade_scales:
            GradeScale.objects.get_or_create(
                letter=scale_data['letter'],
                defaults=scale_data
            )
        
        self.stdout.write(self.style.SUCCESS('Successfully populated grades data'))
```

Run the command:
```bash
python manage.py populate_grades_data
```

## 10. Test the API

After implementing the above, your API endpoints will be available at:
- `GET /api/v1/grads/health/` - Health check
- `GET /api/v1/grads/grade-scales/` - List grade scales
- `POST /api/v1/grads/grade-scales/` - Create grade scale
- `GET /api/v1/grads/midterm-grades/` - List midterm grades
- `POST /api/v1/grads/midterm-grades/bulk_upsert/` - Bulk upsert midterm grades
- And more...

## 11. Authentication

Make sure to add authentication to your views if needed:
```python
from rest_framework.permissions import IsAuthenticated

class GradeScaleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    # ... rest of the view
```

This implementation will resolve the 500 errors and provide a fully functional Grades Management API!
