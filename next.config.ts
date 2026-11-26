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

      // Café lost its é, then the trailing e, on these slugs. 12 Chairs Café
      // in Williamsburg stays 12-chairs-caf: 12-chairs-cafe is a different
      // restaurant in SoHo.
      { source: "/restaurants/bluestone-lane-battery-park-caf", destination: "/restaurants/bluestone-lane-battery-park-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-chelsea-piers-caf", destination: "/restaurants/bluestone-lane-chelsea-piers-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-dumbo-caf", destination: "/restaurants/bluestone-lane-dumbo-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-55-hudson-yards-caf", destination: "/restaurants/bluestone-lane-55-hudson-yards-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-manhattan-west-caf", destination: "/restaurants/bluestone-lane-manhattan-west-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-tribeca-caf", destination: "/restaurants/bluestone-lane-tribeca-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-upper-east-side-caf", destination: "/restaurants/bluestone-lane-upper-east-side-cafe", statusCode: 301 },
      { source: "/restaurants/bluestone-lane-upper-west-side-caf", destination: "/restaurants/bluestone-lane-upper-west-side-cafe", statusCode: 301 },
      { source: "/restaurants/breckenridge-green-caf", destination: "/restaurants/breckenridge-green-cafe", statusCode: 301 },
      { source: "/restaurants/bryant-park-caf", destination: "/restaurants/bryant-park-cafe", statusCode: 301 },
      { source: "/restaurants/compass-caf", destination: "/restaurants/compass-cafe", statusCode: 301 },
      { source: "/restaurants/cuffie-ridge-jamaican-vegan-caf", destination: "/restaurants/cuffie-ridge-jamaican-vegan-cafe", statusCode: 301 },
      { source: "/restaurants/daisys-juice-bar-caf", destination: "/restaurants/daisys-juice-bar-cafe", statusCode: 301 },
      { source: "/restaurants/el-budare-caf", destination: "/restaurants/el-budare-cafe", statusCode: 301 },
      { source: "/restaurants/franchia-vegan-caf", destination: "/restaurants/franchia-vegan-cafe", statusCode: 301 },
      { source: "/restaurants/havana-caf", destination: "/restaurants/havana-cafe", statusCode: 301 },
      { source: "/restaurants/1480-hk-caf", destination: "/restaurants/1480-hk-cafe", statusCode: 301 },
      { source: "/restaurants/beets-social-caf", destination: "/restaurants/beets-social-cafe", statusCode: 301 },
      { source: "/restaurants/la-flor-de-izucar-caf", destination: "/restaurants/la-flor-de-izucar-cafe", statusCode: 301 },
      { source: "/restaurants/le-moulin-caf", destination: "/restaurants/le-moulin-cafe", statusCode: 301 },
      { source: "/restaurants/madame-bont-caf", destination: "/restaurants/madame-bont-cafe", statusCode: 301 },
      { source: "/restaurants/marie-blachre-bakery-caf", destination: "/restaurants/marie-blachre-bakery-cafe", statusCode: 301 },
      { source: "/restaurants/moss-caf", destination: "/restaurants/moss-cafe", statusCode: 301 },
      { source: "/restaurants/natura-caf", destination: "/restaurants/natura-cafe", statusCode: 301 },
      { source: "/restaurants/newsbar-caf", destination: "/restaurants/newsbar-cafe", statusCode: 301 },
      { source: "/restaurants/oda-caf", destination: "/restaurants/oda-cafe", statusCode: 301 },
      { source: "/restaurants/ok-caf", destination: "/restaurants/ok-cafe", statusCode: 301 },
      { source: "/restaurants/redwood-caf", destination: "/restaurants/redwood-cafe", statusCode: 301 },
      { source: "/restaurants/rosecrans-florist-caf", destination: "/restaurants/rosecrans-florist-cafe", statusCode: 301 },
      { source: "/restaurants/sweetie-house-playground-caf", destination: "/restaurants/sweetie-house-playground-cafe", statusCode: 301 },
      { source: "/restaurants/the-bay-caf", destination: "/restaurants/the-bay-cafe", statusCode: 301 },
      { source: "/restaurants/the-kasbah-caf", destination: "/restaurants/the-kasbah-cafe", statusCode: 301 },
      { source: "/restaurants/the-paris-caf", destination: "/restaurants/the-paris-cafe", statusCode: 301 },
      { source: "/restaurants/the-pine-tree-caf", destination: "/restaurants/the-pine-tree-cafe", statusCode: 301 },
      { source: "/restaurants/the-river-caf", destination: "/restaurants/the-river-cafe", statusCode: 301 },
      { source: "/restaurants/ton-caf", destination: "/restaurants/ton-cafe", statusCode: 301 },
      { source: "/restaurants/yellow-magnolia-caf", destination: "/restaurants/yellow-magnolia-cafe", statusCode: 301 },

      { source: "/best", destination: "/guides", permanent: true },
      { source: "/best/", destination: "/guides", permanent: true },

      // Paid tiers live on the page outreach emails already use.
      { source: "/partners", destination: "/partner-with-us", statusCode: 301 },
      { source: "/partners/", destination: "/partner-with-us", statusCode: 301 },

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
    // Restaurant photos are effectively immutable (Google Maps CDN URLs
    // are content-addressed). Cache transformed variants at the edge for
    // 31 days to cut re-transformations and cache writes. Next default
    // minimumCacheTTL is 60s, which is far too aggressive for our case.
    minimumCacheTTL: 2678400,

    // Allowlist the optimizer to one quality value (Next's default = 75).
    // No <Image> in the codebase passes an explicit `quality` prop, so
    // this collapses what could be ~5x transformations per source to 1x
    // (per format x width), and rejects ?q=... probes from crawlers /
    // copy-pasted URLs that would otherwise spawn spurious transforms.
    qualities: [75],

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "streetviewpixels-pa.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
