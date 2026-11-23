/**
 * In-memory evaluator for the read-only Prisma queries the public pages use.
 *
 * When Postgres is out of connections, db.ts loads the rows through the
 * Supabase HTTP API (see rest-snapshot.ts) and answers the same Prisma call
 * here, so hubs, guides, and listings render the same content instead of a
 * 500. Semantics follow Postgres where they matter for page output:
 * ASC sorts NULLS LAST and DESC sorts NULLS FIRST unless `nulls` is given,
 * `contains` is case-sensitive unless `mode: "insensitive"`, `_count` on a
 * field counts non-null values, and `_avg` skips nulls.
 *
 * Anything outside the supported subset throws UnsupportedFallbackError so the
 * caller rethrows the original database error instead of guessing.
 */
export type Row = Record<string | symbol, unknown>
const GROUP_ROWS = Symbol("groupRows")
type Args = Record<string, unknown> | undefined

export class UnsupportedFallbackError extends Error {
  constructor(detail: string) {
    super(`fallback engine does not support ${detail}`)
    this.name = "UnsupportedFallbackError"
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date)
}

function comparable(value: unknown): unknown {
  return value instanceof Date ? value.getTime() : value
}

function equal(a: unknown, b: unknown): boolean {
  return comparable(a) === comparable(b)
}

/** Close to Postgres en_US.UTF-8 ordering for names and neighbourhoods. */
const COLLATOR = new Intl.Collator("en-US")

function compareValues(a: unknown, b: unknown): number {
  const x = comparable(a)
  const y = comparable(b)
  if (typeof x === "number" && typeof y === "number") return x - y
  if (typeof x === "boolean" && typeof y === "boolean") return Number(x) - Number(y)
  return COLLATOR.compare(String(x), String(y))
}

const FILTER_KEYS = new Set([
  "equals", "not", "in", "notIn", "lt", "lte", "gt", "gte", "contains", "startsWith", "endsWith", "mode",
])

function matchesFilter(value: unknown, filter: unknown): boolean {
  if (!isPlainObject(filter)) {
    if (filter === null) return value === null || value === undefined
    return equal(value, filter)
  }
  for (const key of Object.keys(filter)) {
    if (!FILTER_KEYS.has(key)) throw new UnsupportedFallbackError(`filter operator ${key}`)
  }
  const insensitive = filter.mode === "insensitive"
  const text = (input: unknown) => (insensitive ? String(input).toLowerCase() : String(input))
  for (const [op, operand] of Object.entries(filter)) {
    if (op === "mode" || operand === undefined) continue
    const missing = value === null || value === undefined
    switch (op) {
      case "equals":
        if (!matchesFilter(value, operand)) return false
        break
      case "not":
        if (operand === null) {
          if (missing) return false
        } else if (isPlainObject(operand)) {
          if (missing || matchesFilter(value, operand)) return false
        } else if (missing || equal(value, operand)) {
          return false
        }
        break
      case "in":
        if (missing || !(operand as unknown[]).some((item) => equal(value, item))) return false
        break
      case "notIn":
        if (missing || (operand as unknown[]).some((item) => equal(value, item))) return false
        break
      case "lt":
        if (missing || compareValues(value, operand) >= 0) return false
        break
      case "lte":
        if (missing || compareValues(value, operand) > 0) return false
        break
      case "gt":
        if (missing || compareValues(value, operand) <= 0) return false
        break
      case "gte":
        if (missing || compareValues(value, operand) < 0) return false
        break
      case "contains":
        if (missing || !text(value).includes(text(operand))) return false
        break
      case "startsWith":
        if (missing || !text(value).startsWith(text(operand))) return false
        break
      case "endsWith":
        if (missing || !text(value).endsWith(text(operand))) return false
        break
    }
  }
  return true
}

export function matchesWhere(row: Row, where: unknown): boolean {
  if (where === undefined || where === null) return true
  if (!isPlainObject(where)) throw new UnsupportedFallbackError("a non-object where")
  for (const [key, condition] of Object.entries(where)) {
    if (condition === undefined) continue
    if (key === "AND") {
      const list = Array.isArray(condition) ? condition : [condition]
      if (!list.every((part) => matchesWhere(row, part))) return false
    } else if (key === "OR") {
      const list = condition as unknown[]
      if (!list.some((part) => matchesWhere(row, part))) return false
    } else if (key === "NOT") {
      const list = Array.isArray(condition) ? condition : [condition]
      if (list.some((part) => matchesWhere(row, part))) return false
    } else if (!matchesFilter(row[key], condition)) {
      return false
    }
  }
  return true
}

