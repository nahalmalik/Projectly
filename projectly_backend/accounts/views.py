from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    SocialAuthSerializer
)
from .models import SocialAccount, UserProfile
import requests
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse, JsonResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import (
    Project, Board, BoardList, Card, 
    Attachment, Report, Event, Communication,
    Task, Notification, GanttChart,
    SubTask, FileShare, AccessPermission
)
from .serializers import (
    ProjectSerializer, BoardSerializer, BoardListSerializer,
    CardSerializer, AttachmentSerializer, ReportSerializer,
    EventSerializer, CommunicationSerializer,
    TaskSerializer, NotificationSerializer,
    GanttChartSerializer, GanttTaskSerializer,
    SubTaskSerializer, FileShareSerializer,
    AccessPermissionSerializer, ReportFileSerializer
)
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import json
from django.middleware.csrf import get_token
import os
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
from rest_framework import viewsets
from .models import YourModel
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer, YourModelSerializer

class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.projects.all()
    
class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()
    serializer_class = YourModelSerializer
    
User = get_user_model() 

# Utility Views
def home(request):
    return HttpResponse("Welcome to Projectly Backend{go to this link to open admin panel  http://127.0.0.1:8000/admin/}")

def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

@csrf_exempt
def upload_files(request):
    if request.method == 'POST':
        try:
            uploaded_files = []
            for i in range(1, 4):
                file_key = f'file_{i}'
                if file_key in request.FILES:
                    uploaded_file = request.FILES[file_key]
                    path = default_storage.save(
                        os.path.join('uploads', uploaded_file.name),
                        ContentFile(uploaded_file.read())
                    )
                    # Save to FileShare model for persistence
                    file_share = FileShare.objects.create(
                        file=path,
                        uploaded_by=User.objects.first()  # Use first user as default
                    )
                    uploaded_files.append({
                        'id': file_share.id,
                        'name': uploaded_file.name,
                        'size': uploaded_file.size,
                        'url': default_storage.url(path)
                    })
            return JsonResponse({'status': 'success', 'files': uploaded_files}, status=200)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

