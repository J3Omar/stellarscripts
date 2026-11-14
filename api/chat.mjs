import { readFile } from 'node:fs/promises';

const chapterFiles = new Map([
  ['spirit-opportunity', new URL('../server/chapters/chapter1-spirit-opportunity.md', import.meta.url)],
  ['pioneer10-11', new URL('../server/chapters/chapter2-pioneer10-11.md', import.meta.url)],
  ['ingenuity', new URL('../server/chapters/chapter3-ingenuity.md', import.meta.url)],
  ['surveyor3', new URL('../server/chapters/chapter4-surveyor3.md', import.meta.url)],
]);

function respond(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

// Node HTTP handler, also usable by a Node serverless function host.
export default async function chat(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return respond(res, 405, { error: 'Use POST to ask the Archive.' });
  }
  if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
    return respond(res, 415, { error: 'Send a JSON question.' });
  }

  let body;
  try {
    if (req.body !== undefined) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else {
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 32768) return respond(res, 413, { error: 'The question is too long.' });
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }
  } catch {
    return respond(res, 400, { error: 'Send a valid JSON question.' });
  }

  const chapterFile = chapterFiles.get(body?.chapterId);
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!chapterFile || !question || question.length > 4000) {
    return respond(res, 400, { error: 'Choose a supported chapter and ask a question of up to 4,000 characters.' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return respond(res, 503, { error: 'The Archive is unavailable right now.' });

  try {
    const [instructions, chapter] = await Promise.all([
      readFile(new URL('../server/archive-instructions.txt', import.meta.url), 'utf8'),
      readFile(chapterFile, 'utf8'),
    ]);
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instructions + '\n' + chapter }] },
        contents: [{ role: 'user', parts: [{ text: question }] }],
      }),
    });
    if (!response.ok) return respond(res, 502, { error: 'The Archive is unavailable right now. Please try again.' });

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const answer = candidate?.content?.parts
      ?.filter(part => typeof part.text === 'string' && !part.thought)
      .map(part => part.text).join('').trim();
    if (candidate?.finishReason !== 'STOP' || !answer) {
      return respond(res, 502, { error: 'The Archive did not return a complete answer. Please try again.' });
    }
    return respond(res, 200, { answer });
  } catch {
    return respond(res, 503, { error: 'The Archive is unavailable right now. Please try again.' });
  }
}
