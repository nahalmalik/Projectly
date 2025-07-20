import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS').split(',')

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-acu8$*m438rj*@=n479nec2x8^=xz%&mchgxpsohzp&dqpmr8j'

DEBUG = True

ALLOWED_HOSTS = []

CORS_ALLOWED_ORIGINS = [
      "http://127.0.0.1:3000",
      "http://localhost:3000",
      "http://127.0.0.1:4000",
      "http://localhost:4000",
  ]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = True

INSTALLED_APPS = [
      'django.contrib.admin',
      'django.contrib.auth',
      'django.contrib.contenttypes',
      'django.contrib.sessions',
      'django.contrib.messages',
      'django.contrib.staticfiles',
      'accounts',
      'rest_framework',
      'rest_framework_simplejwt',
      'corsheaders',
  ]

AUTH_USER_MODEL = 'accounts.User'
REST_FRAMEWORK = {
      'DEFAULT_AUTHENTICATION_CLASSES': (
          'rest_framework_simplejwt.authentication.JWTAuthentication',
          'rest_framework.authentication.TokenAuthentication',
          'rest_framework.authentication.SessionAuthentication',
      ),
      'DEFAULT_PERMISSION_CLASSES': (
          'rest_framework.permissions.AllowAny',
      ),
      'DEFAULT_PAGINATION_CLASS': None,  # Disable pagination
      'PAGE_SIZE': None
  }

SOCIAL_AUTH_GOOGLE_CLIENT_ID = 'your-google-client-id'
SOCIAL_AUTH_GOOGLE_SECRET = 'your-google-secret'

SOCIAL_AUTH_MICROSOFT_CLIENT_ID = 'your-microsoft-client-id'
SOCIAL_AUTH_MICROSOFT_SECRET = 'your-microsoft-secret'
SOCIAL_AUTH_MICROSOFT_TENANT = 'common'

SOCIAL_AUTH_APPLE_CLIENT_ID = 'your-apple-client-id'
SOCIAL_AUTH_APPLE_TEAM_ID = 'your-apple-team-id'
SOCIAL_AUTH_APPLE_KEY_ID = 'your-apple-key-id'
SOCIAL_AUTH_APPLE_PRIVATE_KEY = 'your-apple-private-key'

MIDDLEWARE = [
      'corsheaders.middleware.CorsMiddleware',
      'django.middleware.security.SecurityMiddleware',
      'django.contrib.sessions.middleware.SessionMiddleware',
      'django.middleware.common.CommonMiddleware',
      'django.middleware.csrf.CsrfViewMiddleware',
      'django.contrib.auth.middleware.AuthenticationMiddleware',
      'django.contrib.messages.middleware.MessageMiddleware',
      'django.middleware.clickjacking.XFrameOptionsMiddleware',
  ]

ROOT_URLCONF = 'projectly_backend.urls'

TEMPLATES = [
      {
          'BACKEND': 'django.template.backends.django.DjangoTemplates',
          'DIRS': [],
          'APP_DIRS': True,
          'OPTIONS': {
              'context_processors': [
                  'django.template.context_processors.request',
                  'django.contrib.auth.context_processors.auth',
                  'django.contrib.messages.context_processors.messages',
              ],
          },
      },
  ]

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

WSGI_APPLICATION = 'projectly_backend.wsgi.application'

DATABASES = {
      'default': {
          'ENGINE': 'django.db.backends.sqlite3',
          'NAME': BASE_DIR / 'db.sqlite3',
      }
  }

AUTH_PASSWORD_VALIDATORS = [
      {
          'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
      },
      {
          'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
      },
      {
          'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
      },
      {
          'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
      },
  ]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

STATIC_URL = 'static/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'