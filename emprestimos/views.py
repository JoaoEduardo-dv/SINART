from django.shortcuts import render

# Create your views here.
def emprestimos (request):
    return render (request, 'emprestimos/emprestimos.html')

def cadastroEmprestimos (request):
    return render (request, 'emprestimos/cadastroEmprestimos.html')