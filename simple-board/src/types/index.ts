export interface Board {
  id: string;
  title: string;
  description?: string;
  created_by_identifier: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  board_id: string;
  name: string;
  description?: string;
  color: string;
  position: number;
  is_hidden?: boolean;
  created_by_identifier: string;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  board_id: string;
  category_id?: string;
  type: 'text' | 'image' | 'link' | 'file';
  content: string;
  title?: string;
  image_url?: string;
  thumbnail_url?: string;
  link_url?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  author_name?: string;
  user_identifier: string; // 로컬 식별자 (UUID)
  created_at: string;
  updated_at: string;
  position_x?: number;
  position_y?: number;
}

export interface ContentItemWithLikes extends ContentItem {
  like_count: number;
  age_seconds: number;
  _localUpdate?: number; // 로컬 업데이트 마커 (Realtime 충돌 방지)
}

export interface Like {
  id: string;
  content_item_id: string;
  user_identifier: string;
  created_at: string;
}

export interface CreateContentItem {
  board_id: string;
  category_id?: string;
  type: 'text' | 'image' | 'link' | 'file';
  content: string;
  title?: string;
  image_url?: string;
  thumbnail_url?: string;
  link_url?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  author_name?: string;
  user_identifier: string;
}

export interface CreateBoard {
  id: string;
  title: string;
  description?: string;
  created_by_identifier: string;
}

export interface CreateCategory {
  board_id: string;
  name: string;
  description?: string;
  color?: string;
  position?: number;
  created_by_identifier: string;
} 