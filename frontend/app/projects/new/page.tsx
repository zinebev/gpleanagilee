'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { projectsAPI } from '@/lib/api';

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Map the form (English) to the backend's required French fields
      await projectsAPI.create({
        nom: formData.name,
        description: formData.description,
        date_debut: formData.start_date,
        date_fin: formData.end_date,
        budget_prevu: formData.budget,
        budget_reel: 0,
        statut: 'en_attente',
      });
      router.push('/projects');
    } catch (err) {
      console.error(err);
      setError('Erreur création projet. Vérifiez les champs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Nouveau Projet</h1>
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom du projet"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <Input
              label="Date début"
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Date fin"
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Budget"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              required
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/projects')}
                fullWidth
              >
                Annuler
              </Button>
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}