import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { isRestaurantOpenNow, getDistanceMiles } from "@/lib/utils";

const EXCLUDED_FIELDS = [
  "email",
  "company_linkedin",
  "company_facebook",
  "company_instagram",
  "company_x",
  "street_view",
];

const SELECT_COLUMNS = {
  id: true,
  name: true,
  slug: true,
  type: true,
  borough: true,
  neighborhood: true,
  address: true,
  street: true,
  city: true,
  state: true,
  latitude: true,
  longitude: true,
  rating: true,
  reviews: true,
  price_range: true,
  dietary_tags: true,
  inspection_grade: true,
  inspection_date: true,
  inspection_score: true,
  description: true,
  phone: true,
  website: true,
  working_hours: true,
  photo: true,
  business_status: true,
  is_hidden_gem: true,
  created_at: true,
  updated_at: true,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const q = searchParams.get("q")?.trim() || "";
    const borough = searchParams.get("borough")?.trim() || "";
    const neighborhood = searchParams.get("neighborhood")?.trim() || "";
    const dietParams = searchParams.getAll("diet").filter(Boolean);
    const grade = searchParams.get("grade")?.trim() || "";
    const hiddenGem = searchParams.get("hidden_gem") === "true";
    const openNow = searchParams.get("open") === "true";
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : null;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : null;
    const radius = searchParams.get("radius") ? parseFloat(searchParams.get("radius")!) : 1.0;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") || "24", 10) || 24));
    const offset = (page - 1) * limit;

    // Geo-proximity search
    if (lat !== null && lng !== null) {
      return await handleGeoSearch({
        lat,
        lng,
        radius,
        borough,
        neighborhood,
        dietParams,
        grade,
        hiddenGem,
        openNow,
        page,
        limit,
        offset,
      });
    }

    if (q) {
      return await handleFullTextSearch({
        q,
        borough,
        neighborhood,
        dietParams,
        grade,
        hiddenGem,
        openNow,
        page,
        limit,
        offset,
      });
    }

    return await handleFilterSearch({
      borough,
      neighborhood,
      dietParams,
      grade,
      hiddenGem,
      openNow,
      page,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while processing your search." },
      { status: 500 }
    );
  }
}

interface SearchParams {
  q?: string;
  borough: string;
  neighborhood: string;
  dietParams: string[];
  grade: string;
  hiddenGem: boolean;
  openNow: boolean;
  page: number;
  limit: number;
  offset: number;
}

