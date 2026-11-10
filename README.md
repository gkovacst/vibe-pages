# Stockholm Survey

A small static questionnaire for friends visiting Stockholm.

- **Frontend:** plain HTML/CSS/JS, hosted on GitHub Pages (no build step)
- **Database:** a Google Sheet, written to by a Google Apps Script web app
- **Verification:** friends enter their name and email. The email must appear on the
  `Whitelist` tab of the sheet. The check happens in Apps Script, so the guest list
  never appears in the public site code.
- **Questions:** stored in the `Questions` tab of the sheet. They're sent to the browser
  only after the email passes the whitelist check, so they aren't public either.

```
stockholm-survey/
├── index.html          page structure (verify → questions → thank-you)
├── styles.css
├── app.js              rendering, validation, API calls
├── pranks.js           floating objects and photos
├── config.js           ← paste the Apps Script URL here
├── images/stockholm.jpg header photo (public domain / CC0, from Wikimedia Commons)
└── apps-script/Code.gs backend: copy into the Google Sheet's Apps Script editor
```

`apps-script/*.gs` is in `.gitignore`: it contains the starting questions, so it stays
local and isn't published with the site. Keep a backup of it somewhere, since git won't.

## 1. Set up the Google Sheet + backend

1. Create a new Google Sheet (e.g. "Stockholm Survey").
2. **Extensions → Apps Script**. Delete the sample code, paste in `apps-script/Code.gs`, and save.
3. In the function dropdown pick **`setup`** and click **Run**. Approve the permission prompt
   (choose your account → *Advanced* → *Go to … (unsafe)*; this is normal for your own scripts).
   This creates three tabs (any tab that already has content is left alone, so it's safe to re-run):
   - **Whitelist**: put one allowed email per row in column A, under the `Email` header.
     Replace the `friend@example.com` example.
   - **Questions**: the survey questions, pre-filled with the first 5 (see below).
   - **Responses**: one row per friend. Columns for each question are added automatically.
4. **Deploy → New deployment** → type **Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Click **Deploy** and copy the **Web app URL** (ends in `/exec`).
5. Paste that URL into `config.js`:
   ```js
   window.SURVEY_CONFIG = { appsScriptUrl: "https://script.google.com/macros/s/XXXX/exec" };
   ```

> If you change `Code.gs` later, use **Deploy → Manage deployments → ✏️ Edit → Version: New version**
> so the URL stays the same.

## 2. Test locally

```sh
cd stockholm-survey
python3 -m http.server 8000
# open http://localhost:8000
```

The site always talks to the real backend. If `appsScriptUrl` is empty, a yellow banner says so.

`index.html` loads `styles.css`, `config.js` and `app.js` with a `?v=` number. Increase it
whenever you change those files, otherwise browsers (and GitHub Pages' cache) may keep
showing the old version.

## 3. Publish on GitHub Pages

From the `vibe-pages` folder (the repo root):

```sh
git init && git add . && git commit -m "Add Stockholm survey"
gh repo create vibe-pages --public --source=. --push   # or add a remote yourself
```

Then on GitHub go to **Settings → Pages**, set *Source* to **Deploy from a branch**,
and choose `main` / `(root)`. The survey will be at:

```
https://<your-username>.github.io/vibe-pages/stockholm-survey/
```

## Changing the questions

Edit the **Questions** tab of the sheet. Changes show up the next time someone loads the
survey; there's no need to redeploy or touch the website. One row per question, in display order:

| Column        | Meaning |
|---------------|---------|
| `id`          | Short unique key, letters/digits/`_`/`-` only (e.g. `sights`). Becomes the column name in **Responses**. |
| `type`        | `checkbox` (pick any), `radio` (pick one) or `text` (free text) |
| `required`    | Tick the checkbox if it must be answered |
| `title`       | The question itself |
| `hint`        | Optional small text under the question |
| `placeholder` | Optional example text inside a `text` box |
| `options`     | For `checkbox`/`radio`: one option per line (Ctrl/⌘+Enter for a new line in a cell). An emoji at the start is shown as an icon. Add ` \| https://…` at the end to show an "Infó ↗" link, e.g. `⛵ Vasa Múzeum \| https://www.vasamuseet.se`. Start a line with `!` to make it a "none of these" option (checkbox only): ticking it clears the others, e.g. `!🙅 Hagyjál már ezzel` |

To start over from the questions in `Code.gs` (`SEED_QUESTIONS`), paste the latest `Code.gs`
into the Apps Script editor and run **`resetQuestions`**. It rebuilds the Questions tab and
overwrites any edits made there; Whitelist and Responses are untouched.

Rows with no `id`, no `title` or an unknown `type` are skipped, so you can clear the `id` to hide
a question temporarily. A new id gets a new column in **Responses**. If you rename an id, new
answers go into a new column and the old answers stay in the old one. When someone picks several
options, they're stored one per line in a single cell.

## Pranks

`pranks.js` holds the jokes:

- **Timed queue**, one at a time: camel, Viking ship, mushroom, northern lights, grave candle,
  "Bálint éppen gépel…", moose sign, mop bucket, snowfall, winter darkness and Bruges belfry,
  with the photos mixed in at random once the visitor's email is verified. The first comes
  10 seconds after the page opens; each next one 3–8 seconds after the previous finishes.
  Add `?prank` to the URL for 1–2 second gaps when testing.
- **Runaway button:** on the last question, "Válaszok elküldése" dodges the mouse twice.
- **Bonus step:** after the last question, "12 / 11 — Biztos vagy benne?" with two "Igen" buttons.
- **Loading messages** while the answers are being sent.
- **Option reactions** (matched by option text in `REACTIONS`, so update that list if you rename
  options in the sheet): Surströmming 💨, "Hagyjál már ezzel", Bor / "Naná, hogy pálinka"
  (Systembolaget age check, once), Räksmörgås 🦐 shower, "Délben se" (page naps), "Pörgősen"
  (progress bar sprints). Pálinka options also wobble on hover.
- **Freemail jokes** on the email step: a fake "not supported" error for Bálint, and if this
  browser has already been used with a gmail address, freemail addresses are blocked with
  "Balázs, ne próbáld meg mások válaszait megnézni!" (remembered in the browser's localStorage).
  A "Nem, tényleg Bálint vagyok" button under it continues like Tovább.
- **Tab title** changes to "Hé, gyere vissza! 🇸🇪" while the visitor is on another tab.
- **Swedish Chef mode:** click the "Stockholm" title 5 times quickly.
- **ABBA disco:** type "abba" anywhere.

The photos aren't in the repo. Put low-res JPEG/PNG/GIF/WebP files (under 500 KB each) in a
Drive folder named **Pranks** in the same folder as the spreadsheet. The Apps Script sends
them only to verified visitors. Run **`checkPrankPhotos`** in the editor once to grant Drive
access and to see which files will be used.

## Notes

- Friends can come back with the same email to update their answers. The existing row is
  updated instead of a new row being added.
- Anyone who knows a whitelisted email can see and change that person's answers. That's fine
  for a friends' trip survey, but don't ask for anything sensitive.
