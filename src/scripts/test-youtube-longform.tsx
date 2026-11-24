import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import YoutubeLongformEmbed from "../components/youtube-longform-embed"
import {
  BEST_ITALIAN_LONGFORM_SOURCE,
  LONGFORM_GRADE_CAVEAT,
  LONGFORM_VERIFIED_CAPTION,
  LONGFORM_WALKTHROUGH_HEADING,
  bestItalianLongformVideo,
  buildYoutubeLongform,
  buildYoutubeLongformVideoObject,
} from "../data/youtube-longform"
import { extractJsonLd, validateJsonLd, validateVisibleHtml } from "../lib/validate-jsonld"

assert.equal(buildYoutubeLongform({ ...BEST_ITALIAN_LONGFORM_SOURCE, videoId: "" }), null)
assert.equal(buildYoutubeLongform({ ...BEST_ITALIAN_LONGFORM_SOURCE, videoId: "   " }), null)
assert.equal(buildYoutubeLongform({ ...BEST_ITALIAN_LONGFORM_SOURCE, videoId: undefined }), null)

const video = bestItalianLongformVideo
assert.ok(video, "the checked-in Italian video has an id")
assert.equal(video.videoId, "NNkuZAOiVCU")
assert.equal(video.title, "10 NYC Italian Kitchens, Ranked by Inspection Score")
assert.equal(video.uploadDate, "2026-11-24")
assert.equal(video.durationSec, 601)
assert.equal(video.duration, "PT10M1S")
assert.equal(video.watchUrl, "https://www.youtube.com/watch?v=NNkuZAOiVCU")
assert.equal(video.embedUrl, "https://www.youtube-nocookie.com/embed/NNkuZAOiVCU")
assert.equal(video.thumbnailUrl, "https://i.ytimg.com/vi/NNkuZAOiVCU/maxresdefault.jpg")
assert.equal(video.fallbackThumbnailUrl, "https://i.ytimg.com/vi/NNkuZAOiVCU/hqdefault.jpg")
assert.equal(video.description, `${LONGFORM_VERIFIED_CAPTION} ${LONGFORM_GRADE_CAVEAT}`)

const schema = buildYoutubeLongformVideoObject(video)
assert.equal(schema["@type"], "VideoObject")
assert.equal(schema.name, video.title)
assert.equal(schema.description, video.description)
assert.deepEqual(schema.thumbnailUrl, [video.thumbnailUrl, video.fallbackThumbnailUrl])
assert.equal(schema.uploadDate, "2026-11-24")
assert.equal(schema.duration, "PT10M1S")
assert.equal(schema.embedUrl, video.embedUrl)
assert.equal(schema.contentUrl, video.watchUrl)
assert.deepEqual(validateJsonLd([schema], ["VideoObject"]), [])
const schemaJson = JSON.stringify(schema)
for (const banned of [
  "interactionStatistic",
  "aggregateRating",
  "transcript",
  "interactionCount",
  "viewCount",
  "commentCount",
  "likeCount",
]) {
  assert.equal(schemaJson.includes(`"${banned}"`), false, `schema includes ${banned}`)
}

function renderEmbed(value: Parameters<typeof YoutubeLongformEmbed>[0]["video"]) {
  return renderToStaticMarkup(<YoutubeLongformEmbed video={value} />)
}

assert.equal(renderEmbed(null), "")
assert.equal(renderEmbed({ ...video, videoId: "" }), "")
assert.equal(renderEmbed({ ...video, videoId: "   " }), "")

const html = renderEmbed(video)
assert.equal(html.includes("<iframe"), false, "first paint has no YouTube iframe")
assert.equal(html.includes("autoplay"), false, "the embed URL is not requested until click")
assert.equal((html.match(/<iframe/g) ?? []).length, 0)
assert.equal((html.match(/application\/ld\+json/g) ?? []).length, 1, "one VideoObject script")
assert.equal((html.match(/data-video-id=/g) ?? []).length, 1, "one video on the guide embed")
assert.ok(html.includes('data-video-id="NNkuZAOiVCU"'))
assert.ok(html.includes("aspect-[16/9]"), "long-form uses a 16:9 frame")
assert.equal(html.includes("aspect-[9/16]"), false, "a landscape video is not placed in the Shorts frame")
assert.equal(html.includes("max-w-[17.5rem]"), false, "the long-form frame is not the Shorts column")
assert.ok(html.includes("https://i.ytimg.com/vi/NNkuZAOiVCU/maxresdefault.jpg"))
assert.ok(html.includes('aria-label="Play video: 10 NYC Italian Kitchens, Ranked by Inspection Score"'))
assert.ok(html.includes('href="https://www.youtube.com/watch?v=NNkuZAOiVCU"'))
assert.ok(html.includes('id="video-walkthrough"'))

