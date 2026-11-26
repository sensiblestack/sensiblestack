# Sensible Stack (live site)

Static site for GitHub Pages. Plain HTML and one stylesheet, no build step.

## Affiliate links

Calls to action go through a `/go/<tool>/` page, which redirects to the provider. To turn a plain redirect into an affiliate link, or to change one that is already enrolled, edit only that tool's `go/<tool>/index.html`. Articles do not need editing.

Enrolled programmes. These redirects already carry a real referral id. Leave the destination as it is unless the programme itself changes it:

- HighLevel: `go/highlevel/index.html`
- Jotform: `go/jotform/index.html`
- Make: `go/make/index.html`
- Pictory: `go/pictory/index.html`

Every other `go/<tool>/` redirect is a plain provider URL. Those programmes are not enrolled. Do not describe them as affiliate links on the site until the destination in that one file is a real affiliate URL.

Plain redirects today: `go/airtable/`, `go/aitable/`, `go/asana/`, `go/clickup/`, `go/coda/`, `go/descript/`, `go/elevenlabs/`, `go/fireflies/`, `go/hubspot/`, `go/kinsta/`, `go/kit/`, `go/monday/`, `go/motion/`, `go/notion/`, `go/projectmanager/`, `go/reclaim/`, `go/semrush/`, `go/synthesia/`, `go/teamwork/`, `go/todoist/`, `go/wpengine/`, `go/wrike/`.

## Pages

Home, About, How We Rate, Affiliate Disclosure, Privacy, Contact, 12 comparisons, 6 guides, 7 business-type pages, 17 tool reviews, 4 journal posts, and 1 setup guide (HighLevel).

## Drafts

Unpublished drafts are not on `main`, so GitHub Pages does not serve them. They are on the branch `cursor/site-drafts-d94d`, still under `preview/`.

To read one locally:

```
git fetch origin cursor/site-drafts-d94d
git checkout cursor/site-drafts-d94d
python3 -m http.server
```

Then open `http://127.0.0.1:8000/preview/` plus the draft folder, for example `http://127.0.0.1:8000/preview/make/`.
