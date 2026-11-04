from django.urls import path
from . import views

urlpatterns = [
    path('usuarios/', views.usuarios, name="usuarios"),
    path('permissoesUsuarios/', views.permissoesUsuarios, name="permissoesUsuarios"),
    path('cadastroUsuario/', views.cadastroUsuario, name="cadastroUsuario"),
]