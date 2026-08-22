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
  images: {
    /* YouTube thumbnails for the shelf's playlist section. Narrow on purpose:
       one host, one path shape, https only. `remotePatterns` is an allow-list
       for the optimizer, and anything it matches can be fetched and re-served
       from this domain, so it should describe exactly what is wanted and
       nothing adjacent to it. */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
      // Album art for the same section. Reached first; the YouTube still above
      // is only the fallback for a track Apple has never heard of.
      //
      // Wildcarded because Apple shards this across `is1-ssl` through
      // `is5-ssl` and hands back whichever it feels like. Every track I
      // sampled came from `is1`, which is exactly how this would have shipped
      // looking correct and then broken on some future song whose sleeve
      // happened to live on `is3`. A single `*` is one subdomain label, so
      // this still admits nothing outside mzstatic.com.
      {
        protocol: "https",
        hostname: "*.mzstatic.com",
        pathname: "/image/thumb/**",
      },
    ],
  },
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
