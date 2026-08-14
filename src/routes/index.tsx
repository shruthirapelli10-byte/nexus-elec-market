import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * The storefront is a standalone HTML/CSS/JS app served from /store/.
 * This route just forwards visitors from "/" to it.
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voltra — Premium Electronics Store, Delivered Fast" },
      {
        name: "description",
        content:
          "Shop flagship smartphones, laptops, audio, gaming and accessories at Voltra with flash deals and fast delivery.",
      },
      { property: "og:title", content: "Voltra — Premium Electronics Store" },
      {
        property: "og:description",
        content: "Flagship phones, laptops, audio and gaming gear with flash deals and fast delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/store/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <a className="text-sm font-medium text-primary underline" href="/store/index.html">
        Opening the Voltra store…
      </a>
    </div>
  );
}