type SortKey = { get: (row: Row) => unknown; desc: boolean; nullsFirst: boolean }

function sortKeys(orderBy: unknown, resolve: (field: string, row: Row) => unknown): SortKey[] {
  if (orderBy === undefined) return []
  const list = Array.isArray(orderBy) ? orderBy : [orderBy]
  const keys: SortKey[] = []
  for (const entry of list) {
    if (!isPlainObject(entry)) throw new UnsupportedFallbackError("orderBy shape")
    for (const [field, spec] of Object.entries(entry)) {
      if (spec === undefined) continue
      if (field.startsWith("_")) {
        // groupBy aggregate ordering: { _count: { id: "desc" } }
        if (!isPlainObject(spec)) throw new UnsupportedFallbackError(`orderBy ${field}`)
        for (const [inner, direction] of Object.entries(spec)) {
          const desc = direction === "desc"
          keys.push({
            get: (row) => {
              const groupRows = row[GROUP_ROWS] as Row[] | undefined
              if (groupRows) return (aggregateFields(groupRows, { [field]: { [inner]: true } })[field] as Row)[inner]
              return (row[field] as Row | undefined)?.[inner]
            },
            desc,
            nullsFirst: desc,
          })
        }
        continue
      }
      let desc: boolean
      let nullsFirst: boolean
      if (typeof spec === "string") {
        desc = spec === "desc"
        nullsFirst = desc
      } else if (isPlainObject(spec) && typeof spec.sort === "string") {
        desc = spec.sort === "desc"
        nullsFirst = spec.nulls ? spec.nulls === "first" : desc
      } else {
        throw new UnsupportedFallbackError(`orderBy ${field}`)
      }
      keys.push({ get: (row) => resolve(field, row), desc, nullsFirst })
    }
  }
  return keys
}

function sortRows(rows: Row[], keys: SortKey[]): Row[] {
  if (keys.length === 0) return rows
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      for (const key of keys) {
        const x = key.get(a.row)
        const y = key.get(b.row)
        const xNull = x === null || x === undefined
        const yNull = y === null || y === undefined
        if (xNull || yNull) {
          if (xNull && yNull) continue
          return xNull === key.nullsFirst ? -1 : 1
        }
        const diff = compareValues(x, y)
        if (diff !== 0) return key.desc ? -diff : diff
      }
      return a.index - b.index
    })
    .map((entry) => entry.row)
}

function page(rows: Row[], args: Args): Row[] {
  if (args?.cursor !== undefined) throw new UnsupportedFallbackError("cursor pagination")
  const skip = typeof args?.skip === "number" ? args.skip : 0
  const take = args?.take
  if (typeof take === "number" && take < 0) throw new UnsupportedFallbackError("negative take")
  return typeof take === "number" ? rows.slice(skip, skip + take) : rows.slice(skip)
}

