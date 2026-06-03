from rest_framework import viewsets, permissions
from .models import Muda, Kaizen, VSMStep
from .serializers import MudaSerializer, KaizenSerializer, VSMStepSerializer


class MudaViewSet(viewsets.ModelViewSet):
    serializer_class = MudaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Muda.objects.filter(projet__chef_projet=self.request.user)


class KaizenViewSet(viewsets.ModelViewSet):
    serializer_class = KaizenSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Kaizen.objects.filter(projet__chef_projet=self.request.user)


class VSMStepViewSet(viewsets.ModelViewSet):
    serializer_class = VSMStepSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VSMStep.objects.filter(projet__chef_projet=self.request.user)
