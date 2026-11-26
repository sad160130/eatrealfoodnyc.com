import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import rawRows from "../data/youtube-shorts.json"
import YoutubeShortEmbed from "../components/youtube-short-embed"
import {
  buildYoutubeShortVideoObject,
  getYoutubeShort,
  isoDuration,
  listYoutubeShorts,
  pickYoutubeShort,
  youtubeShortRowCount,
  type YoutubeShortRow,
} from "../lib/youtube-shorts"
import { extractJsonLd, validateJsonLd, validateVisibleHtml } from "../lib/validate-jsonld"

const rows = rawRows as YoutubeShortRow[]

assert.equal(rows.length, 68, "the checked-in map has one row per Short")
assert.equal(youtubeShortRowCount(), 68)
assert.equal(listYoutubeShorts().length, 68, "every row becomes one listing embed")

const slugs = new Set(rows.map((row) => row.restaurant_slug))
const ids = new Set(rows.map((row) => row.video_id))
assert.equal(slugs.size, 68, "slugs are unique, so a listing renders at most one Short")
assert.equal(ids.size, 68, "video ids are unique")

for (const row of rows) {
  const short = getYoutubeShort(row.restaurant_slug)
  assert.ok(short, `mapped slug resolves: ${row.restaurant_slug}`)
  assert.equal(short.videoId, row.video_id)
  assert.equal(short.shortUrl, `https://www.youtube.com/shorts/${row.video_id}`)
  assert.equal(short.embedUrl, `https://www.youtube-nocookie.com/embed/${row.video_id}`)
  assert.equal(typeof short.duration, "string", `${row.restaurant_slug} map row has a measured duration`)
  assert.equal("view_count_snapshot" in short, false)
  assert.equal("like_count_snapshot" in short, false)
  assert.equal("comment_count_snapshot" in short, false)

  const listingUrl = `https://www.eatrealfoodnyc.com/restaurants/${row.restaurant_slug}`
  const schema = buildYoutubeShortVideoObject(short, listingUrl)
  const schemaJson = JSON.stringify(schema)
  const issues = validateJsonLd([schema], ["VideoObject"])
  assert.deepEqual(issues, [], `${row.restaurant_slug} schema: ${JSON.stringify(issues)}`)
  for (const banned of ["interactionStatistic", "aggregateRating", "transcript", "viewCount", "commentCount"]) {
    assert.equal(schemaJson.includes(`"${banned}"`), false, `${row.restaurant_slug} schema includes ${banned}`)
  }
  if (typeof row.view_count_snapshot === "number") {
    const snapshot = String(row.view_count_snapshot)
    assert.equal(
      new RegExp(`(?<!\\d)${snapshot}(?!\\d)`).test(schemaJson),
      false,
      `${row.restaurant_slug} schema repeats view snapshot ${snapshot}`
    )
  }
}

assert.equal(getYoutubeShort("djondjon")?.videoId, "ANqOrqlgg0E")
assert.equal(getYoutubeShort("dirt-candy")?.videoId, "pvkyueRt9-M")
assert.equal(getYoutubeShort("enzos-of-arthur-avenue")?.videoId, "S3s7eNR2HlE")
assert.equal(getYoutubeShort("awash")?.videoId, "Vj5uupbvyPs")
assert.equal(
  getYoutubeShort("awash")?.title,
  "Awash Cobble Hill: Is a Score of 13 Still Grade A? #nycfoodguide"
)
assert.equal(getYoutubeShort("awash")?.uploadDate, "2026-11-24")
assert.equal(getYoutubeShort("awash")?.duration, "PT32S")
assert.equal(getYoutubeShort("awash")?.embedUrl, "https://www.youtube-nocookie.com/embed/Vj5uupbvyPs")
assert.equal(getYoutubeShort("not-a-restaurant"), null)
const bloom = getYoutubeShort("bloom-cafe")
assert.equal(bloom?.videoId, "8mRDp2VpGCc")
assert.equal(bloom?.title, "Bloom Cafe Staten Island: What Score 10 Means #nycfoodguide")
assert.equal(bloom?.uploadDate, "2026-11-25")
assert.equal(bloom?.thumbnailUrl, "https://i.ytimg.com/vi/8mRDp2VpGCc/hqdefault.jpg")
assert.equal(bloom?.duration, undefined)
const bloomSchema = buildYoutubeShortVideoObject(bloom!, "https://www.eatrealfoodnyc.com/restaurants/bloom-cafe")
assert.equal(bloomSchema.name, bloom?.title)
assert.equal(bloomSchema.thumbnailUrl[0], "https://i.ytimg.com/vi/8mRDp2VpGCc/hqdefault.jpg")
assert.equal("duration" in bloomSchema, false)
assert.deepEqual(validateJsonLd([bloomSchema], ["VideoObject"]), [])
assert.equal(isoDuration(24), "PT24S")
assert.equal(isoDuration(60), "PT1M")
assert.equal(isoDuration(62), "PT1M2S")
assert.equal(getYoutubeShort("le-bernardin")?.duration, "PT1M2S")
assert.equal(getYoutubeShort("gramercy-tavern")?.duration, "PT19S")

