# QuizLab 🎯

Application de quiz en ligne avec interface d'administration protégée par mot de passe.

## Stack technique
- **Next.js 14** (App Router)
- **Supabase** (base de données PostgreSQL)
- **Tailwind CSS** (styles)
- **Vercel** (hébergement)

## Installation en 5 étapes

### 1. Supabase — Créer la base de données
1. Aller sur [supabase.com](https://supabase.com) → créer un compte gratuit
2. Créer un nouveau projet
3. Aller dans **SQL Editor** et coller le contenu de `supabase/schema.sql`
4. Récupérer dans **Settings > API** :
   - `Project URL`
   - `anon public key`

### 2. Cloner et installer
```bash
git clone <votre-repo>
cd quizlab
npm install
```

### 3. Variables d'environnement
Créer un fichier `.env.local` à la racine :
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...votre_clé...
ADMIN_PASSWORD=votre_mot_de_passe_admin
```

### 4. Lancer en local
```bash
npm run dev
```
→ Ouvrir [http://localhost:3000](http://localhost:3000)

### 5. Déployer sur Vercel
```bash
npm install -g vercel
vercel
```
Ou via GitHub :
1. Pousser le code sur GitHub
2. Aller sur [vercel.com](https://vercel.com) → Import Git Repository
3. Ajouter les 3 variables d'environnement
4. Deploy !

## URLs de l'application
- `/` — Liste des quiz (publique)
- `/quiz/[id]` — Jouer un quiz (publique)
- `/admin` — Interface d'administration (protégée)
- `/admin/quiz/new` — Créer un quiz
- `/admin/quiz/[id]/edit` — Modifier un quiz
