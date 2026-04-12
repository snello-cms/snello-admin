import * as L from 'leaflet';

export const DEFAULT_MAP_CENTER: L.LatLngTuple = [45.4642, 9.19];

export function addBaseTileLayer(map: L.Map): L.TileLayer {
  return L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
    crossOrigin: true,
    referrerPolicy: 'strict-origin-when-cross-origin'
  }).addTo(map);
}

export const LEAFLET_DEFAULT_ICON = L.icon({
  iconRetinaUrl: '/maps/marker-icon-2x.png',
  iconUrl: '/maps/marker-icon.png',
  shadowUrl: '/maps/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

export type AddressSearchResult = {
  label: string;
  lat: number;
  lng: number;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export function formatPoint(lat: number, lng: number): string {
  return `${lat}, ${lng}`;
}

export function parsePoint(value: string | null | undefined): L.LatLngTuple | null {
  if (!value) {
    return null;
  }

  const [lat, lng] = value.split(',').map((part) => Number(part.trim()));
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
}

export function splitPath(value: string | null | undefined): string[] {
  return value
    ? value
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

export async function searchNominatim(query: string, limit = 5): Promise<AddressSearchResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=${limit}&q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Search failed with status ${response.status}`);
  }

  const data = (await response.json()) as NominatimResult[];

  return data
    .map((item) => ({
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon)
    }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));
}
