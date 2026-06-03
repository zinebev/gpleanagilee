'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

import { authAPI } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();

  // données formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // loading
  const [loading, setLoading] = useState(false);

  // message erreur
  const [error, setError] = useState('');

  // quand utilisateur tape
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // supprimer erreur
    setError('');
  };

  // envoyer formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // vérifier mots de passe
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      // appel API register
      await authAPI.register(
        formData.username,
        formData.email,
        formData.password
      );

      // redirection dashboard
      router.push('/dashboard');

    } catch (err) {
      setError('Erreur inscription');
      console.error(err);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <Card className="w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Créer un compte
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <Input
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirmer mot de passe"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Création...' : 'Créer compte'}
          </Button>

        </form>

        <p className="text-center text-sm mt-4">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-blue-500">
            Se connecter
          </Link>
        </p>

      </Card>

    </div>
  );
}