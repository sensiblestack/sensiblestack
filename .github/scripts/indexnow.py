#!/usr/bin/env python3
"""Submit weusedithq.com URLs to IndexNow after a successful Pages deploy.

Modes:
  changed  submit only pages whose files changed between --base and --head
           (all pages if the IndexNow key file itself changed: first deploy)
  all      submit every <loc> in the live sitemap

Exit code is non-zero only when IndexNow answers with a 4xx status.
"""
import argparse
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request

HOST = "weusedithq.com"
SITE = f"https://{HOST}"
KEY = "939ba7e13ef755be2b2f3e1820ba28d7"
KEY_LOCATION = f"{SITE}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
UA = "weusedithq-indexnow/1.0"


def fetch(url, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def sitemap_urls():
    _, body = fetch(f"{SITE}/sitemap.xml?nocache={int(time.time())}")
    urls = [u.strip() for u in re.findall(r"<loc>\s*([^<]+?)\s*</loc>", body)]
    return [u for u in urls if u.startswith(SITE + "/")]


def changed_files(base, head):
    out = subprocess.run(["git", "diff", "--name-only", base, head],
                         check=True, capture_output=True, text=True).stdout
    return [line.strip() for line in out.splitlines() if line.strip()]


def file_to_url(path):
    """Map a published file path to its page URL, or None."""
    if path == "index.html":
        return SITE + "/"
    if path.endswith("/index.html"):
        return f"{SITE}/{path[:-len('index.html')]}"
    return None


def wait_for_key(max_wait=180):
    deadline = time.time() + max_wait
    while True:
        try:
            status, body = fetch(f"{KEY_LOCATION}?nocache={int(time.time())}", timeout=15)
            if status == 200 and body.strip() == KEY:
                print(f"Key file is live: {KEY_LOCATION}")
                return True
        except Exception as e:  # noqa: BLE001
            print(f"Key file not reachable yet ({e})")
        if time.time() >= deadline:
            print(f"::warning::Key file not confirmed at {KEY_LOCATION}; submitting anyway")
            return False
        time.sleep(15)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["changed", "all"], default="changed")
    ap.add_argument("--base")
    ap.add_argument("--head", default="HEAD")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    live = sitemap_urls()
    print(f"Sitemap has {len(live)} URLs")
    if not live:
        print("::warning::No URLs found in sitemap; nothing to submit")
        return 0

    if args.mode == "all":
        urls = live
    else:
        base = args.base or f"{args.head}^1"
        try:
            files = changed_files(base, args.head)
        except subprocess.CalledProcessError as e:
            print(f"::warning::git diff failed ({e.stderr.strip()}); submitting all sitemap URLs")
            files = None
        if files is None or f"{KEY}.txt" in files:
            urls = live
            print("Key file changed or diff unavailable: submitting all URLs")
        else:
            wanted = {file_to_url(f) for f in files} - {None}
            urls = [u for u in live if u in wanted]
            print(f"{len(files)} changed files, {len(urls)} of them are pages in the sitemap")

    if not urls:
        print("No changed pages to submit.")
        return 0

    for u in urls:
        print("  " + u)
    payload = {"host": HOST, "key": KEY, "keyLocation": KEY_LOCATION, "urlList": urls}
    if args.dry_run:
        print("Dry run, payload:\n" + json.dumps(payload, indent=2))
        return 0

    wait_for_key()
    req = urllib.request.Request(
        ENDPOINT, data=json.dumps(payload).encode(), method="POST",
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            status, body = r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        status, body = e.code, e.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"::warning::IndexNow request failed before a response: {e}")
        return 0

    print(f"IndexNow responded {status} {body[:500]}")
    if 400 <= status < 500:
        print(f"::error::IndexNow rejected the submission ({status})")
        return 1
    if status not in (200, 202):
        print(f"::warning::Unexpected IndexNow status {status}; not failing")
    else:
        print(f"Accepted: {len(urls)} URL(s) submitted")
    return 0


if __name__ == "__main__":
    sys.exit(main())