function distinctRows(rows: Row[], distinct: unknown): Row[] {
  if (distinct === undefined) return rows
  const fields = Array.isArray(distinct) ? (distinct as string[]) : [distinct as string]
  const seen = new Set<string>()
  return rows.filter((row) => {
    const key = JSON.stringify(fields.map((field) => comparable(row[field])))
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function project(row: Row, args: Args, defaultOmit: readonly string[]): Row {
  const select = args?.select
  if (isPlainObject(select)) {
    const out: Row = {}
    for (const [field, on] of Object.entries(select)) {
      if (on === true) out[field] = row[field]
      else if (on) throw new UnsupportedFallbackError(`nested select ${field}`)
    }
    return out
  }
  if (args?.include) throw new UnsupportedFallbackError("include")
  const omit = new Set(defaultOmit)
  if (isPlainObject(args?.omit)) {
    for (const [field, on] of Object.entries(args.omit)) {
      if (on) omit.add(field)
      else omit.delete(field)
    }
  }
  const out: Row = {}
  for (const [field, value] of Object.entries(row)) if (!omit.has(field)) out[field] = value
  return out
}

function aggregateFields(rows: Row[], args: Args): Row {
  const out: Row = {}
  for (const op of ["_count", "_avg", "_sum", "_min", "_max"] as const) {
    const spec = args?.[op]
    if (spec === undefined) continue
    if (op === "_count" && spec === true) {
      out._count = rows.length
      continue
    }
    if (!isPlainObject(spec)) throw new UnsupportedFallbackError(`${op} shape`)
    const result: Row = {}
    for (const [field, on] of Object.entries(spec)) {
      if (!on) continue
      if (op === "_count") {
        result[field] = field === "_all" ? rows.length : rows.filter((row) => row[field] != null).length
        continue
      }
      const values = rows.map((row) => row[field]).filter((value) => value !== null && value !== undefined)
      if (op === "_avg" || op === "_sum") {
        const numbers = values.map(Number)
        const sum = numbers.reduce((total, value) => total + value, 0)
        result[field] = numbers.length === 0 ? null : op === "_sum" ? sum : sum / numbers.length
      } else {
        const sorted = [...values].sort(compareValues)
        result[field] = sorted.length === 0 ? null : op === "_min" ? sorted[0] : sorted[sorted.length - 1]
      }
    }
    out[op] = result
  }
  return out
}

function matchesHaving(group: Row, groupRows: Row[], having: unknown): boolean {
  if (having === undefined) return true
  if (!isPlainObject(having)) throw new UnsupportedFallbackError("having shape")
  for (const [field, spec] of Object.entries(having)) {
    if (field === "AND" || field === "OR" || field === "NOT") throw new UnsupportedFallbackError(`having ${field}`)
    if (!isPlainObject(spec)) {
      if (!matchesFilter(group[field], spec)) return false
      continue
    }
    for (const [op, filter] of Object.entries(spec)) {
      if (!op.startsWith("_")) {
        if (!matchesFilter(group[field], { [op]: filter })) return false
        continue
      }
      const value = (aggregateFields(groupRows, { [op]: { [field]: true } })[op] as Row)[field]
      if (!matchesFilter(value, filter)) return false
    }
  }
  return true
}

export interface ModelSpec {
  /** Fields Prisma leaves out of default selects (client-level omit). */
  defaultOmit: readonly string[]
}

const READ_OPERATIONS = new Set([
  "findMany", "findFirst", "findFirstOrThrow", "findUnique", "findUniqueOrThrow", "count", "aggregate", "groupBy",
])

export function isFallbackReadOperation(operation: string): boolean {
  return READ_OPERATIONS.has(operation)
}

function notFound(): Error {
  return Object.assign(new Error("No record was found for a query."), {
    name: "PrismaClientKnownRequestError",
    code: "P2025",
  })
}

export function runFallbackQuery(rows: Row[], operation: string, args: Args, spec: ModelSpec): unknown {
  const where = args?.where
  const filtered = rows.filter((row) => matchesWhere(row, where))
  const resolve = (field: string, row: Row) => row[field]

  switch (operation) {
    case "findMany": {
      const sorted = sortRows(filtered, sortKeys(args?.orderBy, resolve))
      return page(distinctRows(sorted, args?.distinct), args).map((row) => project(row, args, spec.defaultOmit))
    }
    case "findFirst":
    case "findFirstOrThrow":
    case "findUnique":
    case "findUniqueOrThrow": {
      const sorted = sortRows(filtered, sortKeys(args?.orderBy, resolve))
      const first = page(distinctRows(sorted, args?.distinct), { ...args, take: 1 })[0]
      if (!first) {
        if (operation.endsWith("OrThrow")) throw notFound()
        return null
      }
      return project(first, args, spec.defaultOmit)
    }
    case "count": {
      const counted = page(filtered, args)
      const select = args?.select
      if (isPlainObject(select)) {
        const out: Row = {}
        for (const [field, on] of Object.entries(select)) {
          if (on) out[field] = field === "_all" ? counted.length : counted.filter((row) => row[field] != null).length
        }
        return out
      }
      return counted.length
    }
    case "aggregate": {
      const sorted = sortRows(filtered, sortKeys(args?.orderBy, resolve))
      return aggregateFields(page(sorted, args), args)
    }
    case "groupBy": {
      const by = (Array.isArray(args?.by) ? args.by : [args?.by]) as string[]
      const groups = new Map<string, { key: Row; rows: Row[] }>()
      for (const row of filtered) {
        const id = JSON.stringify(by.map((field) => comparable(row[field])))
        let group = groups.get(id)
        if (!group) {
          group = { key: Object.fromEntries(by.map((field) => [field, row[field]])), rows: [] }
          groups.set(id, group)
        }
        group.rows.push(row)
      }
      const results: Row[] = []
      for (const group of groups.values()) {
        if (!matchesHaving(group.key, group.rows, args?.having)) continue
        results.push({ ...group.key, ...aggregateFields(group.rows, args), [GROUP_ROWS]: group.rows })
      }
      return page(sortRows(results, sortKeys(args?.orderBy, resolve)), args).map((row) => {
        const { [GROUP_ROWS]: _rows, ...rest } = row
        return rest
      })
    }
    default:
      throw new UnsupportedFallbackError(`operation ${operation}`)
  }
}
