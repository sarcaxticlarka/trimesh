import { NextRequest, NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

async function callGroq(messages: object[], jsonMode = true) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 600,
      ...(jsonMode && { response_format: { type: 'json_object' } }),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content as string;
}

async function callCloudflareAI(prompt: string) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken || accountId === 'YOUR_ACCOUNT_ID_HERE') {
    throw new Error('Cloudflare AI not configured (Missing Account ID or Token)');
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare error: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  return `data:image/png;base64,${base64}`;
}

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { action, prompt, title, category, description } = body;

    if (action === 'generate') {
      const content = await callGroq([
        {
          role: 'system',
          content:
            'You are a 3D art director. Given a concept, produce output for a 3D model marketplace listing. Return ONLY valid JSON with these fields: imagePrompt (string, vivid detailed prompt for generating a 3D render preview image, 150-250 chars), description (string, professional 2-sentence description of the 3D model, max 200 chars), tags (array of 6-8 lowercase single-word or hyphenated tags relevant to the model).',
        },
        {
          role: 'user',
          content: `Concept: "${prompt}". Category: ${category || 'General'}`,
        },
      ]);

      const parsed = JSON.parse(content);
      
      try {
        const imageUrl = await callCloudflareAI(parsed.imagePrompt);
        return NextResponse.json({ ...parsed, imageUrl });
      } catch (cfErr: any) {
        console.error('Cloudflare AI failed, falling back to Pollinations:', cfErr.message);
        // Fallback to pollinations if Cloudflare fails or isn't configured yet
        const seed = Math.floor(Math.random() * 99999);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(parsed.imagePrompt)}?width=800&height=450&nologo=true&seed=${seed}`;
        return NextResponse.json({ ...parsed, imageUrl, warning: cfErr.message });
      }
    }

    if (action === 'enhance') {
      const content = await callGroq([
        {
          role: 'system',
          content:
            'You are a professional 3D marketplace copywriter. Write a compelling listing for a 3D model. Return ONLY valid JSON with: description (string, 2-3 professional sentences, max 300 chars), tags (array of 6-8 lowercase tags).',
        },
        {
          role: 'user',
          content: `Title: "${title}". Category: ${category || 'General'}.`,
        },
      ]);

      return NextResponse.json(JSON.parse(content));
    }

    if (action === 'tags') {
      const content = await callGroq([
        {
          role: 'system',
          content:
            'You are a 3D asset tagging expert. Suggest relevant tags. Return ONLY valid JSON with: tags (array of 7-10 lowercase single-word or hyphenated tag strings).',
        },
        {
          role: 'user',
          content: `Description: "${description}". Category: ${category || 'General'}.`,
        },
      ]);

      return NextResponse.json(JSON.parse(content));
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI request failed' }, { status: 500 });
  }
}