function fixture(partial: {
  video_id: string
  restaurant_slug: string
  upload_date: string
  embed_priority: number
  view_count_snapshot?: number
}): YoutubeShortRow {
  return {
    video_id: partial.video_id,
    youtube_url: `https://www.youtube.com/shorts/${partial.video_id}`,
    title: `Title ${partial.video_id}`,
    upload_date: partial.upload_date,
    duration_sec: 24,
    series: "grade-a-daily",
    restaurant_slug: partial.restaurant_slug,
    restaurant_page: `https://www.eatrealfoodnyc.com/restaurants/${partial.restaurant_slug}`,
    embed_priority: partial.embed_priority,
    view_count_snapshot: partial.view_count_snapshot ?? null,
  }
}

const tied = [
  fixture({
    video_id: "aaaaaaaaaaa",
    restaurant_slug: "same-place",
    upload_date: "20260101",
    embed_priority: 10,
    view_count_snapshot: 9000,
  }),
  fixture({
    video_id: "bbbbbbbbbbb",
    restaurant_slug: "same-place",
    upload_date: "20260201",
    embed_priority: 10,
    view_count_snapshot: 1,
  }),
  fixture({
    video_id: "ccccccccccc",
    restaurant_slug: "same-place",
    upload_date: "20260301",
    embed_priority: 20,
    view_count_snapshot: 5000,
  }),
]
assert.equal(pickYoutubeShort(tied, "same-place")?.videoId, "bbbbbbbbbbb", "later upload wins a priority tie, not the view count")
assert.equal(pickYoutubeShort(tied, "missing"), null)

const priority = [
  fixture({ video_id: "ddddddddddd", restaurant_slug: "priority-place", upload_date: "20260501", embed_priority: 20 }),
  fixture({ video_id: "eeeeeeeeeee", restaurant_slug: "priority-place", upload_date: "20260101", embed_priority: 1 }),
]
assert.equal(pickYoutubeShort(priority, "priority-place")?.videoId, "eeeeeeeeeee", "lower embed_priority wins")

function renderShort(slug: string, name: string, inspectionDate: string | null) {
  return renderToStaticMarkup(
    <YoutubeShortEmbed slug={slug} restaurantName={name} inspectionDate={inspectionDate} />
  )
}

const djondjon = renderShort("djondjon", "DJONDJON", "10/21/2026")
assert.equal(djondjon.includes("<iframe"), false, "first paint has no YouTube iframe")
assert.equal((djondjon.match(/<iframe/g) ?? []).length, 0)
assert.equal((djondjon.match(/application\/ld\+json/g) ?? []).length, 1, "one VideoObject script")
assert.ok(djondjon.includes('data-video-id="ANqOrqlgg0E"'))
assert.ok(djondjon.includes("https://i.ytimg.com/vi/ANqOrqlgg0E/oardefault.jpg"))
assert.ok(djondjon.includes("https://www.youtube.com/shorts/ANqOrqlgg0E"))
assert.ok(djondjon.includes('aria-label="Play video: DJONDJON NYC Review | Grade A Haitian Restaurant Flatbush #nycfoodguide"'))
assert.ok(djondjon.includes('href="/restaurants/djondjon"'))
assert.ok(djondjon.includes('aria-current="page"'))
const djondjonIssues = [
  ...validateJsonLd(extractJsonLd(djondjon), ["VideoObject"]),
  ...validateVisibleHtml(djondjon, [
    "Official inspection date:",
    "October 21, 2026",
    "2026-10-21",
    "A grade is a sanitary score, not a taste score.",
    "Watch this Short on YouTube",
    "if the player does not load.",
    "DJONDJON listing",
  ]),
]
assert.deepEqual(djondjonIssues, [], JSON.stringify(djondjonIssues, null, 2))
assert.equal(djondjon.includes("127"), false, "the DJONDJON view snapshot is not rendered")

