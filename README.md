# GPLeanAgile 🚀

> Système de Gestion de Projets basé sur les Méthodologies Lean et Agile

---

## 📋 Description

**GPLeanAgile** est une application web complète de gestion de projets développée dans le cadre du Projet de Fin d'Année à l'ENSIAS (filière 2SCL). Elle intègre les meilleures pratiques des méthodologies **Lean** et **Agile** pour permettre aux équipes de piloter efficacement leurs projets.

---

## 👥 Équipe

| Membre | Rôle |
|--------|------|
| Douae AIT TALEB | Développement Backend (Django REST API) |
| Hajar MORGHI | Développement Frontend (Next.js) |
| Zineb BELRHITI | Développement APIs & Coordination |

---

## 🛠️ Technologies Utilisées

### Backend
- Python 3.14
- Django 6.0
- Django REST Framework
- JWT (SimpleJWT)
- SQLite
- django-cors-headers

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

---

## 📁 Structure du Projet
GPLeanAgile/
├── backend/
│   ├── account/          # Authentification
│   ├── projects/         # Gestion des projets
│   ├── lean/             # Module Lean
│   ├── agile/            # Module Agile
│   ├── notifications/    # Notifications
│   ├── gpleanagile/      # Configuration Django
│   └── manage.py
├── frontend/             # Application Next.js
└── README.md
---

## 🚀 Installation et Lancement

### Backend

```bash
cd GPLeanAgile/backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Le backend sera accessible sur : `http://localhost:8000`

### Frontend

```bash
cd GPLeanAgile/frontend
npm install
npm run dev
```

Le frontend sera accessible sur : `http://localhost:3000`

---

## 🔐 Authentification

JWT avec token d'accès **24 heures** et token de rafraîchissement **7 jours**.

Header à utiliser : Authorization: Bearer <access_token>
---

## 📊 Fonctionnalités Principales

- ✅ Authentification sécurisée JWT
- ✅ Gestion CRUD des projets et tâches
- ✅ Calcul automatique des KPI (SPI, CPI, taux d'avancement)
- ✅ Module Lean : Muda, Kaizen, VSM
- ✅ Module Agile : Sprints, Backlog, Burndown Chart
- ✅ Système de notifications
- ✅ Export des données projet
- ✅ Interface d'administration

---

## 🎓 ENSIAS — Année Universitaire 2025/2026
