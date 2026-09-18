from django.shortcuts import render

# Create your views here.
def inicio (request):
    return render (request, 'inicio.html')

def reservas (request):
    return render (request, 'reservas/reservas.html')

def emprestimos (request):
    return render (request, 'emprestimos/emprestimos.html')

def cadastroReservas (request):
    return render (request, 'reservas/cadastroReservas.html')