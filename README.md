# 🎓 Savoir IA — Cursus CS50x Francophone Pédagogique

Plateforme éducative d'apprentissage assistée par l'Intelligence Artificielle (**Google Gemini & Google Cloud Text-to-Speech**) basée sur le cursus officiel **CS50x de l'Université Harvard** (Semaines 0 à 10).

---

## 🌟 Fonctionnalités Clés

* **📖 Résumés Magistraux & Découpages Vidéo** : Chaque cours comprend une vue d'ensemble détaillée, 6 concepts fondamentaux définis avec rigueur, un découpage temporel et des extraits de code commentés.
* **🎙️ Socrate (Tuteur Vocal Interactif)** : 3 sessions audio immersives par semaine (**Lundi, Mercredi, Vendredi**) propulsées par la voix neuronale *Google Cloud Text-to-Speech (Neural2-D)*.
* **📥 Téléchargement MP3** : Écoutez les leçons de Socrate hors connexion comme un podcast étudiant.
* **📝 Quiz Synchronisés** : QCMs de haut niveau cognitif (Intuition, Code & Mécanique, Vision Ingénieur) avec validation instantanée et explications pas-à-pas.
* **📊 Tableau de Bord de Progression** : Suivi des scores, moyenne par module et possibilité de réinitialiser la progression à tout moment.
* **🔍 Mode Focus / Plein Écran** : Masquez les barres latérales en un clic pour une immersion totale dans le cours.

---

## 🛠️ Stack Technique

* **Framework** : [Next.js 16](https://nextjs.org/) (App Router, React 19)
* **Langage** : TypeScript
* **Design** : Tailwind CSS (Thème sombre moderne & responsive)
* **Base de Données** : [Neon PostgreSQL](https://neon.tech/) (Cloud Serverless) via [Prisma ORM](https://www.prisma.io/)
* **Intelligence Artificielle** : [Google Gemini API](https://ai.google.dev/) (`gemini-3.6-flash`)
* **Synthèse Vocale** : [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech)

---

## 🚀 Démarrage Rapide

### 1. Cloner le projet
```bash
git clone https://github.com/gmuntu/CS50_GeminiLM.git
cd CS50_GeminiLM
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env.local` à la racine du projet (en vous basant sur `.env.example`) :
```env
# Base de données Neon PostgreSQL
DATABASE_URL="postgresql://neondb_owner:...@ep-square-union-ayablgq8-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Clé API Google Gemini (Google AI Studio)
GEMINI_API_KEY="VOTRE_CLE_GEMINI_API_KEY"

# Clé API Google Cloud Text-to-Speech
GOOGLE_TTS_API_KEY="VOTRE_CLE_GOOGLE_TTS_API_KEY"
```

### 4. Générer le client Prisma
```bash
npx prisma generate
```

### 5. Lancer le serveur local
```bash
npm run dev
```
Ouvrez votre navigateur sur [http://localhost:3000](http://localhost:3000).

*(Optionnel) Pour inspecter et administrer la base de données visuellement :*
```bash
npx prisma studio
```
Accessible sur [http://localhost:5555](http://localhost:5555).
