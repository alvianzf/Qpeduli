import { createContext, useContext, useState, type ReactNode } from 'react';
import CreateThreadDialog from '../components/CreateThreadDialog';

interface CreateThreadContextValue {
  openCreateThread: () => void;
}

const CreateThreadContext = createContext<CreateThreadContextValue | null>(null);

export function CreateThreadProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <CreateThreadContext.Provider value={{ openCreateThread: () => setOpen(true) }}>
      {children}
      <CreateThreadDialog open={open} onClose={() => setOpen(false)} />
    </CreateThreadContext.Provider>
  );
}

export function useCreateThreadDialog() {
  const ctx = useContext(CreateThreadContext);
  if (!ctx) throw new Error('useCreateThreadDialog must be used within CreateThreadProvider');
  return ctx;
}
