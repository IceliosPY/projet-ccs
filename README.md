# 🚀 CCS – Plateforme d’apprentissage du code

🌐 Version en ligne :  
👉 https://iceliospy.github.io/projet-ccs/

---

## 🧠 Présentation

**CCS** est une plateforme pédagogique interactive permettant d’apprendre les bases du développement web :

- HTML
- CSS
- JavaScript

L’apprentissage se fait via des **modules progressifs** composés de **3 exercices chacun**, sous forme de puzzles à recomposer.

Le projet est pensé pour être :
- 👶 Compréhensible même pour un enfant
- 🎮 Ludique
- 📚 Progressif
- 🎨 Personnalisable visuellement
- 🌍 Déployable en statique (GitHub Pages)

---

## 🧩 Fonctionnement

Chaque module contient :

1. Un exercice guidé
2. Un exercice intermédiaire
3. Un challenge

L’utilisateur doit :
- Recomposer du code dans le bon ordre
- Cliquer sur "Vérifier"
- Voir le résultat dans une prévisualisation sandboxée
- Débloquer l’exercice suivant

Une **barre de progression dynamique** affiche l’avancement global et par module.

---

## 🏗️ Stack technique

### Frontend
- React
- TypeScript
- Vite

### Déploiement
- GitHub Pages
- gh-pages

### Données
- Base MySQL en développement (XAMPP)
- Export JSON
- Script de transformation automatique vers `modules.json`

---

## 📁 Structure du projet
src/
├── api/
│ └── modules.ts
├── components/
├── pages/
│ └── ModulesPage.tsx
├── progress/
├── styles/
public/
└── data/
└── modules.json
scripts/
└── build-modules-json.mjs


---

## ⚙️ Installation (développement local)

```bash
git clone https://github.com/IceliosPY/projet-ccs.git
cd projet-ccs
npm install
npm run dev
