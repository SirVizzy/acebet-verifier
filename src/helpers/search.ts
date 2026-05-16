export const getSearchParams = () => {
  return new URLSearchParams(window.location.search);
};

export const getSearchParamFromPayload = (key: string) => {
  const params = getSearchParams();
  const payload = params.get('payload');
  
  if (payload) {
    try {
      const parsedPayload = JSON.parse(payload);
      if (key in (parsedPayload.options ?? {})) {
        return parsedPayload.options[key] ?? undefined;
      }

      return parsedPayload[key] ?? undefined;
    } catch (e) {
      console.error('Failed to parse payload:', e);
      return undefined;
    }
  }
  
  return params.get(key) ?? undefined;
};
