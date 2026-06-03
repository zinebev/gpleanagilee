from django.db import models
from projects.models import Projet


class Muda(models.Model):
    TYPE_CHOICES = [
        ("surproduction", "Surproduction"),
        ("attente", "Attente"),
        ("transport", "Transport"),
        ("stock", "Stock"),
        ("mouvement", "Mouvement"),
        ("defaut", "Defaut"),
        ("surtraitement", "Surtraitement"),
    ]
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="mudas")
    type_gaspillage = models.CharField(max_length=30, choices=TYPE_CHOICES)
    description = models.TextField(blank=True)
    impact = models.CharField(max_length=200, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return f"{self.type_gaspillage} - {self.projet.nom}"


class Kaizen(models.Model):
    STATUT_CHOICES = [
        ("propose", "Propose"),
        ("en_cours", "En cours"),
        ("realise", "Realise"),
    ]
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="kaizens")
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    gain_estime = models.CharField(max_length=200, blank=True)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="propose")
    date_creation = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.titre


class VSMStep(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE, related_name="vsm_steps")
    nom = models.CharField(max_length=200)
    temps_valeur = models.IntegerField(default=0)
    temps_attente = models.IntegerField(default=0)
    ordre = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.nom} - {self.projet.nom}"
