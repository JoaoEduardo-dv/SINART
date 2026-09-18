from django.urls import path
from . import views


urlpatterns = [
    path('inicio/', views.inicio, name="inicio"),
    path('reservas/', views.reservas, name="reservas"),
    path('emprestimos/', views.emprestimos, name="emprestimos"),
    path('cadastroReservas/', views.cadastroReservas, name='cadastroReservas')
]