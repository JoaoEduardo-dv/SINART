from django.shortcuts import render

# Create your views here.
def usuarios (request):
    return render (request, 'usuários/usuarios.html')

def permissoesUsuarios (request):
    return render (request, 'usuários/permissoesUsuarios.html')

def cadastroUsuario (request):
    return render (request, 'usuários/cadastroUsuario.html')

def cadastroPerfil(request):
    return render (request, 'usuários/cadastroPerfil.html')

def meuPerfil(request):
    return render (request, 'usuário/meuPerfil.html')