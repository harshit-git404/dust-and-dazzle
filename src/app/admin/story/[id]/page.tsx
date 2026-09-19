import React from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { Story } from '@/types/story';

interface EditStoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from('stories')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !story) {
    notFound();
  }

  return <TiptapEditor story={story as Story} />;
}
