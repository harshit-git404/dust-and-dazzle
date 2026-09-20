import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { getSiteSettingsAction } from '@/app/actions/settings';
import { PrintBookManager } from '@/components/admin/PrintBookManager';
import { Story } from '@/types/story';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Print-Ready Book Export — Author Studio',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBookPage() {
  const supabase = await createClient();
  const settings = await getSiteSettingsAction();

  const { data: stories } = await supabase
    .from('stories')
    .select('*')
    .order('order_index', { ascending: true });

  const allStories: Story[] = (stories as Story[]) || [];

  return <PrintBookManager allStories={allStories} settings={settings} />;
}
