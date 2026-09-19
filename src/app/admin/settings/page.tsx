import React from 'react';
import Link from 'next/link';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';
import { ArrowLeft, Settings, Sparkles } from 'lucide-react';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAction();

  return (
    <div className="space-y-6 font-serif">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--color-terracotta)] hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Author Studio</span>
        </Link>
        <h2 className="text-xl font-normal text-[var(--text-primary)] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--color-terracotta)]" />
          <span>About the Collection &amp; Author Settings</span>
        </h2>
        <p className="text-xs italic text-[var(--text-secondary)] mt-0.5">
          Customize the dedication inscription, biographical note, and author portrait.
        </p>
      </div>

      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}
