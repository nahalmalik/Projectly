from django.contrib import admin
from .models import (
    Project, Board, BoardList, Card,
    Attachment, Report, Event, Communication,
    Task, Notification, GanttChart, GanttTask,
    ReportFile, SubTask, FileShare, AccessPermission
)
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

# First section - using decorators
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at')
    filter_horizontal = ('members',)

@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ('name', 'project')

@admin.register(BoardList)
class BoardListAdmin(admin.ModelAdmin):
    list_display = ('name', 'board', 'position')
    list_filter = ('board',)

@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ('title', 'list', 'created_by', 'due_date')
    list_filter = ('list__board',)

@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'project', 'uploaded_by')
    readonly_fields = ('uploaded_at',)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'start_date', 'end_date')

@admin.register(Communication)
class CommunicationAdmin(admin.ModelAdmin):
    list_display = ('subject', 'project', 'sender', 'sent_at')
    filter_horizontal = ('recipients',)

# Second section - using explicit registration
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'status', 'assigned_to', 'due_date' )
    list_filter = ('status', 'project', 'assigned_to' )
    search_fields = ('title', 'description')
    date_hierarchy = 'due_date'
    ordering = ('-due_date', 'status')

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('message', 'user__email')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)

class GanttTaskInline(admin.TabularInline):
    model = GanttTask
    extra = 1

class GanttChartAdmin(admin.ModelAdmin):
    list_display = ('project', 'created_at', 'updated_at')
    search_fields = ('project__name',)
    date_hierarchy = 'created_at'
    inlines = [GanttTaskInline]

class GanttTaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'gantt_chart', 'start_date', 'end_date', 'progress')
    list_filter = ('gantt_chart__project',)
    search_fields = ('name',)
    date_hierarchy = 'start_date'
    

class ReportFileInline(admin.TabularInline):
    model = ReportFile
    extra = 1

@admin.register(Report)  # Using decorator here instead of explicit registration
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'created_by', 'created_at')
    list_filter = ('report_type', 'created_at')
    search_fields = ('title', 'created_by__email')
    inlines = [ReportFileInline]
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(created_by=request.user)

class SubTaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'parent_task', 'assigned_to', 'due_date', 'completed')
    list_filter = ('completed', 'due_date')
    search_fields = ('title', 'parent_task__title', 'assigned_to__email')
    
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(parent_task__project__members=request.user)

class FileShareAdmin(admin.ModelAdmin):
    list_display = ('file', 'uploaded_by', 'uploaded_at', 'get_shared_with')
    list_filter = ('uploaded_at', 'project')
    search_fields = ('file', 'uploaded_by__email')
    filter_horizontal = ('shared_with',)
    
    def get_shared_with(self, obj):
        return ", ".join([user.email for user in obj.shared_with.all()])
    get_shared_with.short_description = 'Shared With'
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(uploaded_by=request.user)

class AccessPermissionAdmin(admin.ModelAdmin):
    list_display = ('user', 'project', 'permission', 'granted_by', 'granted_at')
    list_filter = ('permission', 'granted_at')
    search_fields = ('user__email', 'project__name', 'granted_by__email')
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(granted_by=request.user)

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'get_role')
    
    def get_role(self, instance):
        return instance.userprofile.role
    get_role.short_name = 'Role'

# Only register if not already registered
if admin.site.is_registered(User):
    admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.register(UserProfile)
# Register all models that haven't been registered with decorators
admin.site.register(Task, TaskAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(GanttChart, GanttChartAdmin)
admin.site.register(GanttTask, GanttTaskAdmin)
admin.site.register(SubTask, SubTaskAdmin)
admin.site.register(FileShare, FileShareAdmin)
admin.site.register(AccessPermission, AccessPermissionAdmin)