@csrf_exempt
def register_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        required_fields = ['name', 'email', 'password', 'confirmPassword', 'role']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'{field} is required'}, status=400)
        
        try:
            validate_email(data['email'])
        except ValidationError:
            return JsonResponse({'error': 'Invalid email format'}, status=400)
        
        if User.objects.filter(email=data['email']).exists():
            return JsonResponse({'error': 'Email already exists'}, status=400)
        
        if data['password'] != data['confirmPassword']:
            return JsonResponse({'error': 'Passwords do not match'}, status=400)
        
        if len(data['password']) < 8:
            return JsonResponse({'error': 'Password must be at least 8 characters'}, status=400)
        
        if not any(char.isdigit() for char in data['password']):
            return JsonResponse({'error': 'Password must contain at least one number'}, status=400)
        
        if not any(char.isupper() for char in data['password']):
            return JsonResponse({'error': 'Password must contain at least one uppercase letter'}, status=400)
        
        name_parts = data['name'].split(' ', 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            first_name=first_name,
            last_name=last_name
        )
        
        profile = user.profile
        profile.role = data['role']
        profile.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'email': user.email,
                'name': f"{user.first_name} {user.last_name}",
                'role': profile.get_role_display()
            }
        }, status=201)
    
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# Authentication Views
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user_id": user.id,
                "email": user.email,
                "role": user.userprofile.role
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoleSelectionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response({"role": None})
    
    def post(self, request):
        try:
            profile = request.user.profile
            serializer = UserProfileSerializer(profile, data=request.data)
        except UserProfile.DoesNotExist:
            serializer = UserProfileSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SocialAuthView(APIView):
    def post(self, request):
        serializer = SocialAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        provider = serializer.validated_data['provider']
        access_token = serializer.validated_data['access_token']
        
        user_info = self._get_user_info(provider, access_token)
        if not user_info:
            return Response({"error": "Invalid token or provider error"}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        email = user_info.get('email')
        if not email:
            return Response({"error": "Email not provided by the provider"}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = User.objects.create_user(email=email, password=None)
            user.is_email_verified = True
            user.save()
        
        social_account, created = SocialAccount.objects.get_or_create(
            provider=provider,
            provider_id=user_info['id'],
            defaults={'user': user}
        )
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'email': user.email,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    
    def _get_user_info(self, provider, access_token):
        if provider == 'google':
            return self._get_google_user_info(access_token)
        elif provider == 'apple':
            return self._get_apple_user_info(access_token)
        elif provider == 'microsoft':
            return self._get_microsoft_user_info(access_token)
        return None
    
    def _get_google_user_info(self, access_token):
        response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            params={'access_token': access_token}
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'id': data['sub'],
                'email': data['email'],
                'name': data.get('name', '')
            }
        return None
    
    def _get_apple_user_info(self, access_token):
        return {
            'id': access_token[:20],
            'email': f"apple_user_{access_token[:5]}@example.com"
        }
    
    def _get_microsoft_user_info(self, access_token):
        response = requests.get(
            'https://graph.microsoft.com/v1.0/me',
            headers={'Authorization': f'Bearer {access_token}'}
        )
        if response.status_code == 200:
            data = response.json()
            return {
                'id': data['id'],
                'email': data.get('mail') or data.get('userPrincipalName'),
                'name': data.get('displayName', '')
            }
        return None

# Project Management Views
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    authentication_classes = []  # Remove authentication

    def get_queryset(self):
        return Project.objects.all()  # Return all projects

    def perform_create(self, serializer):
        default_user = User.objects.first()  # Use first user as default
        serializer.save(created_by=default_user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.projects.all()

class BoardView(generics.RetrieveAPIView):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Board.objects.filter(project__members=self.request.user)

class BoardListCreateView(generics.ListCreateAPIView):
    serializer_class = BoardListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        board_id = self.kwargs.get('board_id')
        return BoardList.objects.filter(board_id=board_id, board__project__members=self.request.user)

    def perform_create(self, serializer):
        board_id = self.kwargs.get('board_id')
        board = generics.get_object_or_404(Board, id=board_id, project__members=self.request.user)
        serializer.save(board=board)

class CardListCreateView(generics.ListCreateAPIView):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        list_id = self.kwargs.get('list_id')
        return Card.objects.filter(list_id=list_id, list__board__project__members=self.request.user)

    def perform_create(self, serializer):
        list_id = self.kwargs.get('list_id')
        board_list = generics.get_object_or_404(
            BoardList, 
            id=list_id, 
            board__project__members=self.request.user
        )
        serializer.save(created_by=self.request.user, list=board_list)

class CardDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(list__board__project__members=self.request.user)

class AttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Attachment.objects.filter(project_id=project_id, project__members=self.request.user)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id, members=self.request.user)
        serializer.save(uploaded_by=self.request.user, project=project)

class ReportListCreateView(generics.ListCreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Report.objects.filter(project_id=project_id, project__members=self.request.user)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id, members=self.request.user)
        serializer.save(created_by=self.request.user, project=project)

class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Report.objects.filter(
            Q(created_by=self.request.user) | 
            Q(shared_with=self.request.user)
        ).distinct()
    
class EventListCreateView(generics.ListCreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Event.objects.filter(project_id=project_id, project__members=self.request.user)

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id, members=self.request.user)
        serializer.save(created_by=self.request.user, project=project)

class CommunicationListCreateView(generics.ListCreateAPIView):
    serializer_class = CommunicationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        return Communication.objects.filter(
            project_id=project_id, 
            project__members=self.request.user
        )

    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id, members=self.request.user)
        serializer.save(sender=self.request.user, project=project)

# Task Management Views
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = []  # Allow unauthenticated access
    authentication_classes = []  # Remove authentication

    def get_queryset(self):
        return Task.objects.all()  # Return all tasks

    def perform_create(self, serializer):
        default_user = User.objects.first()  # Use first user as default
        project_id = self.request.data.get('project')
        project = None
        if project_id:
            project = get_object_or_404(Project, id=project_id)
        serializer.save(created_by=default_user, project=project)

class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    authentication_classes = []  # Remove authentication

    def get_queryset(self):
        return Task.objects.all()  # Return all tasks

class FileListView(generics.ListAPIView):
    serializer_class = FileShareSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    authentication_classes = []  # Remove authentication

    def get_queryset(self):
        return FileShare.objects.all()  # Return all files

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        is_read = self.request.query_params.get('is_read')
        queryset = Notification.objects.filter(user=self.request.user)
        
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
            
        return queryset.order_by('-created_at')

class NotificationMarkAsReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, is_read=False)
    
    def update(self, request, *args, **kwargs):
        notifications = self.get_queryset()
        notifications.update(is_read=True)
        return Response({'status': 'notifications marked as read'}, status=status.HTTP_200_OK)

# views.py
class GanttChartView(generics.RetrieveAPIView):
    serializer_class = GanttChartSerializer
    permission_classes = [permissions.AllowAny]  # Changed from IsAuthenticated
    
    def get_object(self):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id)
        gantt_chart, created = GanttChart.objects.get_or_create(project=project)
        return gantt_chart

class GanttTaskView(generics.ListCreateAPIView):
    serializer_class = GanttTaskSerializer
    permission_classes = [permissions.AllowAny]  # Changed from IsAuthenticated
    
    def get_queryset(self):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id)
        gantt_chart = generics.get_object_or_404(GanttChart, project=project)
        return gantt_chart.gantt_tasks.all()
    
    def perform_create(self, serializer):
        project_id = self.kwargs.get('project_id')
        project = generics.get_object_or_404(Project, id=project_id)
        gantt_chart = generics.get_object_or_404(GanttChart, project=project)
        serializer.save(gantt_chart=gantt_chart)

# Report and File Sharing Views
class ReportFileUploadView(generics.CreateAPIView):
    serializer_class = ReportFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        report = get_object_or_404(
            Report, 
            id=kwargs['report_id'],
            created_by=request.user
        )
        file_serializer = self.get_serializer(data=request.data)
        file_serializer.is_valid(raise_exception=True)
        file_serializer.save(report=report)
        return Response(file_serializer.data, status=status.HTTP_201_CREATED)

class SubTaskListCreateView(generics.ListCreateAPIView):
    serializer_class = SubTaskSerializer
    permission_classes = [AllowAny]  # Allow unauthenticated access
    authentication_classes = []  # Remove authentication

    def get_queryset(self):
        parent_task_id = self.kwargs.get('parent_task_id')
        return SubTask.objects.filter(parent_task_id=parent_task_id)

    def perform_create(self, serializer):
        parent_task = get_object_or_404(Task, id=self.kwargs['parent_task_id'])
        serializer.save(parent_task=parent_task)

class FileShareListCreateView(generics.ListCreateAPIView):
    serializer_class = FileShareSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return FileShare.objects.filter(project_id=project_id)
        return FileShare.objects.all()
    
    def create(self, request, *args, **kwargs):
        if 'files' in request.FILES:
            files = request.FILES.getlist('files')
            created_files = []
            for file in files:
                serializer = self.get_serializer(data={
                    'file': file,
                    'project': request.data.get('project'),
                    'shared_with': request.data.get('shared_with', []),
                    'description': request.data.get('description', '')
                })
                serializer.is_valid(raise_exception=True)
                self.perform_create(serializer)
                created_files.append(serializer.data)
            return Response(created_files, status=status.HTTP_201_CREATED)
        
        return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class AccessPermissionListCreateView(generics.ListCreateAPIView):
    serializer_class = AccessPermissionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project_id')
        if project_id:
            return AccessPermission.objects.filter(
                project_id=project_id,
                granted_by=self.request.user
            )
        return AccessPermission.objects.filter(granted_by=self.request.user)
    
    def perform_create(self, serializer):
        project = get_object_or_404(
            Project, 
            id=serializer.validated_data['project'].id,
            members=self.request.user
        )
        serializer.save(granted_by=self.request.user)
# In your views.py

from rest_framework import generics, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import BoardList, Card
from .serializers import BoardListSerializer, CardSerializer

class PublicBoardListsView(generics.ListAPIView):
    serializer_class = BoardListSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def get_queryset(self):
        board_id = self.kwargs.get('board_id')
        return BoardList.objects.filter(board_id=board_id).prefetch_related('card_set')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        board_lists_data = []
        for board_list in queryset:
            list_data = BoardListSerializer(board_list).data
            list_data['cards'] = CardSerializer(board_list.card_set.all(), many=True).data
            board_lists_data.append(list_data)
        return Response(board_lists_data)

class PublicCardCreateView(generics.CreateAPIView):
    serializer_class = CardSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def perform_create(self, serializer):
        list_id = self.kwargs.get('list_id')
        try:
            board_list = BoardList.objects.get(id=list_id)
        except BoardList.DoesNotExist:
            raise serializers.ValidationError({"list": "Invalid board list ID."})
        serializer.save(list=board_list)