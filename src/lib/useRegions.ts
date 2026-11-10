import { useMemo } from 'react';
import { useThreads, useModalUsahaList } from './queries';
import { userCache } from './adapters';
import { areaOf } from '../data/areas';
import type { Thread, ModalUsaha } from '../types';

/** Campaigns grouped by province (Kepri, Riau, Sumbar, Jambi). Modal Usaha by its city, Aksi threads by the campaign's city. */
export function useRegions() {
  const { data: threads = [], isLoading: l1 } = useThreads({ filter: 'aksi' });
  const { data: projects = [], isLoading: l2 } = useModalUsahaList();

  const grouped = useMemo(() => {
    const byArea: Record<string, { projects: ModalUsaha[]; threads: Thread[] }> = {};
    const slot = (id: string) => (byArea[id] ??= { projects: [], threads: [] });
    for (const p of projects) {
      const a = areaOf(p.city) ?? areaOf(userCache[p.ownerId]?.city);
      if (a) slot(a.id).projects.push(p);
    }
    for (const t of threads) {
      if (!t.campaign) continue;
      const a = areaOf(t.campaign.city) ?? areaOf(userCache[t.authorId]?.city);
      if (a) slot(a.id).threads.push(t);
    }
    const counts: Record<string, number> = {};
    for (const [id, v] of Object.entries(byArea)) counts[id] = v.projects.length + v.threads.length;
    return { byArea, counts };
  }, [threads, projects]);

  return { ...grouped, isLoading: l1 || l2 };
}
