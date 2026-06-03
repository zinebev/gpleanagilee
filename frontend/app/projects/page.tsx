'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { projectsAPI } from '@/lib/api';

type Projet = {
  id: number;
  nom: string;
  description?: string;
  statut?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Erreur chargement projets');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-graphite-500">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-risk">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-graphite-700">Projets</h1>
        <Link href="/projects/new">
          <Button>Nouveau Projet</Button>
        </Link>
      </div>

      {projects.length === 0 && (
        <p className="text-graphite-500">
          Aucun projet pour l&apos;instant. Créez votre premier projet.
        </p>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {projects.map((project) => (
          <Card key={project.id}>
            <h2 className="text-xl font-semibold mb-2 text-graphite-700">
              {project.nom}
            </h2>
            <p className="text-gray-600 mb-4">
              {project.description || 'Aucune description'}
            </p>
            <p className="mb-4 text-sm text-graphite-500">
              Statut : {project.statut || '—'}
            </p>
            <Link href={`/projects/${project.id}`}>
              <Button variant="secondary">Voir Projet</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}