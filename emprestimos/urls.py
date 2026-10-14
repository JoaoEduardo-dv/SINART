from django.urls import path
from . import views


urlpatterns = [
    path('emprestimos/', views.emprestimos, name="emprestimos"),
    path('cadastroEmprestimos/', views.cadastroEmprestimos, name="cadastroEmprestimos"),
]