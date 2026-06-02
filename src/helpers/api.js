// Tolerant unwrapping for the various response shapes the backend uses:
//   { success, data: { items: [...], total, page, ... } }  ← paginated
//   { success, data: [...] }                               ← list
//   { success, data: { ... } }                             ← single
//   [ ... ]                                                ← legacy bare array
// plus the axios wrapper ({ data: <payload> }).
export const extractList = (axiosRes) => {
  if (!axiosRes) return [];
  // Caller may pass either the axios response or the payload directly.
  const payload =
    axiosRes && typeof axiosRes === "object" && "data" in axiosRes
      ? axiosRes.data
      : axiosRes;

  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;

  return [];
};

export const extractOne = (axiosRes) => {
  if (!axiosRes) return null;
  const payload =
    axiosRes && typeof axiosRes === "object" && "data" in axiosRes
      ? axiosRes.data
      : axiosRes;
  if (!payload) return null;
  if (payload.data !== undefined) return payload.data;
  return payload;
};

export const apiErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err) return fallback;
  const body = err.response?.data;
  return (
    body?.message ||
    body?.msg ||
    body?.error ||
    err.message ||
    fallback
  );
};

// Wrap an axios call so the caller always gets { items, error }.
// Never throws — always resolves.
export const safeFetchList = async (fn, ...args) => {
  try {
    const res = await fn(...args);
    return { items: extractList(res), error: null };
  } catch (err) {
    return { items: [], error: apiErrorMessage(err, "Could not load data") };
  }
};

// Pull the pagination meta ({ total, page, pageSize, pages }) out of a
// backend paginated response, regardless of axios/payload nesting.
export const extractMeta = (axiosRes) => {
  const empty = { total: 0, page: 1, pageSize: 0, pages: 1 };
  if (!axiosRes) return empty;
  const payload =
    axiosRes && typeof axiosRes === "object" && "data" in axiosRes
      ? axiosRes.data
      : axiosRes;
  // Unwrap the { success, data: {...} } envelope when present.
  const meta =
    payload && payload.data && typeof payload.data === "object"
      ? payload.data
      : payload;
  if (!meta || typeof meta !== "object") return empty;
  return {
    total: Number.isFinite(meta.total) ? meta.total : 0,
    page: Number.isFinite(meta.page) ? meta.page : 1,
    pageSize: Number.isFinite(meta.pageSize) ? meta.pageSize : 0,
    pages: Number.isFinite(meta.pages) ? Math.max(1, meta.pages) : 1,
  };
};

// Wrap an axios call for a paginated endpoint. Always resolves to
// { items, total, page, pages, pageSize, error }.
export const safeFetchPaginated = async (fn, ...args) => {
  try {
    const res = await fn(...args);
    return { items: extractList(res), ...extractMeta(res), error: null };
  } catch (err) {
    return {
      items: [],
      total: 0,
      page: 1,
      pages: 1,
      pageSize: 0,
      error: apiErrorMessage(err, "Could not load data"),
    };
  }
};
