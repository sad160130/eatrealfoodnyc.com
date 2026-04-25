import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // ── Non-www → www ──
      {
        source: "/:path*",
        has: [{ type: "host", value: "eatrealfoodnyc.com" }],
        destination: "https://www.eatrealfoodnyc.com/:path*",
        permanent: true,
      },

      // ── NEIGHBORHOOD SLUG FIXES ──
      // Apostrophe bug produced wrong slugs (hell-s-kitchen → hells-kitchen)
      { source: "/nyc/manhattan/hell-s-kitchen/:path*", destination: "/nyc/manhattan/hells-kitchen/:path*", permanent: true },

      // ── ABOUT (1 RD, DR54) ──
      { source: "/about/", destination: "/about", permanent: true },

      // ── RECIPE HUB (2 RD, DR82) ──
      { source: "/allrecipes", destination: "/guides", permanent: true },
      { source: "/allrecipes/", destination: "/guides", permanent: true },

      // ── SEAFOOD RECIPES → /guides/seafood-healthy-restaurants-nyc ──
      // /tuna-nicoise — 3 RD, DR95
      { source: "/tuna-nicoise", destination: "/guides/seafood-healthy-restaurants-nyc", permanent: true },
      // /allrecipes/.../salmon-en-papillote — 3 RD, DR95
      { source: "/allrecipes/2015/11/22/salmon-en-papillote-with-summer-veg", destination: "/guides/seafood-healthy-restaurants-nyc", permanent: true },
      // /allrecipes/.../fish-lettuce-leaf-tacos — 1 RD, DR82
      { source: "/allrecipes/2015/8/10/fish-lettuce-leaf-tacos", destination: "/guides/seafood-healthy-restaurants-nyc", permanent: true },
      // /allrecipes/.../salmon-radish-apple-salad — 1 RD, DR71
      { source: "/allrecipes/2015/10/13/salmon-radish-apple-salad-with-an-orange-citrus-dressing", destination: "/guides/seafood-healthy-restaurants-nyc", permanent: true },
      // /allrecipes/.../green-curry-paste-halibut — 1 RD, DR64
      { source: "/allrecipes/2016/6/13/green-curry-paste-halibut-en-pappiotte", destination: "/guides/seafood-healthy-restaurants-nyc", permanent: true },

      // ── BREAKFAST RECIPES → /guides/healthy-breakfast-nyc ──
      // /allrecipes/.../hazelnut-orange-cacao-granola — 3 RD, DR95
      { source: "/allrecipes/2015/10/19/hazelnut-orange-cacao-granola", destination: "/guides/healthy-breakfast-nyc", permanent: true },
      // /allrecipes/.../raw-muesli — 2 RD, DR95
      { source: "/allrecipes/2015/8/10/raw-muesli", destination: "/guides/healthy-breakfast-nyc", permanent: true },
      // /allrecipes/.../nut-milks — 2 RD, DR95
      { source: "/allrecipes/2015/8/10/nut-milks", destination: "/guides/healthy-breakfast-nyc", permanent: true },

      // ── VEGAN RECIPES → /healthy-restaurants/vegan ──
      // /allrecipes/.../avocado-fries — 3 RD, DR80
      { source: "/allrecipes/2016/1/18/avocado-fries-with-a-curry-lime-dip", destination: "/healthy-restaurants/vegan", permanent: true },
      // /allrecipes/.../salted-tahini-cups — 2 RD, DR81
      { source: "/allrecipes/2016/1/18/salted-tahini-cups-with-ginger-cardamom-coffee", destination: "/healthy-restaurants/vegan", permanent: true },
      // /peanut-butter-fudge — 2 RD, DR95
      { source: "/peanut-butter-fudge", destination: "/healthy-restaurants/vegan", permanent: true },
      // /allrecipes/.../raw-avocado-lime-tart — 1 RD, DR51
      { source: "/allrecipes/2015/11/19/raw-avocado-lime-tart", destination: "/healthy-restaurants/vegan", permanent: true },
      // /allrecipes/.../chocolate-matcha-cups — 1 RD, DR57
      { source: "/allrecipes/2015/10/5/chocolate-matcha-cups", destination: "/healthy-restaurants/vegan", permanent: true },
      // /allrecipes/.../vegan-tahini-date-ice-cream — 1 RD, DR27
      { source: "/allrecipes/2016/4/24/vegan-tahini-date-ice-cream", destination: "/healthy-restaurants/vegan", permanent: true },
      // /chocolate-peanut-butter-cheesecake — 1 RD, DR19
      { source: "/chocolate-peanut-butter-cheesecake", destination: "/healthy-restaurants/vegan", permanent: true },
      // /crudite-zucchini-dip — 1 RD, DR54
      { source: "/crudite-zucchini-dip", destination: "/healthy-restaurants/vegan", permanent: true },
      // /strawberry-coconut-pistachio-tart — 1 RD, DR30
      { source: "/strawberry-coconut-pistachio-tart", destination: "/healthy-restaurants/vegan", permanent: true },

      // ── VEGETARIAN RECIPES → /healthy-restaurants/vegetarian ──
      // /brown-rice-greens-pesto-bowl — 2 RD, DR95
      { source: "/brown-rice-greens-pesto-bowl", destination: "/healthy-restaurants/vegetarian", permanent: true },
      // /allrecipes/.../brussel-sprout-pumpkin-fennel-quinoa-salad — 2 RD, DR85
      { source: "/allrecipes/2015/10/19/brussel-sprout-pumpkin-fennel-quinoa-salad-with-a-carrot-ginger-orange-dressing", destination: "/healthy-restaurants/vegetarian", permanent: true },
      // /allrecipes/.../cauliflower-pear-fennel-soup — 1 RD, DR71
      { source: "/allrecipes/2015/10/11/cauliflower-pear-fennel-soup-with-parsnip-chips", destination: "/healthy-restaurants/vegetarian", permanent: true },
      // /blistered-shishitos — 1 RD, DR54
      { source: "/blistered-shishitos", destination: "/healthy-restaurants/vegetarian", permanent: true },
      // /cabbage-slaw — 1 RD, DR54
      { source: "/cabbage-slaw", destination: "/healthy-restaurants/vegetarian", permanent: true },
      // /tomato-tart — 1 RD, DR54
      { source: "/tomato-tart", destination: "/healthy-restaurants/vegetarian", permanent: true },

      // ── GLUTEN-FREE RECIPE → /healthy-restaurants/gluten-free ──
      // /allrecipes/.../gluten-free-banana-pizza — 1 RD, DR71
      { source: "/allrecipes/2016/3/7/gluten-free-banana-pizza-homemade-vegan-nutell", destination: "/healthy-restaurants/gluten-free", permanent: true },

      // ── RAW FOOD RECIPE → /healthy-restaurants/raw-food ──
      // /allrecipes/.../ginger-apple-pears — 2 RD, DR95
      { source: "/allrecipes/2015/11/3/ginger-apple-pears-with-a-pistachio-cardamom-crumble", destination: "/healthy-restaurants/raw-food", permanent: true },

      // ── WHOLE FOODS RECIPES → /healthy-restaurants/whole-foods ──
      // /allrecipes/.../yuzu-citrus-cheesecake — 2 RD, DR95
      { source: "/allrecipes/2016/3/7/yuzu-citrus-cheesecake", destination: "/healthy-restaurants/whole-foods", permanent: true },
      // /oven-baked-peaches — 1 RD, DR54
      { source: "/oven-baked-peaches", destination: "/healthy-restaurants/whole-foods", permanent: true },
      // /peaches-cheese-bites — 1 RD, DR54
      { source: "/peaches-cheese-bites", destination: "/healthy-restaurants/whole-foods", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "streetviewpixels-pa.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
