export function unwrapResponseData(responseData) {
  return responseData?.data || responseData;
}

export function extractTokens(responseData) {
  const data = unwrapResponseData(responseData);

  return {
    access: data?.access,
    refresh: data?.refresh,
  };
}

export function extractUser(responseData) {
  const data = unwrapResponseData(responseData);

  return data?.user || data?.profile || data;
}

export function getUserDisplayName(user) {
  return (
    user?.display_name ||
    user?.profile?.display_name ||
    user?.username ||
    user?.email ||
    "User"
  );
}

export function extractErrorMessage(error, fallbackMessage = "Something went wrong.") {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    const firstKey = Object.keys(detail)[0];
    const firstValue = detail[firstKey];

    if (Array.isArray(firstValue)) {
      return firstValue[0];
    }

    if (typeof firstValue === "string") {
      return firstValue;
    }
  }

  return fallbackMessage;
}