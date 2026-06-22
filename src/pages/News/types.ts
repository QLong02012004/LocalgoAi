export interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  content?: string;
  image: string | null;
  category: string;
  readTime: string;
  isFeatured: boolean;
  authorName?: string;
  viewCount?: number;
  status?: string;
  createdAt: string;
  updatedAt?: string;
  date?: string; // mapped on frontend from createdAt
}