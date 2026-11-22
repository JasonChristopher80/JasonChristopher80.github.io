# Privacy & Credit Command Center

A static, mobile-friendly website to track credit freezes and disputes and work a 107-company data-broker opt-out queue. Two profiles (Person 1 and Person 2 by default) can be renamed locally in the browser.

This site has **no backend**. Anything you type stays in **this browser’s localStorage** on this device. Export a JSON backup if you want to move data to another computer.

This is an education and personal-organization tool only. It is not legal, credit-repair, or tax advice, and it does not guarantee any result. Check every step with the official agency or company before you act.

## Open it locally

You can unzip the folder and open `index.html` in a browser. If a browser blocks something, run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://127.0.0.1:8000/

## What is in the site

- **Credit center** — Freeze checklist for Equifax, Experian, TransUnion, Innovis, ChexSystems, NCTUE, LexisNexis, The Work Number, and OptOutPrescreen, with official links, mail addresses, and thaw instructions. Dispute letter builder (FCRA § 611 and optional § 605B identity-theft block) with evidence checklist, mailing-address lookup, and a 30-day investigation tracker. Statuses start blank until you update them.
- **Opt-out queue** — 107 companies, separate status for each person, search and filters, official links, photo-ID and phone flags.
- **Agencies and forms** — Government, Treasury, tracking, big-tech settings, and a forms guide.
- **Your info and backup** — Optional name and address for letters, last-4-only SSN field, renameable profile labels, export/import JSON, and an optional counts-only progress summary (no names or addresses).
- **Terms & About** — Education-only notice: not legal, credit-repair, or tax advice; no guaranteed results; verify everything with the official agency.

## Privacy rules

- Do not enter a full Social Security number, a full account number, a password, or other credentials.
- The last 4 digits of an SSN are optional and meant only for a printed letter.
- Do not put an exported JSON backup in a public repository, a shared inbox, or an unencrypted cloud folder.
- Clearing this site’s browser data erases local records unless you have a backup file.

## Hosting and indexing

This public build is a pilot. `robots.txt` asks crawlers not to index it, and every page has `noindex,nofollow`. That is a request, not a guarantee. Do not put a full backup JSON (which can include a name and address) in any repository.
