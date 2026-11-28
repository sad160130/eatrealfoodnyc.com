import assert from "node:assert/strict"
import {
  HTML_SITEMAP_DEPTH,
  boroughSitemapPath,
  groupNamesByLetter,
  htmlSitemapPaths,
  letterPath,
  neighborhoodHubPath,
  restaurantLetter,
  sitemapPageCount,
} from "../lib/html-sitemap"
import { explainerAudioExists, explainerAudioSrc } from "../lib/explainer-audio"

assert.equal(restaurantLetter("90 - 30 Metropolitan Avenue"), "0")
assert.equal(restaurantLetter("Peaches Lewis"), "P")
assert.equal(letterPath("P"), "/sitemap/restaurants/p")
assert.equal(letterPath("P", 2), "/sitemap/restaurants/p/page/2")
assert.equal(letterPath("0", 1), "/sitemap/restaurants/0")
assert.equal(boroughSitemapPath("Staten Island"), "/sitemap/boroughs/staten-island")
assert.equal(
  neighborhoodHubPath("Queens", "Rego Park"),
  "/nyc/queens/rego-park/healthy-restaurants"
)
assert.equal(sitemapPageCount(0), 1)
assert.equal(sitemapPageCount(100), 1)
assert.equal(sitemapPageCount(101), 2)

const names = ["Alpha", "Beta", ...Array.from({ length: 101 }, (_, i) => `M${i}`)]
const paths = htmlSitemapPaths(names, ["Manhattan"])
assert.ok(paths.includes("/sitemap"))
assert.ok(paths.includes("/sitemap/boroughs/manhattan"))
assert.ok(paths.includes("/sitemap/restaurants/m"))
assert.ok(paths.includes("/sitemap/restaurants/m/page/2"))
assert.equal(groupNamesByLetter(names).get("M"), 101)

assert.equal(HTML_SITEMAP_DEPTH.neighborhoodHub, 3)
assert.equal(HTML_SITEMAP_DEPTH.restaurant, 3)
assert.ok(HTML_SITEMAP_DEPTH.restaurant <= 5)
assert.ok(HTML_SITEMAP_DEPTH.neighborhoodHub <= 5)

assert.equal(explainerAudioSrc("data"), "/audio/data-explainer.mp3")
assert.equal(explainerAudioSrc("grade-a"), "/audio/grade-a-explainer.mp3")
assert.equal(explainerAudioExists("data"), false)
assert.equal(explainerAudioExists("grade-a"), false)

console.log("html sitemap tests passed", { paths: paths.length })
