# DNS for AI Discovery (DNS-AID) — records to publish manually

The audit flagged that `shashwa7.in` has no DNS-AID entrypoint records. These
records are published at the DNS provider (Cloudflare, Namecheap, Hover, etc.)
rather than in this repo, so you have to add them yourself.

Spec: [draft-mozleywilliams-dnsop-dnsaid](https://datatracker.ietf.org/doc/draft-mozleywilliams-dnsop-dnsaid/)
SVCB/HTTPS spec: [RFC 9460](https://www.rfc-editor.org/rfc/rfc9460)

---

## What to publish

### 1. Generic index entrypoint

Name: `_index._agents.shashwa7.in`
Type: `HTTPS` (or `SVCB` if your DNS provider doesn't offer HTTPS yet)
Value:

```
1 . alpn="h2,h3" endpoint="https://www.shashwa7.in/.well-known/llms.txt"
```

In zone-file syntax:

```
_index._agents.shashwa7.in. 3600 IN HTTPS 1 . ( alpn="h2,h3" endpoint="https://www.shashwa7.in/.well-known/llms.txt" )
```

Meaning: *"the canonical agent-facing entrypoint for this domain is the
llms.txt file, reachable over HTTP/2 or HTTP/3."*

### 2. (Optional) A2A discovery record

Skip this unless you actually expose an A2A (Agent-to-Agent) endpoint. You
don't today.

```
_a2a._agents.shashwa7.in. 3600 IN HTTPS 1 . ( alpn="h2,h3" endpoint="https://www.shashwa7.in/api/a2a" )
```

---

## DNSSEC

DNS-AID requires the discovery zone to be DNSSEC-signed so validating
resolvers return authenticated data.

### If your domain is on Cloudflare

DNSSEC is one toggle in the dashboard:

1. Cloudflare dashboard → your domain → DNS → Settings.
2. Scroll to **DNSSEC** → click **Enable DNSSEC**.
3. Cloudflare shows a DS record. Paste it into your registrar's DNSSEC settings.
4. Wait for the registrar to publish; can take up to 24 hours.
5. Verify with `dig +dnssec shashwa7.in` (look for an `ad` flag in the answer).

### If your domain is elsewhere

Most providers expose DNSSEC as a domain-level setting. You generate (or your
provider generates) a DS record and you paste it into your registrar. The
specifics vary; the goal is the same — a published, signed DS record at the
registry.

---

## Verifying the records once published

```bash
# Should return the HTTPS record
dig +short HTTPS _index._agents.shashwa7.in

# Should show RRSIG records and the `ad` (authenticated data) flag
dig +dnssec +noall +answer +comments _index._agents.shashwa7.in HTTPS
```

You can also test with [https://dnsviz.net/](https://dnsviz.net/) — paste
`_agents.shashwa7.in` and check the chain is intact.

---

## Why this can't live in the repo

DNS records are published at the zone level (your DNS provider), not at the
HTTP layer. There's no Next.js / Vercel knob for them. If you ever migrate
DNS off the current provider, these records have to move with it.
