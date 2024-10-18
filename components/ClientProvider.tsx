'use client';

import { UserProvider } from '@/contexts/UserContext';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
