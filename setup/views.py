from django.shortcuts import render

def minha_pagina_view(request):
    # Retorna o arquivo HTML que criamos na pasta templates
    return render(request, 'index.html')
