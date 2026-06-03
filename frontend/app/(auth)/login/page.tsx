'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // appel API avec username
      await authAPI.login(formData.username, formData.password);

      // redirection
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);

      if (err.message.includes('401')) {
        setError('Username ou mot de passe incorrect');
      } else {
        setError('Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Connexion
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
            label="Mot de passe"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>

        </form>

        <p className="text-center text-sm mt-4">
          Pas de compte ?{' '}
          <Link href="/register" className="text-blue-500">
            Inscription
          </Link>
        </p>

      </Card>
    </div>
  );
}