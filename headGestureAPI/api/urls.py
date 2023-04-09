from django.urls import path
from . import views

urlpatterns = [
    path('detectHeadGesture/', views.detectHeadGesture),
]