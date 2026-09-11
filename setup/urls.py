from django.contrib import admin
from django.urls import path, include
# from reservas.views import index # <-- Importe a sua view
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path("", include("reservas.urls")), # <-- Rota vazia '' significa a página inicial do site
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