const issues = [
  ...validateJsonLd(extractJsonLd(html), ["VideoObject"]),
  ...validateVisibleHtml(html, [
    LONGFORM_WALKTHROUGH_HEADING,
    LONGFORM_VERIFIED_CAPTION,
    LONGFORM_GRADE_CAVEAT,
    "Watch on YouTube",
    "if the player does not load.",
    "NNkuZAOiVCU",
  ]),
]
assert.deepEqual(issues, [], JSON.stringify(issues, null, 2))

const nodes = extractJsonLd(html)
assert.equal(nodes.length, 1)
assert.equal(nodes[0]["@type"], "VideoObject")
assert.equal(nodes[0].name, "10 NYC Italian Kitchens, Ranked by Inspection Score")
assert.equal(nodes[0].description, `${LONGFORM_VERIFIED_CAPTION} ${LONGFORM_GRADE_CAVEAT}`)
assert.equal(nodes[0].uploadDate, "2026-11-24")
assert.equal(nodes[0].duration, "PT10M1S")
assert.equal(nodes[0].embedUrl, "https://www.youtube-nocookie.com/embed/NNkuZAOiVCU")
assert.equal(nodes[0].contentUrl, "https://www.youtube.com/watch?v=NNkuZAOiVCU")
assert.deepEqual(nodes[0].thumbnailUrl, [
  "https://i.ytimg.com/vi/NNkuZAOiVCU/maxresdefault.jpg",
  "https://i.ytimg.com/vi/NNkuZAOiVCU/hqdefault.jpg",
])

const page = readFileSync("src/app/guides/best-italian-restaurants-nyc/page.tsx", "utf8")
assert.equal((page.match(/<YoutubeLongformEmbed/g) ?? []).length, 1)
assert.equal((page.match(/YoutubeShort/g) ?? []).length, 0)
assert.doesNotMatch(page, /youtube-shorts/)
assert.doesNotMatch(page, /from "@\/lib\/db"|prisma/)
assert.doesNotMatch(page, /"use client"/)
const introAt = page.indexOf("{BEST_ITALIAN_INTRO}")
const videoAt = page.indexOf("<YoutubeLongformEmbed")
const listAt = page.indexOf('id="the-list"')
assert.ok(introAt !== -1 && introAt < videoAt && videoAt < listAt, "video sits after the intro and before the list")
const tocStart = page.indexOf("<GuideTOC")
const tocEnd = page.indexOf("/>", tocStart)
const toc = page.slice(tocStart, tocEnd)
const walk = toc.indexOf("#video-walkthrough")
const listLink = toc.indexOf("#the-list")
assert.ok(walk !== -1 && walk < listLink, "Video walkthrough is a table-of-contents item")
assert.match(toc, /Video walkthrough/)

const player = readFileSync("src/components/youtube-short-player.tsx", "utf8")
assert.match(player, /"use client"/)
assert.match(player, /aspect-\[9\/16\]/)
assert.match(player, /aspect-\[16\/9\]/)
assert.match(player, /YoutubeLongformPlayer/)
assert.doesNotMatch(player, /youtube-shorts/)
const embed = readFileSync("src/components/youtube-longform-embed.tsx", "utf8")
assert.doesNotMatch(embed, /"use client"/)
assert.doesNotMatch(embed, /youtube-shorts|prisma/)
const data = readFileSync("src/data/youtube-longform.ts", "utf8")
assert.match(data, /maxresdefault\.jpg/)
assert.match(data, /hqdefault\.jpg/)
assert.doesNotMatch(data, /youtube-shorts|viewCount|likeCount/)

const listing = readFileSync("src/app/restaurants/[slug]/page.tsx", "utf8")
assert.match(listing, /export const revalidate = 86400/)
assert.match(listing, /export const dynamicParams = true/)
const loader = readFileSync("src/lib/listing-loader.ts", "utf8")
assert.match(loader, /isTransientConnectionError/)
assert.match(loader, /DEGRADED_REVALIDATE_SECONDS/)
const health = readFileSync("src/app/api/health/route.ts", "utf8")
assert.match(health, /export const dynamic = "force-dynamic"/)

console.log("youtube longform embed tests passed")
