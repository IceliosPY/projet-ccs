# CCS — Plateforme d’apprentissage du code

Version en ligne : https://iceliospy.github.io/projet-ccs/


Auteur.es : 
Stacy : https://github.com/Stacy-Laura
IceliosPY : https://github.com/IceliosPY



## Présentation
CCS est une application web pour apprendre le code de façon simple, progressive et ludique.
Le contenu est organisé en modules, avec des exercices interactifs.

## Fonctionnement
- Modules → exercices (3 exercices par module : 2 exercices + 1 challenge)
- Déblocage progressif : un exercice se débloque quand le précédent est validé
- Puzzle de code : remettre les morceaux dans le bon ordre
- Prévisualisation : affichage du résultat dans une zone dédiée
- Progression : barre de progression globale + progression par module
- Thèmes : palette de couleurs sélectionnable

## Modules actuels
1. HTML de base  
2. CSS simple  
3. Interaction JavaScript  
4. Images & accessibilité  
5. Liens hypertexte  
6. Listes (ul / li)  
7. Formulaire simple  
8. Flexbox  
9. CSS Grid  
10. Fetch (premier pas)

Total : 10 modules — 30 exercices

## Stack
- Front : React + TypeScript + Vite
- UI blocs : Blockly (en cours / partiel selon les exercices)
- Données :
  - Dev local : API PHP (XAMPP) + MySQL
  - Prod (GitHub Pages) : JSON statique `public/data/modules.json`
- Déploiement : GitHub Pages via `gh-pages`

## Installation
```bash
git clone https://github.com/IceliosPY/projet-ccs.git
cd projet-ccs
npm install
npm run dev
