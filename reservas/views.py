from django.shortcuts import render

# Create your views here.
def inicio (request):
    return render (request, 'inicio.html')

def reservas (request):
    return render (request, 'reservas/reservas.html')

def cadastroReservas (request):
    return render (request, 'reservas/cadastroReservas.html')

def atividades (request):
    return render (request, 'Painel de atividades/atividades.html')

def login (request):
    return render (request, 'index.html')

def aulas (request):
    return render (request, 'aulas/aulas.html')