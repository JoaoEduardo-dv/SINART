from django.urls import path
from reservas.views import index

urlpatterns = [
    path('',index),
]

