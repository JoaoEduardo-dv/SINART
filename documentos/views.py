from django.shortcuts import render

# Create your views here.
def documentos (request):
    return render (request, 'documentos/documentos.html')
