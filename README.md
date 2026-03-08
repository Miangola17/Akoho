# Akoho Manager

Application web de gestion d'élevage de poulets (lots, races, statistiques, œufs, ventes, bilan financier).

## Stack

- **Frontend** : Angular 21 (standalone, SSR) — `http://localhost:4200`
- **Backend** : Node.js / Express — `http://localhost:3000`
- **Base de données** : SQL Server 2019+

## Installation

### 1. Prérequis

- [Node.js 20+](https://nodejs.org/)
- SQL Server (avec login `sa` activé)

### 2. Base de données

Créer la base de données et les tables :

```powershell
# Avec sqlcmd (ajuster le mot de passe)
sqlcmd -S localhost -U sa -P "VotreMotDePasse" -C -i backend/schema.sql
```

### 3. Configuration Backend

```powershell
# Copier le fichier .env
cd backend
copy .env.example .env

# Éditer .env avec vos identifiants SQL Server
notepad .env
```

Contenu de `.env` :
```
PORT=3000
DB_SERVER=localhost
DB_DATABASE=AkohoDB
DB_USER=sa
DB_PASSWORD=VotreMotDePasse
DB_PORT=1433
```

### 4. Installer les dépendances

```powershell
# À la racine du projet
npm install

# Backend
cd backend
npm install
```

### 5. Démarrer l'application

```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
npm start
```

Ou utiliser le script PowerShell :
```powershell
.\start.ps1
```

### 6. Accéder à l'application

- **Frontend** : http://localhost:4200
- **Backend API** : http://localhost:3000

## Docker (optionnel)

```bash
docker compose up
```

## Fonctionnalités

- ✅ Gestion des races (avec prix poussin, oeuf, nourriture)
- ✅ Gestion des lots de poulets (date arrivée/sortie, morts)
- ✅ Suivi de croissance hebdomadaire (poids, nourriture)
- ✅ Gestion des œufs (pondage, incubation)
- ✅ Ventes (poulets et œufs) avec résumé par date
- ✅ Estimation de vente si on vendait tout aujourd'hui
- ✅ Bilan financier complet

## Structure du projet

```
akoho/
├── backend/           # API Node.js/Express
│   ├── config/        # Configuration DB
│   ├── routes/        # Routes API
│   ├── schema.sql     # Schéma SQL
│   └── server.js      # Point d'entrée
├── src/               # Frontend Angular
│   └── app/
│       ├── components/  # Composants réutilisables
│       ├── models/      # Interfaces TypeScript
│       ├── pages/       # Pages de l'application
│       └── services/    # Services HTTP
├── docker/            # Scripts Docker
└── package.json
```

## Spécifications

## QOUI
- Une application de gestion de lot de poulet
- Donnees:
    - Lot de poulet: id, nombre, date arriver, date sortie, race, mort
    - Race: id, nom, prix nourriture(ar/g), prix de vente(ar/g), prix oeuf(piece), prix poussins
    - Suivi de croissance par race: semaine, race, poids moyen, consommation de nourriture
    - Pondage: date, id lot, nombre d'oeufs
    - Incubation: date, id pondage, nombre de poussins
    - Vente poulet: date, id lot, nombre de poulet vendus, montant total
    - Vente oeuf: date, id pondage, nombre d'oeufs vendus, montant total

- Fonctionnalités:
    - Voir benefices par la date choisi (par defaut ajourd'hui)
    - Voir les depenses par la date choisi (par defaut ajourd'hui)
    - Voir les ventes par la date choisi (par defaut ajourd'hui)
    - Une page pour faire les incubations directement (les poussins seront automatiquement ajoutés au lot)
    - Afficher la montant estimer si on veut vendre les oeufs ou les poulets aujourd'hui (en se basant sur le poids moyen et le prix de vente par gramme)

### Format de resultat:
Date picker:

Lot | Prix poussin | Prix nourriture | Mort | Prix de vente | Prix oeuf | Poids Moyen |Benefice | Depense
--- | --- | --- | --- | --- | ---

