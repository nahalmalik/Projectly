from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import validate_email
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class YourModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    # Add other fields as needed
    
    def __str__(self):
        return self.name
class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

class User(AbstractUser):
    email = models.EmailField(
        unique=True,
        validators=[validate_email],
        error_messages={
            'unique': "A user with that email already exists.",
        }
    )
    is_email_verified = models.BooleanField(default=False)
    
    # Remove username field as we'll use email
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

class UserProfile(models.Model):
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='profile'  # This enables user.profile access
    )
    ROLE_CHOICES = [
        ('head', 'Head'),
        ('program_manager', 'Program Manager'),
        ('committee_member', 'Committee Member'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    
    def __str__(self):
        return f"{self.user.username}'s profile"

# This creates a profile when a user is created
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)
    instance.userprofile.save()

class SocialAccount(models.Model):
    PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('apple', 'Apple'),
        ('microsoft', 'Microsoft'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_accounts')
    provider = models.CharField(max_length=50, choices=PROVIDER_CHOICES)
    provider_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('provider', 'provider_id')
    
    def __str__(self):
        return f"{self.user.email} - {self.provider}"

User = get_user_model()

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    members = models.ManyToManyField(User, related_name='projects')
    
    def __str__(self):
        return self.name

class Board(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='boards')
    name = models.CharField(max_length=255, default='Default Board')
    
    def __str__(self):
        return f"{self.project.name} - {self.name}"

class BoardList(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name='lists')
    name = models.CharField(max_length=100)
    position = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ['position']
    
    def __str__(self):
        return f"{self.board} - {self.name}"

class Card(models.Model):
    list = models.ForeignKey(BoardList, on_delete=models.CASCADE, related_name='cards')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['position']
    
    def __str__(self):
        return self.title

class Attachment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='attachments/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=255, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.name:
            self.name = self.file.name
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name

class Event(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"

class Communication(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='communications')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipients = models.ManyToManyField(User, related_name='received_messages')
    sent_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.subject

# models.py
class Task(models.Model):
    STATUS_CHOICES = [
        ('to do', 'To Do'),
        ('in progress', 'In Progress'),
        ('done', 'Done'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='to do')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)

class Notification(models.Model):
    TYPE_CHOICES = [
        ('task_assigned', 'Task Assigned'),
        ('task_due', 'Task Due Soon'),
        ('mention', 'Mention'),
        ('update', 'Project Update'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.TextField()
    related_task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    related_project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.get_notification_type_display()}"

class GanttChart(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='gantt_chart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Gantt Chart - {self.project.name}"

class GanttTask(models.Model):
    gantt_chart = models.ForeignKey(GanttChart, on_delete=models.CASCADE, related_name='gantt_tasks')
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    progress = models.PositiveIntegerField(default=0)
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.gantt_chart.project.name} - {self.name}"

class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('progress', 'Progress Report'),
        ('financial', 'Financial Report'),
        ('summary', 'Summary Report'),
        ('standard', 'Standard Report'),
    ]
    
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, default='standard')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    shared_with = models.ManyToManyField(User, related_name='shared_reports', blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='reports', null=True, blank=True)
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.title}"

class ReportFile(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='reports/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"File for {self.report.title}"

class SubTask(models.Model):
    parent_task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Subtask: {self.title} for {self.parent_task.title}"

class FileShare(models.Model):
    file = models.FileField(upload_to='shared_files/%Y/%m/%d/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    shared_with = models.ManyToManyField(User, related_name='shared_files')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return f"Shared file: {self.file.name}"

class AccessPermission(models.Model):
    PERMISSION_CHOICES = [
        ('view', 'View'),
        ('edit', 'Edit'),
        ('admin', 'Admin'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey('Project', on_delete=models.CASCADE)
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES)
    granted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='granted_permissions')
    granted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'project')
    
    def __str__(self):
        return f"{self.user.email} has {self.get_permission_display()} access to {self.project.name}"