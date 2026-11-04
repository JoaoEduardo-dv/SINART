from django.shortcuts import render

def configuracoes(request):
    return render (request, 'setup/config.html')