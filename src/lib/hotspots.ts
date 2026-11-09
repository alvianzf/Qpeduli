import { useQuery } from '@tanstack/react-query';
import api from './api';

export type HotspotRange = '24h' | '48h';

/** [lat, lon, frp (MW), confidence 1=nominal 2=high, acq_date, acq_time UTC HHMM] */
export type Hotspot = [number, number, number, number, string, string];

export interface HotspotData {
  source: string;
  range: HotspotRange;
  fetchedAt: string;
  count: number;
  points: Hotspot[];
  stale?: boolean;
}

/** Live NASA FIRMS detections via our backend. Refetched on mount, on window focus, and on demand. */
export function useHotspots(range: HotspotRange) {
  return useQuery({
    queryKey: ['hotspots', range],
    queryFn: async () => (await api.get<HotspotData>('/hotspots', { params: { range } })).data,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
