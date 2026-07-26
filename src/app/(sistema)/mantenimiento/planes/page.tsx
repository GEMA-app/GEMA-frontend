'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PlanesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mantenimiento?vista=planes');
  }, [router]);

  return (
    <div className="p-8 text-center text-sm font-medium text-gema-primary/50 dark:text-white/50">
      Cargando planes...
    </div>
  );
}


