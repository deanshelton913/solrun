/**
 * How long the weather API response is considered fresh (server and client).
 * Client revalidates only after this window so we don't refetch while backend cache is still valid.
 */
export const WEATHER_CACHE_STALE_SECONDS = 60 * 60; // 1 hour

export const WEATHER_CACHE_STALE_MS = WEATHER_CACHE_STALE_SECONDS * 1000;
