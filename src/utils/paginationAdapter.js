// Normalizes paginated and non-paginated responses (including cursor pagination)
// Expected outputs:
// {
//   items: Array,
//   count: number | null,
//   next: string | null,
//   previous: string | null,
//   cursor: string | null
// }

export function adaptPagination(raw) {
  if (!raw) {
    return { items: [], count: 0, next: null, previous: null, cursor: null };
  }

  // Cursor style: { results, next, previous, count? } or { items, cursor }
  if (Array.isArray(raw.results)) {
    return {
      items: raw.results,
      count: typeof raw.count === 'number' ? raw.count : null,
      next: raw.next || null,
      previous: raw.previous || null,
      cursor: raw.next || null,
    };
  }

  if (Array.isArray(raw.items)) {
    return {
      items: raw.items,
      count: typeof raw.count === 'number' ? raw.count : null,
      next: raw.next || null,
      previous: raw.previous || null,
      cursor: raw.cursor || raw.next || null,
    };
  }

  // Non-paginated array
  if (Array.isArray(raw)) {
    return { items: raw, count: raw.length, next: null, previous: null, cursor: null };
  }

  // Single object -> treat as one-item list
  if (typeof raw === 'object') {
    return { items: [raw], count: 1, next: null, previous: null, cursor: null };
  }

  return { items: [], count: 0, next: null, previous: null, cursor: null };
}

export function buildCursorParams(params = {}, cursor) {
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qp.append(k, v);
  });
  if (cursor) qp.set('cursor', cursor);
  return qp.toString();
}


