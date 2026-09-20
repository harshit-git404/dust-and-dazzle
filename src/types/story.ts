export type StoryVisibility = 'draft' | 'published' | 'private';

export interface StoryPhoto {
  url: string;
  caption?: string | null;
  alt_text?: string | null;
  year?: string | null;
  frame_style?: 'tape-top' | 'tape-corners' | 'corner-pins' | 'simple-frame' | 'auto';
  rotation_deg?: number;
}

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
  photos?: StoryPhoto[];
  allow_comments?: boolean;
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

export interface SiteSettings {
  dedication: string;
  author_bio: string;
  portrait_url?: string | null;
  portrait_caption?: string | null;
}

export interface MediaItem {
  name: string;
  id: string;
  url: string;
  size: number;
  created_at: string;
  is_used: boolean;
  used_in_stories?: { id: string; title: string }[];
}

