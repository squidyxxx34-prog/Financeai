# FinTerm — AI Market Analyst (Groq)

Analyseur de graphiques financiers propulsé par **Llama 4 Scout Vision** via **Groq** (100% gratuit).

## 🚀 Déploiement Vercel en 5 min

### 1. Clé API Groq (gratuite)
1. Créez un compte sur [console.groq.com](https://console.groq.com)
2. API Keys → Create API Key
3. Copiez la clé `gsk_...`

### 2. Déployer sur Vercel

**Via GitHub (recommandé) :**
```bash
# Extraire le zip, puis :
cd finterm
git init && git add . && git commit -m "init"
# Créez un repo GitHub et poussez
```
Ensuite sur [vercel.com](https://vercel.com) :
- New Project → importer votre repo
- **Environment Variables** → ajouter :
  ```
  GROQ_API_KEY = gsk_...
  ```
- Deploy ✅

**Via CLI :**
```bash
npm i -g vercel
vercel
# Suivre les instructions, ajouter GROQ_API_KEY quand demandé
```

### 3. Dev local
```bash
cp .env.example .env.local
# Éditez .env.local avec votre clé Groq
npm install
npm run dev
# → http://localhost:3000
```

## 🧠 Modèle utilisé

**`meta-llama/llama-4-scout-17b-16e-instruct`** via Groq
- ✅ Vision (analyse d'images)
- ✅ 128K context
- ✅ ~600 tokens/sec
- ✅ **Gratuit** sur le plan Groq free tier

## 📁 Structure

```
finterm/
├── pages/
│   ├── index.js          # App React (mobile + desktop)
│   └── api/
│       └── analyze.js    # Route API → Groq (clé sécurisée côté serveur)
├── styles/globals.css
├── package.json
└── .env.example
```
