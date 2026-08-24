from django.contrib import admin
from django.urls import path
from setup.views import minha_pagina_view # <-- Importe a sua view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', minha_pagina_view, name='home'), # <-- Rota vazia '' significa a página inicial do site
]
