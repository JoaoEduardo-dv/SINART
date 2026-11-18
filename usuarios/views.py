from django.shortcuts import render

# Create your views here.
def usuarios (request):
    return render (request, 'usuarios/usuarios.html')

def permissoesUsuarios (request):
    return render (request, 'usuarios/permissoesUsuarios.html')

def cadastroUsuario (request):
    return render (request, 'usuarios/cadastroUsuario.html')

def cadastroPerfil(request):
    return render (request, 'usuarios/cadastroPerfil.html')

def meuPerfil(request):
    return render (request, 'usuarios/meuPerfil.html')