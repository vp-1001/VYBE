const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();

export const apiUrl = (path: string): string => {
  if (!configuredApiBaseUrl) {
    return path;
  }

  return `${configuredApiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};
