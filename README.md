# We Used It HQ (live site)

Static site for GitHub Pages. Plain HTML and one stylesheet, no build step.

## Affiliate links

Calls to action go through a `/go/<tool>/` page, which redirects to the provider. To turn a plain redirect into an affiliate link, or to change one that is already enrolled, edit only that tool's `go/<tool>/index.html`. Articles do not need editing.

Enrolled programs. These redirects already carry a real referral id. Leave the destination as it is unless the program itself changes it:

- HighLevel: `go/highlevel/index.html`
- Jotform: `go/jotform/index.html`
- Make: `go/make/index.html`
- Pictory: `go/pictory/index.html`

Every other `go/<tool>/` redirect is a plain provider URL. Those programs are not enrolled. Do not describe them as affiliate links on the site until the destination in that one file is a real affiliate URL.

Plain redirects today: `go/airtable/`, `go/aitable/`, `go/asana/`, `go/clickfunnels/`, `go/clickup/`, `go/coda/`, `go/descript/`, `go/elevenlabs/`, `go/fireflies/`, `go/google-forms/`, `go/hubspot/`, `go/kartra/`, `go/kinsta/`, `go/kit/`, `go/klaviyo/`, `go/monday/`, `go/motion/`, `go/notion/`, `go/pipedrive/`, `go/projectmanager/`, `go/reclaim/`, `go/salesforce/`, `go/semrush/`, `go/synthesia/`, `go/systeme/`, `go/teamwork/`, `go/todoist/`, `go/wpengine/`, `go/wrike/`, `go/zapier/`, `go/zoho/`.

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
