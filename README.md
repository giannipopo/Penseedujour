# Pensée du Jour 💭

Une application web full-stack pour partager votre unique pensée quotidienne.

## Fonctionnalités
- **Feed Public** : Découvrez les pensées de tous les utilisateurs en temps réel.
- **Règle Stricte** : Une seule pensée par jour et par utilisateur (basé sur le fuseau horaire Europe/Paris).
- **Design Premium** : Interface moderne, responsive et fluide avec Tailwind CSS 4.0.
- **Prêt pour la Prod** : Architecture pensée pour Vercel et Postgres.

## Stack Technique
- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Base de données** : PostgreSQL avec Prisma 7
- **Style** : Tailwind CSS 4
- **Date** : date-fns & date-fns-tz

## Installation Locale

1.  **Cloner le dépôt**
2.  **Installer les dépendances** :
    ```bash
    npm install
    ```
3.  **Configurer les variables d'environnement** :
    Créez un fichier `.env` à la racine (voir `.env.example` ou le contenu généré) :
    ```env
    DATABASE_URL="votre_url_postgres"
    AUTH_SECRET="un_code_secret_aleatoire"
    DEV_AUTH_USER_ID="dev-user-123"
    DEV_AUTH_DISPLAYNAME="Test User"
    ```
4.  **Initialiser la base de données** :
    ```bash
    npm run prisma:migrate
    npm run prisma:generate
    npx prisma db seed
    ```
5.  **Lancer le serveur de développement** :
    ```bash
    npm run dev
    ```

## Authentification (MOCK)
L'application utilise actuellement un mode `DEV_AUTH`. Pour simuler un utilisateur connecté :
- Modifiez `DEV_AUTH_USER_ID` et `DEV_AUTH_DISPLAYNAME` dans votre `.env`.
- Le système créera/mettra à jour automatiquement cet utilisateur en base lors du premier appel API.

### Brancher Auth.js (NextAuth) plus tard :
1. Installez `next-auth@beta`.
2. Configurez le handler dans `src/app/api/auth/[...nextauth]/route.ts`.
3. Mettez à jour `src/lib/auth.ts` pour utiliser `getServerSession` à la place du mock dev.
4. Ajoutez les providers (Google, GitHub, etc.) dans les options de configuration.

## Déploiement sur Vercel
1. Poussez votre code sur GitHub/GitLab/Bitbucket.
2. Créez un nouveau projet sur Vercel.
3. Ajoutez une base de données **Vercel Postgres**.
4. Configurez les variables d'environnement (`DATABASE_URL`, `DIRECT_URL`).
5. Vercel lancera automatiquement `prisma generate` via le script `postinstall` configuré dans `package.json`.

## Scripts Disponibles
- `npm run dev` : Lance le serveur de dev.
- `npm run build` : Compile pour la production.
- `npm run prisma:migrate` : Crée et applique une migration.
- `npm run prisma:studio` : Ouvre l'interface Prisma pour explorer la DB.
