from django.db import models
from django.contrib.auth.models import User

class Projet(models.Model):
    STATUT_CHOICES = [
        ('en_cours', 'En cours'),
        ('termine', 'Terminé'),
        ('en_attente', 'En attente'),
    ]
    nom = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    date_debut = models.DateField()
    date_fin = models.DateField()
    budget_prevu = models.DecimalField(max_digits=10, decimal_places=2)
    budget_reel = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    chef_projet = models.ForeignKey(User, on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nom

class Tache(models.Model):
    STATUT_CHOICES = [
        ('todo', 'À faire'),
        ('en_cours', 'En cours'),
        ('done', 'Terminée'),
    ]
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    titre = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True) 
    date_debut = models.DateField()
    date_fin = models.DateField()
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='todo')
    priorite = models.IntegerField(default=1)
    date_creation = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.titre

class Cout(models.Model):
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    libelle = models.CharField(max_length=200)
    montant_prevu = models.DecimalField(max_digits=10, decimal_places=2)
    montant_reel = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField()
    categorie = models.CharField(max_length=100, blank=True)

    def ecart(self):
        return self.montant_reel - self.montant_prevu

    def __str__(self):
        return f"{self.libelle} - {self.projet.nom}"

class NonConformite(models.Model):
    GRAVITE_CHOICES = [
        ('faible', 'Faible'),
        ('moyenne', 'Moyenne'),
        ('elevee', 'Elevee'),
    ]
    projet = models.ForeignKey(Projet, on_delete=models.CASCADE)
    titre = models.CharField(max_length=200)
    description = models.TextField()
    gravite = models.CharField(max_length=20, choices=GRAVITE_CHOICES)
    action_corrective = models.TextField(blank=True)
    statut = models.CharField(max_length=20, choices=[
        ('ouverte', 'Ouverte'),
        ('en_cours', 'En cours'),
        ('resolue', 'Resolue'),
    ], default='ouverte')
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titre} - {self.projet.nom}"