const dirt = renderShort("dirt-candy", "Dirt Candy", "11/12/2025")
assert.ok(dirt.includes('data-video-id="pvkyueRt9-M"'))
assert.ok(dirt.includes("November 12, 2025"))
assert.ok(dirt.includes("A grade is a sanitary score, not a taste score."))
assert.equal(dirt.includes("<iframe"), false)
assert.equal((dirt.match(/data-video-id=/g) ?? []).length, 1)
const dirtNodes = extractJsonLd(dirt)
assert.equal(dirtNodes.length, 1)
assert.equal(dirtNodes[0]["@type"], "VideoObject")
assert.equal(dirtNodes[0].name, "Dirt Candy NYC Review | Grade A Vegetarian Restaurant Lower East Side #nycfoodguide")
assert.equal(dirtNodes[0].uploadDate, "2026-11-23")
assert.equal(dirtNodes[0].duration, "PT24S")
assert.deepEqual(validateJsonLd(dirtNodes, ["VideoObject"]), [])

const awash = renderShort("awash", "Awash", "2026-09-16")
assert.equal(awash.includes("<iframe"), false, "Awash first paint has no YouTube iframe")
assert.equal((awash.match(/data-video-id=/g) ?? []).length, 1)
assert.ok(awash.includes('data-video-id="Vj5uupbvyPs"'))
assert.ok(awash.includes("https://www.youtube.com/shorts/Vj5uupbvyPs"))
assert.ok(awash.includes("September 16, 2026"))
assert.ok(awash.includes("A grade is a sanitary score, not a taste score."))
assert.ok(awash.includes("Watch this Short on YouTube"))
const awashNodes = extractJsonLd(awash)
assert.equal(awashNodes.length, 1)
assert.equal(awashNodes[0]["@type"], "VideoObject")
assert.equal(awashNodes[0].name, "Awash Cobble Hill: Is a Score of 13 Still Grade A? #nycfoodguide")
assert.equal(awashNodes[0].uploadDate, "2026-11-24")
assert.equal(awashNodes[0].duration, "PT32S")
assert.equal(awashNodes[0].embedUrl, "https://www.youtube-nocookie.com/embed/Vj5uupbvyPs")
assert.equal(JSON.stringify(awashNodes).includes("viewCount"), false)
assert.deepEqual(validateJsonLd(awashNodes, ["VideoObject"]), [])

assert.equal(renderShort("no-such-restaurant", "Nowhere", "1/2/2026"), "")
const undated = renderShort("djondjon", "DJONDJON", null)
assert.ok(undated.includes("Official inspection date: not on file."))
assert.ok(undated.includes("A grade is a sanitary score, not a taste score."))
assert.equal(undated.includes("<time"), false)

const invented = validateJsonLd(
  [
    {
      "@type": "VideoObject",
      name: "Example",
      thumbnailUrl: "https://i.ytimg.com/vi/ANqOrqlgg0E/hqdefault.jpg",
      uploadDate: "2026-11-17",
      duration: "PT24S",
      embedUrl: "https://www.youtube-nocookie.com/embed/ANqOrqlgg0E",
      interactionStatistic: { "@type": "InteractionCounter", userInteractionCount: 127 },
      aggregateRating: { "@type": "AggregateRating", ratingValue: 5, reviewCount: 1 },
      transcript: "invented",
    },
  ],
  ["VideoObject"]
)
assert.ok(invented.some((issue) => issue.message.includes("interactionStatistic")))
assert.ok(invented.some((issue) => issue.message.includes("aggregateRating")))
assert.ok(invented.some((issue) => issue.message.includes("transcript")))

const page = readFileSync("src/app/restaurants/[slug]/page.tsx", "utf8")
assert.match(page, /export const revalidate = 86400/)
assert.match(page, /export const dynamicParams = true/)
assert.match(page, /export function generateStaticParams\(\)[\s\S]*?return \[\]/)
assert.match(page, /<YoutubeShortEmbed/)
assert.doesNotMatch(page, /from "@\/lib\/db"|from "@\/lib\/youtube-shorts"/)
const loader = readFileSync("src/lib/listing-loader.ts", "utf8")
assert.match(loader, /isTransientConnectionError/)
assert.match(loader, /DEGRADED_REVALIDATE_SECONDS/)
const health = readFileSync("src/app/api/health/route.ts", "utf8")
assert.match(health, /export const dynamic = "force-dynamic"/)
const player = readFileSync("src/components/youtube-short-player.tsx", "utf8")
assert.match(player, /"use client"/)
assert.doesNotMatch(player, /youtube-shorts/)
const embed = readFileSync("src/components/youtube-short-embed.tsx", "utf8")
assert.doesNotMatch(embed, /"use client"/)
assert.doesNotMatch(embed, /prisma/)

console.log("youtube short embed tests passed")
