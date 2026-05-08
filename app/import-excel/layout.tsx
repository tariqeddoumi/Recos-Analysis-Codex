import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';

export default function ImportExcelLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
