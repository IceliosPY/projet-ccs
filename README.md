🚀 CCS – Plateforme d’apprentissage du code

CCS est une plateforme pédagogique interactive permettant d’apprendre les bases du développement web (HTML, CSS, JavaScript) à travers des modules progressifs et des exercices ludiques sous forme de puzzles.

🌐 Version en ligne :
👉 https://iceliospy.github.io/projet-ccs/

🎯 Objectif du projet

Créer une expérience d’apprentissage :

🧩 Interactive (recomposition de code façon puzzle)

📚 Progressive (déblocage d’exercices)

🎨 Thématisée (palette de couleurs dynamique)

🧠 Compréhensible même pour un enfant

🌍 Déployable statiquement (GitHub Pages)

🏗️ Architecture
Frontend

⚛️ React

⚡ Vite

🧠 TypeScript

Données

Base MySQL locale (XAMPP en développement)

Export JSON automatique pour production

Génération d’un modules.json statique pour GitHub Pages

Déploiement

GitHub Pages

Script gh-pages

📦 Installation (développement local)
git clone https://github.com/IceliosPY/projet-ccs.git
cd projet-ccs
npm install
npm run dev

🛠️ Build pour production

Avant le build, un script transforme l’export JSON de la base en fichier utilisable par le frontend :

npm run build


Cela lance :

build:data → Génération de public/data/modules.json

Compilation TypeScript

Build Vite

🚀 Déploiement GitHub Pages
npm run deploy


Le site est publié automatiquement sur la branche gh-pages.

🧩 Fonctionnalités principales

📚 Modules structurés (10 modules actuellement)

🧠 3 exercices par module

🔓 Système de déblocage progressif

📊 Barre de progression globale et par module

🎨 Thème dynamique (palette personnalisable)

👶 Textes pédagogiques accessibles

🖱️ Effet “scratch” pour révéler les solutions

👁️ Prévisualisation sandboxée du code généré

📁 Structure simplifiée
src/
 ├── api/
 │    └── modules.ts
 ├── components/
 ├── pages/
 │    └── ModulesPage.tsx
 ├── progress/
 ├── styles/
public/
 └── data/
      └── modules.json
scripts/
 └── build-modules-json.mjs

📚 Modules actuels

HTML de base

CSS simple

Interaction JavaScript

Images & accessibilité

Liens hypertexte

Listes

Formulaires

Flexbox

CSS Grid

Fetch API (premier pas)

🧠 Philosophie pédagogique

Comprendre avant de mémoriser

Manipuler pour apprendre

Voir immédiatement le résultat

Progression claire et motivante

🔮 Améliorations futures possibles

Système de comptes utilisateurs

Sauvegarde cloud de la progression

Niveaux Blockly complets

Mode “challenge chronométré”

Ajout d’exercices avancés

Backend API distant

👤 Auteur

Projet développé par IceliosPY

Si tu veux, je peux aussi te faire une version :

plus minimaliste

plus “portfolio professionnel”

ou plus orientée pédagogie / éducation

Tu me dis le style que tu veux 😌
