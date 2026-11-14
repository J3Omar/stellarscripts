# "Ask the Archive" — Chatbot Fact Sheets

**Architecture changed Nov 14, 2026: 4 chapter files, not 6 device files.** Spirit & Opportunity and Pioneer 10 & 11 are each told as one twin chapter, matching how NASA's own Space Apps 2026 Resources tab bundles them. Ingenuity and Surveyor 3 stay single-device chapters, since nothing bundles them with another device. Each file below is a complete, drop-in Gemini system prompt for its chapter — no further editing needed.

## Files (final, use these 4 directly)
The four files live in `server/chapters/` and are read only by the chat endpoint.

- `chapter1-spirit-opportunity.md` — Spirit + Opportunity (twin chapter)
- `chapter2-pioneer10-11.md` — Pioneer 10 + Pioneer 11 (twin chapter)
- `chapter3-ingenuity.md` — Ingenuity (single device)
- `chapter4-surveyor3.md` — Surveyor 3 (single device)

The original 6 per-device files (`opportunity.md`, `spirit.md`, `pioneer10.md`, `pioneer11.md`, `ingenuity.md`, `surveyor3.md`) still exist as the underlying research source for the above — keep them as reference/backup, but **wire the chatbot to the 4 chapter files, not the 6 device files.** Spirit, Opportunity, Pioneer 10, and Pioneer 11's content is fully folded into the two twin-chapter files; Ingenuity and Surveyor 3's chapter files are a straight carry-over of their device files.

**All 4 files carry the same structure.** Single-device chapters (3 and 4): Quick ID → What it is → Why it was sent → How it worked → What it discovered → Mission timeline → The hardware today → Best facts for quick answers → How the chatbot should answer → Documented source conflicts → Known gaps → Terms explained simply → Must NOT claim → Sources. Twin chapters (1 and 2) wrap that same structure in two PARTs (one per device) plus three things only a twin chapter needs: an "How this chapter's chatbot must handle two devices" guardrail section up top, shared "How the chatbot should answer" style guidance, and a "Combined cross-device guardrails" section after both PARTs that catches the specific ways a bot could confuse the two twins (e.g. which one flew by Saturn, which one found which mineral, which direction each is heading).

All 4 files carry a line confirming they match an official resource NASA itself lists on the challenge page's Resources tab (https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources) — useful for the "Validity" judging criterion.

