export function getPaginatedResults(data) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
}

export function getPaginationCount(data) {
  if (Array.isArray(data)) {
    return data.length;
  }

  return data?.count || 0;
}