from rest_framework import serializers
from .models import Projet, Tache, Cout, NonConformite

class TacheSerializer(serializers.ModelSerializer):
    assignee_nom = serializers.CharField(source='assignee.username', read_only=True)

    class Meta:
        model = Tache
        fields = '__all__'
        
class ProjetSerializer(serializers.ModelSerializer):
    taches = TacheSerializer(many=True, read_only=True, source='tache_set')

    class Meta:
        model = Projet
        fields = '__all__'
        read_only_fields = ['chef_projet']

class CoutSerializer(serializers.ModelSerializer):
    ecart = serializers.SerializerMethodField()

    class Meta:
        model = Cout
        fields = '__all__'

    def get_ecart(self, obj):
        return obj.ecart()

class NonConformiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = NonConformite
        fields = '__all__'