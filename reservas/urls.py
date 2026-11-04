from django.urls import path
from . import views


urlpatterns = [
    path('', views.login, name="login"),
    path('inicio/', views.inicio, name="inicio"),
    path('reservas/', views.reservas, name="reservas"),
    path('cadastroReservas/', views.cadastroReservas, name='cadastroReservas'),
    path('atividades/', views.atividades, name="atividades"),
    path('aulas/', views.aulas, name="aulas"),
    path('cadastroAulas/', views.cadastroAulas, name="cadastroAulas"),
    path('cadastroAtividades/', views.cadastroAtividades, name="cadastroAtividades"),
]