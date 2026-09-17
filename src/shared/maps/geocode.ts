export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export async function geocodeAddress(query: string): Promise<GeoPoint | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'rn-store-bazaar/1.0',
    },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as Array<{ lat?: string; lon?: string }>;
  const hit = data[0];
  const latitude = Number(hit?.lat);
  const longitude = Number(hit?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

export function formatCoords(point: GeoPoint): string {
  return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
}

export const BENGALURU: GeoPoint = {
  latitude: 12.9716,
  longitude: 77.5946,
};
