from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjetViewSet, basename='projet')
router.register(r'taches', views.TacheViewSet, basename='tache')
router.register(r'couts', views.CoutViewSet, basename='cout')
router.register(r'non-conformites', views.NonConformiteViewSet, basename='nonconformite')
router.register(r'users', views.UserListViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]