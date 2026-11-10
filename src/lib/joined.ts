/** "Bergabung Mar 2025" style label for a join date. */
export const joinedLabel = (iso?: string | null) =>
  iso ? `Bergabung ${new Date(iso).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}` : '';
