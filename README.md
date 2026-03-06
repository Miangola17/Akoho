# Akoho — Gestion de poulets

Application web de gestion d'élevage de poulets (lots, races, statistiques hebdomadaires, œufs, mortalité, bilan financier).

## Stack

- **Frontend** : Angular 21 (standalone, SSR) — `http://localhost:4200`
- **Backend** : Node.js / Express — `http://localhost:3000`
- **Base de données** : SQL Server 2025 (`AkohoDB`)

## Prérequis

- Node.js 20+
- SQL Server avec instance `MSSQLSERVER` sur le port 1433
- Login `sa` activé avec le mot de passe défini dans `backend/.env`

## Démarrage

### Windows (local)
```powershell
.\start.ps1
```

### Tout OS avec Docker (Linux, macOS, Windows)
```bash
docker compose up
```
- Frontend : http://localhost:4200
- Backend  : http://localhost:3000
- SQL Server automatiquement initialisé dans un conteneur

> Premier lancement : l'image SQL Server prend ~1 min à démarrer.
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
