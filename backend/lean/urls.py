from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"mudas", views.MudaViewSet, basename="muda")
router.register(r"kaizens", views.KaizenViewSet, basename="kaizen")
router.register(r"vsm-steps", views.VSMStepViewSet, basename="vsmstep")

urlpatterns = [
    path("", include(router.urls)),
]
