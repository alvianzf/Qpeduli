import { useMemo } from 'react';
import { useThreads, useModalUsahaList } from './queries';
import { userCache } from './adapters';
import { provinceOf } from '../data/regions';
import type { Thread, ModalUsaha } from '../types';

/** Campaigns grouped by province: Modal Usaha by its city, Aksi threads by the author's city. */
export function useRegions() {
  const { data: threads = [], isLoading: l1 } = useThreads({ filter: 'aksi' });
  const { data: projects = [], isLoading: l2 } = useModalUsahaList();

  const grouped = useMemo(() => {
    const byProvince: Record<string, { projects: ModalUsaha[]; threads: Thread[] }> = {};
    const slot = (id: string) => (byProvince[id] ??= { projects: [], threads: [] });
    for (const p of projects) {
      const id = provinceOf(p.city) ?? provinceOf(userCache[p.ownerId]?.city);
      if (id) slot(id).projects.push(p);
    }
    for (const t of threads) {
      if (!t.campaign) continue;
      const id = provinceOf(userCache[t.authorId]?.city);
      if (id) slot(id).threads.push(t);
    }
    const counts: Record<string, number> = {};
    for (const [id, v] of Object.entries(byProvince)) counts[id] = v.projects.length + v.threads.length;
    return { byProvince, counts };
  }, [threads, projects]);

  return { ...grouped, isLoading: l1 || l2 };
}
