# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Notification
from django.contrib.auth.models import User
from .models import UserProfile
@receiver(post_save, sender=Task)
def create_task_notification(sender, instance, created, **kwargs):
    if created and instance.assigned_to:
        Notification.objects.create(
            user=instance.assigned_to,
            notification_type='task_assigned',
            message=f'You have been assigned a new task: {instance.title}',
            related_task=instance,
            related_project=instance.project
        )
    elif instance.assigned_to and instance.assigned_to != Task.objects.get(id=instance.id).assigned_to:
        Notification.objects.create(
            user=instance.assigned_to,
            notification_type='task_assigned',
            message=f'You have been assigned a new task: {instance.title}',
            related_task=instance,
            related_project=instance.project
        )

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()
    else:
        UserProfile.objects.create(user=instance)
        