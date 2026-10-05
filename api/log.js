/* Angel's Office activity log. The app posts small batches of events here; each batch is stored as one
   private file in the Vercel Blob store `angel-office-log`, under log/<date>/. Only Diyama can read it,
   with the store token (see tools/read-log.mjs). Anything not on the allow lists below is dropped, so the
   log can never carry a phone number, a decision maker's name or a note. */
import { put } from "@vercel/blob";

const EVENTS = new Set([
  "opened", "viewed", "device_set", "onboarding_done",
  "lesson_opened", "lesson_done", "lesson_unticked", "quiz_answer",
  "business_added", "business_edited", "activity",
  "meeting_booked", "meeting_rescheduled", "meeting_edited", "meeting_step", "meeting_outcome", "client_won",
  "progress_sent", "weekly_report_sent", "backup_exported", "device_erased", "updated"
]);
const FIELDS = ["where", "lessons", "device", "page", "lesson", "title", "total", "question", "right", "score",
  "business", "type", "territory", "what", "stage", "date", "time", "channel", "step", "outcome", "from", "to"];
const ORIGINS = /^https:\/\/(angel\.diyama\.online|diyama-setter(-[a-z0-9-]+)?\.vercel\.app)$|^http:\/\/localhost(:\d+)?$/;

function clean(s, n) { return String(s == null ? "" : s).replace(/[\u0000-\u001f]/g, " ").slice(0, n); }

export default async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).end(); }
  const origin = req.headers.origin || "";
  if (origin && !ORIGINS.test(origin)) return res.status(403).end();

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  if (!body || !Array.isArray(body.events)) return res.status(400).json({ error: "events required" });

  const events = body.events.slice(0, 50).filter((e) => e && EVENTS.has(e.e)).map((e) => {
    const o = { t: clean(e.t, 30), e: e.e };
    for (const k of FIELDS) if (e[k] != null && e[k] !== "") o[k] = clean(e[k], 120);
    return o;
  });
  if (!events.length) return res.status(200).json({ stored: 0 });

  const now = new Date();
  const record = {
    received: now.toISOString(),
    inst: clean(body.inst, 40),
    dev: clean(body.dev, 20),
    ver: clean(body.ver, 30),
    events
  };
  const path = "log/" + now.toISOString().slice(0, 10) + "/" + now.toISOString().replace(/[:.]/g, "-") + ".json";
  await put(path, JSON.stringify(record), { access: "private", addRandomSuffix: true, contentType: "application/json" });
  return res.status(200).json({ stored: events.length });
}