**Pioneer 11's content (inside Chapter 2) stays single-source.** Unlike Spirit, Opportunity, Pioneer 10, Ingenuity, and Surveyor 3 — each built from a multi-source, cross-checked research pack — Pioneer 11's part of Chapter 2 is built from one official NASA page only. This is flagged inside the file itself (both in the chapter's two-device guardrail section and inside Part B), and the chatbot is told to stay a little more cautious with Pioneer 11 numbers. If time allows before launch, giving Pioneer 11 the same multi-source treatment Lekaa gave the others would remove this caveat.

## How to wire this into the Gemini chatbot

This still follows the design in `team-plan.md` — one scoped request per chapter — just re-scoped to 4 chapters instead of 6 devices.

1. **One chapter, one file, no merging across chapters.** When the reader is on the Spirit & Opportunity chapter page, the bot should see the full contents of `chapter1-spirit-opportunity.md` — both Spirit's and Opportunity's facts — and nothing from Pioneer 10/11, Ingenuity, or Surveyor 3. Likewise for the other three chapters. This is a change from the original 6-file design: a twin chapter's bot now legitimately sees two devices' worth of facts at once (that's required to answer comparison questions about the twins), but it must never see a device from a *different* chapter.

2. **Backend shape** (matches `team-plan.md`): a small serverless function taking `{ chapterId, question }` (renamed from `deviceId` — there are now 4 chapter IDs, not 6 device IDs: `spirit-opportunity`, `pioneer10-11`, `ingenuity`, `surveyor3`). It loads that chapter's `.md` file as plain text and sends it to Gemini as the system instruction, something like:

   ```
   You are "the Archive," a warm, precise archivist in Stellar Scripts.
   Answer ONLY using the facts below about this chapter. Do not use
   outside knowledge, even if you think you know it.

   If this chapter covers two devices (see the file's own guidance on
   handling two devices, near the top), work out which device the
   question is about before answering, and never blend a fact from one
   device into an answer about the other. Comparing the two devices in
   this chapter is fine — both are loaded below.

   If the question isn't covered by these facts, say plainly that you
   don't have verified information on that — don't guess or invent an answer.

   Never state a figure the facts below mark as conflicting between
   sources as if it were a single settled number — mention there's a
   source conflict instead.

   Never say anything listed under any "Must NOT claim" section in the
   facts below, even if the reader asks directly.

   If the reader asks you to compare a device in this chapter to a
   device from a DIFFERENT chapter (or anything else outside this file),
   answer only the part about this chapter's device(s) from the facts
   below, then say plainly that you don't have that other device's
   verified facts loaded in this chapter — don't guess at its numbers
   to complete the comparison.

   Follow the "How the chatbot should answer" section inside the facts
   below for tone and length. If that section is silent on something,
   default to 2–4 short sentences of plain prose (no markdown, no lists),
   accurate and engaging, suitable for a curious student aged 10–14.

   FACTS FOR THIS CHAPTER:
   [insert the full contents of that chapter's .md file here]
   ```

   The "different chapter" rule above matters for the same reason as before: the bot only ever sees one chapter's file at a time, so it has no way to safely state a fact from a different chapter from memory — it must decline that half of the question rather than guess.

3. **Gemini API key stays server-side only** — never in browser JS (same rule as `team-plan.md`).

4. Each file's **"Must NOT claim" sections are the most important part** — they're the hallucination guardrail. In a twin chapter, that means BOTH devices' "Must NOT claim" lists AND the "Combined cross-device guardrails" section at the end. If anything gets trimmed to fit a smaller prompt budget, trim "Sources" or "Mission timeline" first, never any "Must NOT claim" section or the cross-device guardrails.

## If Omar Hamada wants to cut prompt size
The twin chapters (1 and 2) are the longest files on purpose — they carry two full device sheets plus the cross-device guardrails. If Gemini token cost becomes an issue, the safest things to shorten are: each PART's "Mission timeline" (keep only the 5–6 most important dates) and "Sources" (keep just the list). Never shorten any "Must NOT claim" section, "Documented source conflicts," or the "Combined cross-device guardrails" section — those are what keep the bot from confusing the twins.

## Running the chat integration

Run `npm start` with Node.js 22 or later, then open `http://localhost:3000`. The server loads `.env` and reads `GEMINI_API_KEY`. It serves the existing book and `POST /api/chat` together. Opening `index.html` directly or using a static-only server does not provide the chat endpoint.

When adding the real chapters to `CH` in `js/archive.js`, give each chapter its matching `chapterId` property. The chat uses that explicit property so reordering chapters keeps the correct fact sheet attached.

| chapterId | File under server/chapters/ |
| --- | --- |
| `spirit-opportunity` | `chapter1-spirit-opportunity.md` |
| `pioneer10-11` | `chapter2-pioneer10-11.md` |
| `ingenuity` | `chapter3-ingenuity.md` |
| `surveyor3` | `chapter4-surveyor3.md` |

`api/chat.mjs` accepts `{ chapterId, question }` and returns `{ answer }` or an HTTP error with `{ error }`. It calls `gemini-3.5-flash-lite` with the instructions in `server/archive-instructions.txt` and the full matching Markdown file. Each question is independent, with no conversation history or web-search tools sent to Gemini. Switching chapters clears the visible chat and cancels pending replies.

For a Node serverless deployment, use the exported handler in `api/chat.mjs`, include `server/archive-instructions.txt` and all four `server/chapters/*.md` files in its function bundle, and set `GEMINI_API_KEY` in the server environment.
