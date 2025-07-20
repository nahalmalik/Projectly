# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import (
    UserProfile, Project, Board, BoardList, Card, 
    Attachment, Report, ReportFile, Event, Communication,
    Task, Notification, GanttChart, GanttTask,
    SubTask, FileShare, AccessPermission, YourModel
)
from rest_framework_simplejwt.tokens import RefreshToken
class YourModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = YourModel
        fields = '__all__'
# First define ReportFileSerializer since it's used in ReportSerializer
class ReportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportFile
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['uploaded_at']

# Then define ReportSerializer which uses ReportFileSerializer
class ReportSerializer(serializers.ModelSerializer):
    files = ReportFileSerializer(many=True, read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    shared_with_emails = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
    
    def get_shared_with_emails(self, obj):
        return [user.email for user in obj.shared_with.all()]

# Then continue with the rest of your serializers
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    confirm_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    name = serializers.CharField(write_only=True, required=True)
    role = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'confirm_password', 'name', 'role']

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        # Create user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('name', '').split(' ')[0],
            last_name=' '.join(validated_data.get('name', '').split(' ')[1:]),
        )
        
        # Create or update user profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'role': validated_data['role']}
        )
        
        if not created:
            profile.role = validated_data['role']
            profile.save()
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        refresh = RefreshToken.for_user(user)
        return {
            'email': user.email,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role',)

class SocialAuthSerializer(serializers.Serializer):
    provider = serializers.CharField()
    access_token = serializers.CharField()
    
    def validate_provider(self, value):
        if value.lower() not in ['google', 'apple', 'microsoft']:
            raise serializers.ValidationError("Unsupported provider")
        return value.lower()

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at', 'updated_at')

class BoardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Board
        fields = '__all__'

class BoardListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardList
        fields = '__all__'

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'uploaded_at')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['file'] = instance.file.url if instance.file else None
        return representation

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')

class CommunicationSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    recipient_emails = serializers.SerializerMethodField()

    class Meta:
        model = Communication
        fields = '__all__'
        read_only_fields = ('sender', 'sent_at')

    def get_recipient_emails(self, obj):
        return [user.email for user in obj.recipients.all()]

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'assigned_to': {'required': False},
            'due_date': {'required': False},
            'project': {'required': False},
        }
class NotificationSerializer(serializers.ModelSerializer):
    related_task_title = serializers.CharField(source='related_task.title', read_only=True)
    related_project_name = serializers.CharField(source='related_project.name', read_only=True)
    
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('created_at',)

class GanttChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = GanttChart
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')

class GanttTaskSerializer(serializers.ModelSerializer):
    dependencies = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=GanttTask.objects.all(), 
        required=False
    )
    
    class Meta:
        model = GanttTask
        fields = '__all__'
        read_only_fields = ('created_at',)

class SubTaskSerializer(serializers.ModelSerializer):
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True)
    parent_task_title = serializers.CharField(source='parent_task.title', read_only=True)
    
    class Meta:
        model = SubTask
        fields = '__all__'
        read_only_fields = ['created_at']

class FileShareSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source='uploaded_by.email', read_only=True)
    shared_with_emails = serializers.SerializerMethodField()
    project_name = serializers.CharField(source='project.name', read_only=True, allow_null=True)
    
    class Meta:
        model = FileShare
        fields = '__all__'
        read_only_fields = ['uploaded_by', 'uploaded_at']
    
    def get_shared_with_emails(self, obj):
        return [user.email for user in obj.shared_with.all()]

class AccessPermissionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    granted_by_email = serializers.EmailField(source='granted_by.email', read_only=True)
    
    class Meta:
        model = AccessPermission
        fields = '__all__'
        read_only_fields = ['granted_by', 'granted_at']