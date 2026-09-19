export type StoryVisibility = 'draft' | 'published' | 'private';

export interface Story {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  chapter_label: string;
  order_index: number;
  year?: string;
  visibility: StoryVisibility;
  reading_time: string;
  excerpt: string;
  content_html: string;
  cover_image_url?: string;
  image_caption?: string;
  published_at: string;
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
