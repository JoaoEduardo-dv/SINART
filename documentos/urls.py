from django.urls import path
from . import views

urlpatterns = [
    path('documentos/', views.documentos, name="documentos"),
    path('informações/', views.informacoes, name="informações"),
]