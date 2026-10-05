# Angel's Office

Angel Nawa's work app for appointment setting at Diyama Solutions. It is made for her phone: a daily to-do list, a pipeline tracker, a meetings page that makes sure Ernest attends every call she books, the 14 day training, and a library of short sales tips. Version 2.

One file: `index.html`. No build, no backend, no sign in, no external AI calls. Outside requests: Google Fonts, and Vercel Web Analytics (cookieless page view counts, enabled 5 Oct 2026), which shows Ernest which days the app was opened. It never sees her data.

## What is in it

- **Today**: what to do now, in order. Unconfirmed meetings first (red), then day-before reminders to Ernest, today's meetings, today's lesson, follow-ups due, meetings waiting for an outcome, and stale businesses. Also one tip for right now, this week's numbers and this month's money estimate with the working.
- **Pipeline**: every business as a card. Log activity in one tap. The app moves the stage and sets the next follow-up date: first message day 0, follow-ups at day 3, 7 and 14, then it says stop and park, and will not schedule a fourth follow-up without a reply. A reply resets the count.
- **Meetings**: booking needs the four Schedule 4 checks ticked. Each meeting has steps: brief to Ernest on WhatsApp, Ernest confirmed, calendar file (.ics, Lusaka time), day-before reminder, 1 hour nudge, client confirmation, then the outcome. Held only counts with "Ernest attended" ticked.
- **Learn**: the 14 days, unlocked in order, plus the tips library.
- **More**: Prices, Scripts, Quiz, Rules, Gate, Money (with the weekly report to Ernest), Backup, Theme.

Pay logic: K150 per held meeting Ernest attended, at most 6 paid per calendar month in the first 90 days from her start date, plus K300 per client won (always paid). The app shows estimates only. Ernest confirms every meeting held and every client won.

## Where it lives

Live at https://diyama-setter.vercel.app. Vercel project `diyama-setter` on team `tres4`, connected to GitHub `trsr2218/setterDSL`. **Every push to `main` deploys to production automatically.** To change the app: edit `index.html`, **bump the `app-version` meta tag**, commit, push. Nothing else.

**Updates never lose her data.** Her data lives in the phone's browser under `diyama_setter_v2`, which no deploy touches. Never rename that key; add new fields to `blank()` and `mergeV2()`. Open copies check the live `app-version`: coming back to the app updates at once, while she is working a bar offers "Update now" so nothing being typed is lost. A snapshot is saved to `diyama_setter_v2_before_update` before each update and is restored automatically if the main copy is ever missing. Data is per address: angel.diyama.online and diyama-setter.vercel.app keep separate copies, so she should only use one.

**Progress to Ernest**: the Today page has "Send progress to Ernest", one tap to WhatsApp with lessons done, the next lesson, pipeline counts, follow-ups due and meetings waiting for his YES. Counts only, no client numbers.

## How to give it to Angel

Pick one.

1. **Static site on Vercel (recommended).** Import this `app` folder as a new Vercel project. Framework preset: Other. No build command. Output directory: `.`. Suggested address: `angel.diyama.online`. Send Angel the link.
2. **Send her the file.** Send `index.html` on WhatsApp. She saves it and opens it in Chrome. It works fully, but "Add to Home screen" as an app only works properly from the web address in option 1.

## How Angel opens it and adds it to her home screen

1. Open the link in **Chrome** on her Android phone.
2. Tap the three dots menu, then **Add to Home screen** (or **Install app**).
3. It appears as "Angel's Office" with the teal D icon and opens full screen.

On an iPhone: open in Safari, tap Share, then Add to Home Screen.

## Her data lives only on her phone

Everything is saved in that browser on that phone (localStorage, key `diyama_setter_v2`). Nobody else can see it, including Ernest, and clearing the browser data erases it. So:

- **Every week Angel exports a backup** (More, Backup, Export backup) and sends the file to Ernest on WhatsApp. It can be imported on any phone.
- She also sends the **weekly report** (More, Money) and can export the **Meetings CSV** and **Pipeline CSV** for the company tracker. Both carry an Origin column. Client phone numbers appear only in the Pipeline CSV.
- Version 1 data (`diyama_setter_v1`) is moved across automatically the first time version 2 opens: the old meeting log becomes the Meetings list. Old v1 backup files can also be imported.

## Internal only

Never link this app from www.diyama.online or any client facing page. It carries `noindex`, but that is not a lock: share the address only with Angel and Ernest.

## Content rules

- Public list prices only. No client names, fees, margins or internal costs.
- No em dash or en dash characters anywhere. Plain ASCII in all text.
- With prospects Angel speaks as Diyama Solutions ("I am Angel from Diyama Solutions", "our team", "our director"). Ernest's name is used with a client only once a meeting is being fixed: "our Managing Director, Ernest Moseni, will be on the call". Messages to Ernest's own WhatsApp are internal and use his name.
- To change prices, edit `PRICES`, `FITS` and the lesson text near the top of `index.html`. The follow-up timing is `CADENCE` and the pay rules are `CAP_MONTH`, `FEE_HELD`, `FEE_WON` and `CAP_DAYS`, all near the top of the app section.
