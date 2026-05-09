import * as fs from "fs"
import * as path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })
dotenv.config({ path: path.join(process.cwd(), ".env") })

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { prisma } = require("../lib/db") as { prisma: import("@prisma/client").PrismaClient }

async function pullHealthGradeReport() {
  console.log("Building Health Grade Report dataset...\n")

  const PUBLISHED = { is_published: true, business_status: "OPERATIONAL" }

  // ── GLOBAL SUMMARY ────────────────────────────────────────────
  const totalRestaurants = await prisma.restaurant.count({ where: PUBLISHED })
  const totalGraded = await prisma.restaurant.count({
    where: { ...PUBLISHED, inspection_grade: { not: null } },
  })
  const totalGradeA = await prisma.restaurant.count({
    where: { ...PUBLISHED, inspection_grade: "A" },
  })
  const totalGradeB = await prisma.restaurant.count({
    where: { ...PUBLISHED, inspection_grade: "B" },
  })
  const totalGradeC = await prisma.restaurant.count({
    where: { ...PUBLISHED, inspection_grade: "C" },
  })

  // ── BY BOROUGH ────────────────────────────────────────────────
  const boroughs = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"]

  const boroughData = await Promise.all(
    boroughs.map(async (borough) => {
      const total = await prisma.restaurant.count({ where: { ...PUBLISHED, borough } })
      const graded = await prisma.restaurant.count({
        where: { ...PUBLISHED, borough, inspection_grade: { not: null } },
      })
      const gradeA = await prisma.restaurant.count({
        where: { ...PUBLISHED, borough, inspection_grade: "A" },
      })
      const gradeB = await prisma.restaurant.count({
        where: { ...PUBLISHED, borough, inspection_grade: "B" },
      })
      const gradeC = await prisma.restaurant.count({
        where: { ...PUBLISHED, borough, inspection_grade: "C" },
      })
      const avgScore = await prisma.restaurant.aggregate({
        where: { ...PUBLISHED, borough, inspection_score: { not: null } },
        _avg: { inspection_score: true },
      })
      const hiddenGems = await prisma.restaurant.count({
        where: { ...PUBLISHED, borough, is_hidden_gem: true },
      })

      return {
        borough,
        total,
        graded,
        gradedPct: total > 0 ? Math.round((graded / total) * 100) : 0,
        gradeA,
        gradeB,
        gradeC,
        gradeAPct: graded > 0 ? Math.round((gradeA / graded) * 100) : 0,
        gradeBPct: graded > 0 ? Math.round((gradeB / graded) * 100) : 0,
        gradeCPct: graded > 0 ? Math.round((gradeC / graded) * 100) : 0,
        gradeAOfTotal: total > 0 ? Math.round((gradeA / total) * 100) : 0,
        avgInspectionScore: avgScore._avg.inspection_score
          ? Math.round(avgScore._avg.inspection_score * 10) / 10
          : null,
        hiddenGems,
      }
    })
  )

  // ── NEIGHBORHOOD GRADE DATA ──────────────────────────────────
  const neighborhoodTotals = await prisma.restaurant.groupBy({
    by: ["neighborhood", "borough"],
    where: { ...PUBLISHED, neighborhood: { not: null }, borough: { not: null } },
    _count: { id: true },
  })

  const neighborhoodGradeA = await prisma.restaurant.groupBy({
    by: ["neighborhood"],
    where: { ...PUBLISHED, inspection_grade: "A", neighborhood: { not: null } },
    _count: { id: true },
  })
  const neighborhoodGradeB = await prisma.restaurant.groupBy({
    by: ["neighborhood"],
    where: { ...PUBLISHED, inspection_grade: "B", neighborhood: { not: null } },
    _count: { id: true },
  })
  const neighborhoodGradeC = await prisma.restaurant.groupBy({
    by: ["neighborhood"],
    where: { ...PUBLISHED, inspection_grade: "C", neighborhood: { not: null } },
    _count: { id: true },
  })

  const gradeAMap: Record<string, number> = {}
  neighborhoodGradeA.forEach((n) => {
    if (n.neighborhood) gradeAMap[n.neighborhood] = n._count.id
  })
  const gradeBMap: Record<string, number> = {}
  neighborhoodGradeB.forEach((n) => {
    if (n.neighborhood) gradeBMap[n.neighborhood] = n._count.id
  })
  const gradeCMap: Record<string, number> = {}
  neighborhoodGradeC.forEach((n) => {
    if (n.neighborhood) gradeCMap[n.neighborhood] = n._count.id
  })

  const neighborhoodStats = neighborhoodTotals
    .filter((n) => n._count.id >= 10)
    .map((n) => {
      const total = n._count.id
      const gradeA = gradeAMap[n.neighborhood!] || 0
      const gradeB = gradeBMap[n.neighborhood!] || 0
      const gradeC = gradeCMap[n.neighborhood!] || 0
      const graded = gradeA + gradeB + gradeC
      return {
        neighborhood: n.neighborhood!,
        borough: n.borough!,
        total,
        gradeA,
        gradeB,
        gradeC,
        graded,
        gradeAPct: graded > 0 ? Math.round((gradeA / graded) * 100) : 0,
        gradeBPct: graded > 0 ? Math.round((gradeB / graded) * 100) : 0,
        gradeCPct: graded > 0 ? Math.round((gradeC / graded) * 100) : 0,
        gradeAOfTotal: total > 0 ? Math.round((gradeA / total) * 100) : 0,
      }
    })
    .filter((n) => n.graded >= 5)

  const topByGradeA = [...neighborhoodStats]
    .sort((a, b) => b.gradeAPct - a.gradeAPct)
    .slice(0, 15)

  const bottomByGradeA = [...neighborhoodStats]
    .sort((a, b) => a.gradeAPct - b.gradeAPct)
    .slice(0, 10)

  // ── BY RESTAURANT TYPE ────────────────────────────────────────
  const typeGroups = await prisma.restaurant.groupBy({
    by: ["type"],
    where: { ...PUBLISHED, type: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 20,
  })

  const typeStats = await Promise.all(
    typeGroups
      .filter((t) => t._count.id >= 10)
      .slice(0, 15)
      .map(async (t) => {
        const gradeA = await prisma.restaurant.count({
          where: { ...PUBLISHED, type: t.type, inspection_grade: "A" },
        })
        const graded = await prisma.restaurant.count({
          where: { ...PUBLISHED, type: t.type, inspection_grade: { not: null } },
        })
        return {
          type: t.type!,
          total: t._count.id,
          gradeA,
          graded,
          gradeAPct: graded > 0 ? Math.round((gradeA / graded) * 100) : 0,
        }
      })
  )

  const typeSorted = typeStats
    .filter((t) => t.graded >= 5)
    .sort((a, b) => b.gradeAPct - a.gradeAPct)

  // ── KEY FINDINGS ──────────────────────────────────────────────
  const topBorough = [...boroughData].sort((a, b) => b.gradeAPct - a.gradeAPct)[0]
  const bottomBorough = [...boroughData].sort((a, b) => a.gradeAPct - b.gradeAPct)[0]
  const topNeighborhood = topByGradeA[0]
  const bottomNeighborhood = bottomByGradeA[0]
  const gradeACoverage =
    totalRestaurants > 0 ? Math.round((totalGradeA / totalRestaurants) * 100) : 0
  const overallGradeAPct =
    totalGraded > 0 ? Math.round((totalGradeA / totalGraded) * 100) : 0

  const report = {
    generatedAt: new Date().toISOString(),
    reportDate: "May 2026",
    summary: {
      totalRestaurants,
      totalGraded,
      gradedPct: totalRestaurants > 0 ? Math.round((totalGraded / totalRestaurants) * 100) : 0,
      totalGradeA,
      totalGradeB,
      totalGradeC,
      gradeACoverage,
      overallGradeAPct,
      overallGradeBPct: totalGraded > 0 ? Math.round((totalGradeB / totalGraded) * 100) : 0,
      overallGradeCPct: totalGraded > 0 ? Math.round((totalGradeC / totalGraded) * 100) : 0,
    },
    byBorough: boroughData,
    neighborhoods: {
      topByGradeA,
      bottomByGradeA,
      totalAnalyzed: neighborhoodStats.length,
    },
    byType: typeSorted,
    keyFindings: {
      topBorough: topBorough.borough,
      topBoroughGradeAPct: topBorough.gradeAPct,
      bottomBorough: bottomBorough.borough,
      bottomBoroughGradeAPct: bottomBorough.gradeAPct,
      topNeighborhood: topNeighborhood?.neighborhood ?? null,
      topNeighborhoodBorough: topNeighborhood?.borough ?? null,
      topNeighborhoodGradeAPct: topNeighborhood?.gradeAPct ?? 0,
      bottomNeighborhood: bottomNeighborhood?.neighborhood ?? null,
      bottomNeighborhoodGradeAPct: bottomNeighborhood?.gradeAPct ?? 0,
    },
  }

  const outputPath = path.join(process.cwd(), "src/data/health-grade-report.json")
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))

  console.log("=== HEALTH GRADE REPORT SUMMARY ===\n")
  console.log(`Total restaurants: ${totalRestaurants.toLocaleString()}`)
  console.log(`Total graded: ${totalGraded.toLocaleString()} (${report.summary.gradedPct}%)`)
  console.log(`Grade A: ${totalGradeA.toLocaleString()} (${overallGradeAPct}% of graded)`)
  console.log(`Grade B: ${totalGradeB.toLocaleString()}`)
  console.log(`Grade C: ${totalGradeC.toLocaleString()}`)
  console.log(`\nBy borough (Grade A % of graded):`)
  ;[...boroughData]
    .sort((a, b) => b.gradeAPct - a.gradeAPct)
    .forEach((b) =>
      console.log(`  ${b.borough}: ${b.gradeAPct}% (${b.gradeA} of ${b.graded} graded)`)
    )
  console.log(`\nTop 5 neighborhoods by Grade A rate:`)
  topByGradeA.slice(0, 5).forEach((n, i) =>
    console.log(`  ${i + 1}. ${n.neighborhood}, ${n.borough}: ${n.gradeAPct}%`)
  )
  console.log(`\nBottom 5 neighborhoods by Grade A rate:`)
  bottomByGradeA.slice(0, 5).forEach((n, i) =>
    console.log(`  ${i + 1}. ${n.neighborhood}, ${n.borough}: ${n.gradeAPct}%`)
  )
  console.log(`\nTop 5 restaurant types by Grade A rate:`)
  typeSorted.slice(0, 5).forEach((t, i) =>
    console.log(`  ${i + 1}. ${t.type}: ${t.gradeAPct}%`)
  )
  console.log(`\n✅ Report written to src/data/health-grade-report.json`)

  await prisma.$disconnect()
}

pullHealthGradeReport().catch((err) => {
  console.error(err)
  process.exit(1)
})
