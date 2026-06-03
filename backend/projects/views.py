from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum
from django.contrib.auth.models import User
from rest_framework import serializers as drf_serializers
from .models import Projet, Tache, Cout, NonConformite
from .serializers import ProjetSerializer, TacheSerializer, CoutSerializer, NonConformiteSerializer

class UserMiniSerializer(drf_serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserMiniSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class ProjetViewSet(viewsets.ModelViewSet):
    serializer_class = ProjetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Projet.objects.filter(chef_projet=self.request.user)

    def perform_create(self, serializer):
        serializer.save(chef_projet=self.request.user)

    @action(detail=True, methods=['get'])
    def kpi(self, request, pk=None):
        projet = self.get_object()
        taches = projet.tache_set.all()
        total_taches = taches.count()
        taches_terminees = taches.filter(statut='done').count()
        taux_avancement = (taches_terminees / total_taches * 100) if total_taches > 0 else 0
        couts = projet.cout_set.all()
        total_prevu = couts.aggregate(Sum('montant_prevu'))['montant_prevu__sum'] or 0
        total_reel = couts.aggregate(Sum('montant_reel'))['montant_reel__sum'] or 0
        cpi = (total_prevu / total_reel) if total_reel > 0 else 1
        non_conformites = projet.nonconformite_set.all()
        total_nc = non_conformites.count()
        nc_resolues = non_conformites.filter(statut='resolue').count()
        taux_nc = (total_nc - nc_resolues) / total_taches * 100 if total_taches > 0 else 0
        spi = taux_avancement / 100 if taux_avancement > 0 else 0
        return Response({
            'projet': projet.nom,
            'taux_avancement': round(taux_avancement, 2),
            'spi': round(spi, 2),
            'cpi': round(cpi, 2),
            'total_taches': total_taches,
            'taches_terminees': taches_terminees,
            'budget_prevu': float(projet.budget_prevu),
            'budget_reel': float(projet.budget_reel),
            'taux_non_conformite': round(taux_nc, 2),
        })


class TacheViewSet(viewsets.ModelViewSet):
    serializer_class = TacheSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tache.objects.filter(projet__chef_projet=self.request.user)


class CoutViewSet(viewsets.ModelViewSet):
    serializer_class = CoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cout.objects.filter(projet__chef_projet=self.request.user)


class NonConformiteViewSet(viewsets.ModelViewSet):
    serializer_class = NonConformiteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NonConformite.objects.filter(projet__chef_projet=self.request.user)


@login_required
def dashboard(request):
    return render(request, 'projects/dashboard.html')