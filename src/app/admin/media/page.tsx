import React from 'react';
import Link from 'next/link';
import { MediaLibrary } from '@/components/admin/MediaLibrary';
import { ArrowLeft } from 'lucide-react';

export default function AdminMediaPage() {
  return (
    <div className="space-y-6 font-serif">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Studio</span>
        </Link>
      </div>

      <MediaLibrary />
    </div>
  );
}
