"use client";

import Script from "next/script";
import React from "react";

export default function FocusProApp() {
  return (
    <div className="flex justify-center">
      <blockquote className="twitter-tweet">
        <p lang="en" dir="ltr">
          Built a tiny app that blocks distracting sites. Saw this as premium
          feature in{" "}
          <a href="https://twitter.com/stayinsession">@stayinsession</a> app.
          <br />
          Yeah, a VPN can bypass it, but come on, you wouldn’t do that… right?
          <br />
          What else should I add to it?{" "}
          <a href="https://t.co/1rw8NMqG7T">pic.twitter.com/1rw8NMqG7T</a>
        </p>
        — Shashwat (@offcod8){" "}
        <a href="https://twitter.com/offcod8/status/1998007706041659638">
          December 8, 2025
        </a>
      </blockquote>

      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        async
        charSet="utf-8"
      />
    </div>
  );
}
