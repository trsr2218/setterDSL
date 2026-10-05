/* Prints Angel's Office activity as a timeline, Lusaka time.
     node tools/read-log.mjs            last 7 days
     node tools/read-log.mjs --days 30
     node tools/read-log.mjs --json     raw events
   Reads BLOB_READ_WRITE_TOKEN from .env.local (written by `vercel env pull`, gitignored). Never print it. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { list, get } from "@vercel/blob";

const here = dirname(fileURLToPath(import.meta.url));
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  const env = readFileSync(join(here, "..", ".env.local"), "utf8");
  const m = /^BLOB_READ_WRITE_TOKEN="?([^"\r\n]+)"?/m.exec(env);
  if (!m) { console.error("No BLOB_READ_WRITE_TOKEN in .env.local. Run: vercel env pull .env.local --scope tres4"); process.exit(1); }
  process.env.BLOB_READ_WRITE_TOKEN = m[1];
}
const args = process.argv.slice(2);
const days = args.includes("--ideas") ? 3650 : (+(args[args.indexOf("--days") + 1] || 0) || 7);
const asJson = args.includes("--json");
const onlyIdeas = args.includes("--ideas");   /* every idea ever shared, nothing else */
const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

const blobs = [];
let cursor;
do {
  const r = await list({ prefix: "log/", cursor, limit: 1000 });
  blobs.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined;
} while (cursor);

const events = [];
for (const b of blobs.filter((b) => b.pathname.slice(4, 14) >= since)) {
  const r = await get(b.pathname, { access: "private" });
  const rec = JSON.parse(await new Response(r.stream).text());
  for (const e of rec.events) events.push({ ...e, dev: rec.dev, ver: rec.ver });
}
events.sort((a, b) => (a.t < b.t ? -1 : 1));
if (onlyIdeas) events.splice(0, events.length, ...events.filter((e) => e.e === "idea_added"));
if (asJson) { console.log(JSON.stringify(events, null, 2)); process.exit(0); }

const lusaka = (t) => new Date(new Date(t).getTime() + 2 * 3600000).toISOString().replace("T", " ").slice(0, 16);
const say = {
  opened: (e) => `opened the app (${e.where}, ${e.lessons} lessons done, ${e.device})`,
  viewed: (e) => `went to ${e.page}`,
  device_set: (e) => `set this device as her ${e.device}`,
  onboarding_done: () => "finished onboarding",
  lesson_opened: (e) => `opened Lesson ${e.lesson}: ${e.title}`,
  lesson_done: (e) => `COMPLETED Lesson ${e.lesson}: ${e.title} (${e.total})`,
  lesson_unticked: (e) => `unticked Lesson ${e.lesson} (${e.total})`,
  quiz_answer: (e) => `quiz question ${e.question}: ${e.right === "yes" ? "right" : "wrong"} (${e.score})`,
  business_added: (e) => `added business ${e.business}${e.type ? ", " + e.type : ""}${e.territory ? ", " + e.territory : ""}`,
  business_edited: (e) => `edited business ${e.business}`,
  activity: (e) => `${e.what}: ${e.business} (stage ${e.stage})`,
  meeting_booked: (e) => `BOOKED a meeting with ${e.business}, ${e.date} ${e.time}, ${e.channel}`,
  meeting_rescheduled: (e) => `rescheduled ${e.business} to ${e.date} ${e.time}`,
  meeting_edited: (e) => `edited the meeting with ${e.business}`,
  meeting_step: (e) => `${e.business}: ${e.step}`,
  meeting_outcome: (e) => `meeting with ${e.business}: ${e.outcome}`,
  client_won: (e) => `CLIENT WON: ${e.business}`,
  progress_sent: () => "sent her progress to Ernest",
  weekly_report_sent: () => "sent the weekly report",
  backup_exported: () => "exported a backup",
  device_erased: () => "ERASED the data on a device",
  updated: (e) => `app updated ${e.from} to ${e.to}`,
  idea_added: (e) => `NEW IDEA: ${e.idea}${e.category ? " (" + e.category + (e.for ? ", for " + e.for : "") + ")" : ""}${e.problem ? "\n           Problem: " + e.problem : ""}${e.details ? "\n           How: " + e.details : ""}`
};
let day = "";
for (const e of events) {
  const t = lusaka(e.t);
  if (t.slice(0, 10) !== day) { day = t.slice(0, 10); console.log("\n" + day); }
  console.log("  " + t.slice(11) + "  " + (say[e.e] ? say[e.e](e) : e.e));
}
if (!events.length) console.log(`No activity since ${since}.`);
process.exit(0);
