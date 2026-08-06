export type ChatJson = { flux?: string; reason?: string };

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

type Provider =
  | { kind: "openai"; key: string }
  | { kind: "gemini"; key: string };

function getProvider(): Provider | null {
  const openai = process.env.OPENAI_API_KEY?.trim();
  const gemini = (
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  )?.trim();
  if (openai) return { kind: "openai", key: openai };
  if (gemini) return { kind: "gemini", key: gemini };
  return null;
}

export function hasCloudAi(): boolean {
  return getProvider() !== null;
}

async function chatOpenAI(
  key: string,
  system: string,
  user: string,
): Promise<string> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });
  if (!resp.ok) {
    throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  }
  const data = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content || "{}";
}

async function chatGemini(
  key: string,
  system: string,
  user: string,
): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(key)}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });
  if (!resp.ok) {
    throw new Error(`Gemini ${resp.status}: ${await resp.text()}`);
  }
  const data = (await resp.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
}

/** Chama OpenAI ou Gemini conforme env na Vercel. Sem Lovable. */
export async function chatJson(system: string, user: string): Promise<ChatJson> {
  const provider = getProvider();
  if (!provider) {
    throw new AiConfigError(
      "Configure OPENAI_API_KEY ou GEMINI_API_KEY nas Environment Variables da Vercel.",
    );
  }
  const content =
    provider.kind === "openai"
      ? await chatOpenAI(provider.key, system, user)
      : await chatGemini(provider.key, system, user);
  try {
    return JSON.parse(content) as ChatJson;
  } catch {
    return {};
  }
}
