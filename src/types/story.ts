export type StoryVisibility = 'draft' | 'published' | 'private';

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  chapter_label: string;
  order_index: number;
  year?: string | null;
  visibility: StoryVisibility;
  reading_time: string;
  excerpt: string;
  content_html: string;
  content_json?: Record<string, unknown> | null;
  cover_image_url?: string | null;
  image_caption?: string | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  story_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}