async function handleFullTextSearch(params: SearchParams) {
  const { q, borough, neighborhood, dietParams, grade, hiddenGem, openNow, limit, offset, page } = params;

  const conditions: string[] = ["business_status = 'OPERATIONAL'", "is_published = true"];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Full-text search condition
  conditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex})`);
  values.push(q);
  paramIndex++;

  if (borough) {
    conditions.push(`borough = $${paramIndex}`);
    values.push(borough);
    paramIndex++;
  }

  if (neighborhood) {
    conditions.push(`neighborhood = $${paramIndex}`);
    values.push(neighborhood);
    paramIndex++;
  }

  for (const diet of dietParams) {
    conditions.push(`dietary_tags ILIKE $${paramIndex}`);
    values.push(`%${diet}%`);
    paramIndex++;
  }

  if (grade) {
    conditions.push(`inspection_grade = $${paramIndex}`);
    values.push(grade);
    paramIndex++;
  }

  if (hiddenGem) {
    conditions.push(`is_hidden_gem = true`);
  }

  const whereClause = conditions.join(" AND ");

  const excludedCols = EXCLUDED_FIELDS.map((f) => `'${f}'`).join(", ");

  const countQuery = `SELECT COUNT(*) as count FROM restaurants WHERE ${whereClause}`;
  const dataQuery = `
    SELECT ${Object.keys(SELECT_COLUMNS).join(", ")},
           ts_rank(search_vector, plainto_tsquery('english', $1)) as search_rank
    FROM restaurants
    WHERE ${whereClause}
    ORDER BY search_rank DESC, rating DESC NULLS LAST
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  values.push(limit, offset);

  if (openNow) {
    // Fetch larger set and filter in app code
    const fetchLimit = Math.min(limit * 4, 200);
    const bigDataQuery = `
      SELECT ${Object.keys(SELECT_COLUMNS).join(", ")},
             ts_rank(search_vector, plainto_tsquery('english', $1)) as search_rank
      FROM restaurants
      WHERE ${whereClause}
      ORDER BY search_rank DESC, rating DESC NULLS LAST
      LIMIT $${paramIndex} OFFSET 0
    `;
    const bigValues = [...values.slice(0, -2), fetchLimit, 0];
    bigValues.pop(); // remove extra 0
    const allRows = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      bigDataQuery.replace(`OFFSET 0`, ``),
      ...values.slice(0, -2),
      fetchLimit
    );
    const serialized = serializeRows(allRows);
    const filtered = serialized.filter((r) => isRestaurantOpenNow(r.working_hours as string | null));
    const filteredTotal = filtered.length;
    const paged = filtered.slice(offset, offset + limit);
    return NextResponse.json({
      restaurants: paged,
      total: filteredTotal,
      page,
      totalPages: Math.ceil(filteredTotal / limit),
    });
  }

  const [countResult, restaurants] = await Promise.all([
    prisma.$queryRawUnsafe<[{ count: bigint }]>(countQuery, ...values.slice(0, -2)),
    prisma.$queryRawUnsafe<Record<string, unknown>[]>(dataQuery, ...values),
  ]);

  const total = Number(countResult[0].count);

  return NextResponse.json({
    restaurants: serializeRows(restaurants),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function handleFilterSearch(params: SearchParams) {
  const { borough, neighborhood, dietParams, grade, hiddenGem, openNow, page, limit, offset } = params;

  const where: Prisma.RestaurantWhereInput = {
    business_status: "OPERATIONAL",
    is_published: true,
  };

  if (borough) where.borough = borough;
  if (neighborhood) where.neighborhood = neighborhood;
  if (grade) where.inspection_grade = grade;
  if (hiddenGem) where.is_hidden_gem = true;

  if (dietParams.length > 0) {
    where.AND = dietParams.map((diet) => ({
      dietary_tags: { contains: diet, mode: "insensitive" as const },
    }));
  }

  if (openNow) {
    const fetchLimit = Math.min(limit * 4, 200);
    const allRestaurants = await prisma.restaurant.findMany({
      where,
      select: SELECT_COLUMNS,
      orderBy: { rating: { sort: "desc", nulls: "last" } },
      take: fetchLimit,
    });
    const filtered = allRestaurants.filter((r) =>
      isRestaurantOpenNow(r.working_hours)
    );
    const filteredTotal = filtered.length;
    const paged = filtered.slice(offset, offset + limit);
    return NextResponse.json({
      restaurants: paged,
      total: filteredTotal,
      page,
      totalPages: Math.ceil(filteredTotal / limit),
    });
  }

  const [total, restaurants] = await Promise.all([
    prisma.restaurant.count({ where }),
    prisma.restaurant.findMany({
      where,
      select: SELECT_COLUMNS,
      orderBy: { rating: { sort: "desc", nulls: "last" } },
      skip: offset,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    restaurants,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

async function handleGeoSearch(params: SearchParams & { lat: number; lng: number; radius: number }) {
  const { lat, lng, radius, borough, dietParams, grade, hiddenGem, openNow, page, limit, offset } = params;

  const where: Prisma.RestaurantWhereInput = {
    business_status: "OPERATIONAL",
    is_published: true,
    latitude: { not: null },
    longitude: { not: null },
  };

  if (borough) where.borough = borough;
  if (grade) where.inspection_grade = grade;
  if (hiddenGem) where.is_hidden_gem = true;

  if (dietParams.length > 0) {
    where.AND = dietParams.map((diet) => ({
      dietary_tags: { contains: diet, mode: "insensitive" as const },
    }));
  }

  const allRestaurants = await prisma.restaurant.findMany({
    where,
    select: SELECT_COLUMNS,
  });

  let withDistance = allRestaurants
    .map((r) => ({
      ...r,
      distance: getDistanceMiles(lat, lng, r.latitude!, r.longitude!),
    }))
    .filter((r) => r.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  if (openNow) {
    withDistance = withDistance.filter((r) => isRestaurantOpenNow(r.working_hours));
  }

  const total = withDistance.length;
  const results = withDistance.slice(offset, offset + limit);

  return NextResponse.json({
    restaurants: results.map((r) => ({
      ...r,
      distance: Math.round(r.distance * 100) / 100,
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    userLocation: { lat, lng },
  });
}

function serializeRows(rows: Record<string, unknown>[]) {
  return rows.map((row) => {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (EXCLUDED_FIELDS.includes(key) || key === "search_rank") continue;
      cleaned[key] = typeof value === "bigint" ? Number(value) : value;
    }
    return cleaned;
  });
}
