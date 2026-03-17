// pages/api/analyze.js
// Groq API — compatible OpenAI, modèle vision Llama 4 Scout (gratuit)

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { asset, interval, query, imageData } = req.body;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GROQ_API_KEY manquante dans les variables d'environnement Vercel." });

  const systemPrompt = `Tu es un analyste financier quantitatif senior et trader professionnel.
Analyse les graphiques de marchés financiers avec rigueur et précision.

FORMAT DE RÉPONSE OBLIGATOIRE :
Ligne 1 : exactement [BUY], [SELL] ou [WAIT] — rien d'autre sur cette ligne
Ensuite, structure ton analyse ainsi :

TENDANCE
[haussière / baissière / latérale — force et clarté]

NIVEAUX CLÉS
Support: [niveau] | Résistance: [niveau]

INDICATEURS TECHNIQUES
[RSI, MACD, moyennes mobiles, volumes si visibles sur le graphique]

PATTERNS
[patterns chartistes identifiés : triangle, H&E, double top/bottom, etc.]

SCÉNARIO PROBABLE
[ce qui est attendu sur les prochaines bougies / périodes]

NIVEAUX OPÉRATIONNELS
Entrée: [zone] | TP1: [niveau] | TP2: [niveau] | SL: [niveau]

RISQUES
[éléments de vigilance spécifiques]

Ton : direct, factuel, institutionnel. Pas de formule de politesse.`;

  // Construction du message utilisateur
  const userContent = [];

  if (imageData) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: `data:image/png;base64,${imageData}`,
      },
    });
  }

  const textContent = [
    `ACTIF: ${asset} | INTERVALLE: ${interval}`,
    query || (imageData ? "Analyse technique complète. Donne un signal de trading précis." : ""),
  ]
    .filter(Boolean)
    .join("\n");

  userContent.push({ type: "text", text: textContent });

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct", // vision + gratuit
        max_tokens: 1024,
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err?.error?.message || `Groq HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "Aucune réponse.";
    res.status(200).json({ result });
  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: err.message || "Erreur serveur Groq" });
  }
}
