from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from django.contrib.auth.models import User
from .models import Projet, Tache, Cout, NonConformite
from .serializers import ProjetSerializer, TacheSerializer, CoutSerializer, NonConformiteSerializer


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
            'budget_reel': float(total_reel),
            'taux_non_conformite': round(taux_nc, 2),
        })

    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        projet = self.get_object()
        taches = projet.tache_set.all()
        data = []
        import datetime
        for tache in taches:
            data.append({
                'id': tache.id,
                'titre': tache.titre,
                'date_debut': tache.date_debut,
                'date_fin': tache.date_fin,
                'statut': tache.statut,
                'priorite': tache.priorite,
                'en_retard': tache.date_fin < datetime.date.today() and tache.statut != 'done' if tache.date_fin else False
            })
        return Response(data)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        projet = self.get_object()
        taches = projet.tache_set.all()
        total = taches.count()
        terminees = taches.filter(statut='done').count()
        import datetime
        en_retard = [t for t in taches if t.date_fin and t.date_fin < datetime.date.today() and t.statut != 'done']
        return Response({
            'total_taches': total,
            'taches_terminees': terminees,
            'taches_en_retard': len(en_retard),
            'progression': round((terminees / total) * 100, 2) if total > 0 else 0
        })

    @action(detail=True, methods=['get'])
    def kpi_avances(self, request, pk=None):
        projet = self.get_object()
        taches = projet.tache_set.all()
        sprints = projet.sprint_set.all()
        total_taches = taches.count()
        taches_terminees = taches.filter(statut='done').count()
        taux_avancement = (taches_terminees / total_taches) * 100 if total_taches > 0 else 0
        spi = taux_avancement / 100 if taux_avancement > 0 else 0
        couts = projet.cout_set.all()
        total_prevu = couts.aggregate(Sum('montant_prevu'))['montant_prevu__sum'] or 0
        total_reel = couts.aggregate(Sum('montant_reel'))['montant_reel__sum'] or 0
        cpi = (total_prevu / total_reel) if total_reel > 0 else 1
        taches_terminees_qs = taches.filter(statut='done', date_debut__isnull=False, date_fin__isnull=False)
        lead_times = [(t.date_fin - t.date_debut).days for t in taches_terminees_qs]
        avg_lead_time = round(sum(lead_times) / len(lead_times), 2) if lead_times else 0
        velocite_data = []
        for sprint in sprints:
            taches_sprint = taches.filter(statut='done').count()
            velocite_data.append({'sprint': sprint.nom, 'points': taches_sprint})
        return Response({
            'spi': round(spi, 2),
            'cpi': round(cpi, 2),
            'lead_time_moyen': avg_lead_time,
            'velocite': velocite_data,
            'taux_avancement': round(taux_avancement, 2)
        })

    @action(detail=True, methods=['get'])
    def export_data(self, request, pk=None):
        projet = self.get_object()
        taches = projet.tache_set.all()
        couts = projet.cout_set.all()
        non_conformites = projet.nonconformite_set.all()
        data = {
            'projet': {
                'id': projet.id,
                'nom': projet.nom,
                'description': projet.description,
                'date_debut': projet.date_debut,
                'date_fin': projet.date_fin,
                'budget_prevu': float(projet.budget_prevu),
                'budget_reel': float(couts.aggregate(Sum('montant_reel'))['montant_reel__sum'] or 0),
                'statut': projet.statut,
            },
            'taches': list(taches.values()),
            'couts': list(couts.values()),
            'non_conformites': list(non_conformites.values()),
        }
        return Response(data)


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


class UserListViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        users = User.objects.all()
        data = [{'id': u.id, 'username': u.username} for u in users]
        return Response(data)