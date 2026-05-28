/** @type {import('next').NextConfig} */

// RFC 8288 Link header. Each line points agents at a discovery resource.
// `rel` values are IANA-registered: sitemap, alternate, manifest, describedby.
// (Vary: Accept is set in middleware on routes that actually vary by Accept,
// not here — to avoid misleading caches about every route.)
const agentDiscoveryLinks = [
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</rss>; rel="alternate"; type="application/rss+xml"; title="RSS"',
  '</manifest.webmanifest>; rel="manifest"',
  '</.well-known/llms.txt>; rel="describedby"; type="text/plain"',
].join(", ");

const nextConfig = {
  eslint: {
    // Lint runs as its own step (`npm run lint`); warnings must not fail the
    // production build / deployment.
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        // Agent-discovery Link header on every HTML route.
        // Static assets (/images/*, /fonts/*, etc.) are excluded by the matcher.
        source: "/((?!_next|api|.*\\..*).*)",
        headers: [{ key: "Link", value: agentDiscoveryLinks }],
      },
    ];
  },
};

export default nextConfig;
