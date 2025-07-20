from django.urls import include, path
from .views import (
    RegisterView,
    LoginView,
    RoleSelectionView,
    SocialAuthView,
    PublicBoardListsView,
    PublicCardCreateView
)
from .views import (
    ProjectListCreateView, ProjectDetailView,
    BoardView, BoardListCreateView,
    CardListCreateView, CardDetailView,
    AttachmentListCreateView,
    ReportListCreateView,
    EventListCreateView,
    CommunicationListCreateView
)
from .views import (
    TaskListCreateView,
    TaskDetailView,
    NotificationListView,
    NotificationMarkAsReadView,
    GanttChartView,
    GanttTaskView,
    FileListView , 
    ProjectListCreateView
)
from .views import (
    ReportListCreateView, ReportDetailView, ReportFileUploadView,
    SubTaskListCreateView, FileShareListCreateView,
    AccessPermissionListCreateView
)
from django.urls import path
from . import views
from rest_framework.routers import DefaultRouter
from .views import YourModelViewSet

router = DefaultRouter()
router.register(r'yourmodel', YourModelViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('role/', RoleSelectionView.as_view(), name='role-selection'),
    path('social-auth/', SocialAuthView.as_view(), name='social-auth'),
    path('projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('projects/<int:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('projects/<int:project_id>/board/', BoardView.as_view(), name='board-detail'),
    path('boards/<int:board_id>/lists/', BoardListCreateView.as_view(), name='board-list-list'),
    path('lists/<int:list_id>/cards/', CardListCreateView.as_view(), name='card-list'),
    path('cards/<int:pk>/', CardDetailView.as_view(), name='card-detail'),
    path('projects/<int:project_id>/attachments/', AttachmentListCreateView.as_view(), name='attachment-list'),
    path('projects/<int:project_id>/reports/', ReportListCreateView.as_view(), name='report-list'),
    path('projects/<int:project_id>/events/', EventListCreateView.as_view(), name='event-list'),
    path('projects/<int:project_id>/communications/', CommunicationListCreateView.as_view(), name='communication-list'),
    path('tasks/', TaskListCreateView.as_view(), name='task-list'),
    path('tasks/<int:pk>/', TaskDetailView.as_view(), name='task-detail'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/mark-as-read/', NotificationMarkAsReadView.as_view(), name='notification-mark-read'),
    path('projects/<int:project_id>/gantt-chart/', GanttChartView.as_view(), name='gantt-chart'),
    path('projects/<int:project_id>/gantt-tasks/', GanttTaskView.as_view(), name='gantt-task-list'),
    path('reports/', ReportListCreateView.as_view(), name='report-list'),
    path('reports/<int:pk>/', ReportDetailView.as_view(), name='report-detail'),
    path('reports/<int:report_id>/files/', ReportFileUploadView.as_view(), name='report-file-upload'),
    path('tasks/<int:parent_task_id>/subtasks/', SubTaskListCreateView.as_view(), name='subtask-list'),
    path('files/share/', FileShareListCreateView.as_view(), name='file-share-list'),
    path('access-permissions/', AccessPermissionListCreateView.as_view(), name='access-permission-list'),
    path('register/', views.register_api, name='register_api'),
    path('csrf/', views.get_csrf_token, name='get_csrf_token'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('upload-files/', views.upload_files, name='upload-files'),
    path('api/communications/', CommunicationListCreateView.as_view(), name='communication-list'),
    path('api/projects/', ProjectListCreateView.as_view(), name='project-list'),
    path('api/public/boards/<int:board_id>/lists/', PublicBoardListsView.as_view(), name='public-board-lists'),
    path('api/public/lists/<int:list_id>/cards/', PublicCardCreateView.as_view(), name='public-create-card'),

]