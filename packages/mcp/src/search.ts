import type { CatalogEntry } from "./registry"

/**
 * Small, dependency-free relevance ranking over the catalog. Good enough for a
 * few hundred items; name matches outrank category and summary matches.
 */
export function searchCatalog(
  items: CatalogEntry[],
  query: string,
  limit = 10
) {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1)

  if (terms.length === 0) return items.slice(0, limit)

  return items
    .map((item) => {
      const name = item.name.toLowerCase()
      const summary = (item.summary ?? "").toLowerCase()
      const categories = (item.categories ?? []).join(" ").toLowerCase()
      let score = 0
      for (const term of terms) {
        if (name === term) score += 10
        else if (name.includes(term)) score += 6
        if (categories.includes(term)) score += 3
        if (summary.includes(term)) score += 2
      }
      return { item, score }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map((result) => result.item)
}

function editDistance(a: string, b: string) {
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index)
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0]!
    previous[0] = i
    for (let j = 1; j <= b.length; j++) {
      const above = previous[j]!
      previous[j] = Math.min(
        above + 1,
        previous[j - 1]! + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
      diagonal = above
    }
  }
  return previous[b.length]!
}

/** Names close to a misspelled one, closest first. */
export function closestNames(items: CatalogEntry[], name: string, limit = 3) {
  const target = name.toLowerCase()
  return items
    .map((item) => ({
      name: item.name,
      distance: editDistance(target, item.name),
    }))
    .filter(
      (candidate) =>
        candidate.distance <= Math.max(2, Math.floor(target.length / 3)) ||
        candidate.name.includes(target)
    )
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map((candidate) => candidate.name)
}
