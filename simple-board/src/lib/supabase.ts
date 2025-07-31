console.log("✅ [supabase.ts] loaded");
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


import { createClient } from '@supabase/supabase-js';
import { ContentItemWithLikes } from '@/types';

// 요청 큐 타입 정의
interface QueuedRequest {
  id: string;
  timestamp: number;
  type: 'like' | 'unlike' | 'content_update' | 'category_update' | 'board_update';
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout?: number; // 브라우저 호환 타입
}

// 전역 요청 큐 매니저
class RequestQueueManager {
  private queue: QueuedRequest[] = [];
  private processing: number = 0;
  private readonly MAX_CONCURRENT = 3; // 최대 동시 처리 수
  private readonly MAX_QUEUE_SIZE = 1000; // 최대 큐 크기
  private readonly REQUEST_TIMEOUT = 30000; // 요청 타임아웃 (30초)

  // 요청을 큐에 추가
  async enqueue<T>(
    type: QueuedRequest['type'],
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 큐 크기 초과 시 오래된 요청 제거 (메모리 보호)
      if (this.queue.length >= this.MAX_QUEUE_SIZE) {
        const removed = this.queue.shift();
        if (removed) {
          if (removed.timeout) window.clearTimeout(removed.timeout);
          removed.reject(new Error('Queue overflow - request dropped'));
        }
      }

      const requestId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = Date.now();

      // 타임아웃 설정
      const timeout = window.setTimeout(() => {
        this.removeFromQueue(requestId);
        reject(new Error('Request timeout'));
      }, this.REQUEST_TIMEOUT);

      const queuedRequest: QueuedRequest = {
        id: requestId,
        timestamp,
        type,
        operation,
        resolve,
        reject,
        timeout
      };

      // 타임스탬프 순으로 삽입 (먼저 온 것부터 처리)
      const insertIndex = this.queue.findIndex(req => req.timestamp > timestamp);
      if (insertIndex === -1) {
        this.queue.push(queuedRequest);
      } else {
        this.queue.splice(insertIndex, 0, queuedRequest);
      }

      this.processQueue();
    });
  }

  // 큐에서 요청 제거
  private removeFromQueue(requestId: string) {
    const index = this.queue.findIndex(req => req.id === requestId);
    if (index !== -1) {
      const removed = this.queue.splice(index, 1)[0];
      if (removed.timeout) window.clearTimeout(removed.timeout);
    }
  }

  // 큐 처리
  private async processQueue() {
    if (this.processing >= this.MAX_CONCURRENT || this.queue.length === 0) {
      return;
    }

    const request = this.queue.shift();
    if (!request) return;

    this.processing++;

    try {
      if (request.timeout) window.clearTimeout(request.timeout);
      
      // 실제 작업 실행
      const result = await request.operation();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.processing--;
      // 다음 요청 처리 (비동기적으로, 브라우저 호환)
      setTimeout(() => this.processQueue(), 0);
    }
  }

  // 큐 상태 정보 (디버깅용)
  getStatus() {
    return {
      queueSize: this.queue.length,
      processing: this.processing,
      maxConcurrent: this.MAX_CONCURRENT,
      maxQueueSize: this.MAX_QUEUE_SIZE
    };
  }
}

// 전역 큐 매니저 인스턴스
const requestQueue = new RequestQueueManager();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';



if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.');
  // Create a dummy client for development
  if (typeof window !== 'undefined') {
    console.warn('Supabase not configured. Database operations will fail.');
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 연결 테스트 함수 (개발용)
export const testSupabaseConnection = async () => {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== 'development') return true;
  
  try {
    const { error } = await supabase
      .from('content_items')
      .select('count')
      .limit(1);
    
    if (error) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

// 테이블 존재 여부 확인 함수 (개발용)
export const checkTablesExist = async () => {
  // 개발 환경에서만 실행
  if (process.env.NODE_ENV !== 'development') return;
  
  // 테이블 존재 여부 확인 (로그 없이)
  try {
    await supabase.from('content_items').select('id').limit(1);
  } catch {
    // 에러 처리 (로그 없이)
  }
  
  try {
    await supabase.from('user_likes').select('id').limit(1);
  } catch {
    // 에러 처리 (로그 없이)
  }
  
  try {
    await supabase.from('content_items_with_likes').select('id').limit(1);
  } catch {
    // 에러 처리 (로그 없이)
  }
};

// 내부 좋아요 함수 (큐에서 실행될 실제 로직)
const _internalLikeContentItem = async (contentItemId: string, userIdentifier: string) => {
  try {
    // 먼저 이미 좋아요를 눌렀는지 확인
    const alreadyLiked = await checkIfLiked(contentItemId, userIdentifier);
    if (alreadyLiked) {
      return null; // 이미 좋아요를 눌렀으면 아무것도 하지 않음
    }

    // RPC 함수를 사용하여 좋아요 추가 (Race Condition 방지를 위해 재시도 로직)
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // RPC 호출 전 마지막 중복 체크 (동시 접근 시 방지)
        const doubleCheck = await checkIfLiked(contentItemId, userIdentifier);
        if (doubleCheck) {
          return null;
        }

        const { data, error } = await supabase.rpc('add_like', {
          p_content_item_id: contentItemId,
          p_user_identifier: userIdentifier
        });

        if (error) {
          // 중복 키 에러 등은 재시도하지 않음
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            return null;
          }
          throw error;
        }

        // 좋아요 추가 후 최신 데이터를 다시 조회
        const { data: updatedItem, error: fetchError } = await supabase
          .from('content_items_with_likes')
          .select('*')
          .eq('id', contentItemId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        return updatedItem;
      } catch (error: any) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw error;
        }
        // 짧은 지연 후 재시도 (Race Condition 회피)
        await new Promise(resolve => setTimeout(resolve, 100 + retryCount * 50));
      }
    }
  } catch (error) {
    throw error;
  }
};

// 큐잉된 좋아요 함수 (공개 API)
export const likeContentItem = async (contentItemId: string, userIdentifier: string) => {
  return requestQueue.enqueue('like', () => _internalLikeContentItem(contentItemId, userIdentifier));
};

// 내부 좋아요 해제 함수 (큐에서 실행될 실제 로직)
const _internalUnlikeContentItem = async (contentItemId: string, userIdentifier: string) => {
  try {
    // 좋아요 해제 전 존재 여부 확인
    const isLiked = await checkIfLiked(contentItemId, userIdentifier);
    if (!isLiked) {
      return; // 이미 좋아요가 없으면 아무것도 하지 않음
    }

    const { error } = await supabase
      .from('user_likes')
      .delete()
      .eq('content_item_id', contentItemId)
      .eq('user_identifier', userIdentifier);

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

// 큐잉된 좋아요 해제 함수 (공개 API)
export const unlikeContentItem = async (contentItemId: string, userIdentifier: string) => {
  return requestQueue.enqueue('unlike', () => _internalUnlikeContentItem(contentItemId, userIdentifier));
};

// 내부 콘텐츠 업데이트 함수 (큐에서 실행될 실제 로직)
const _internalUpdateContentItem = async (
  itemId: string, 
  updates: Partial<ContentItemWithLikes>, 
  userIdentifier?: string, 
  isLoggedIn: boolean = false
) => {
  try {
    let query = supabase
      .from('content_items')
      .update(updates)
      .eq('id', itemId);

    // 관리자가 아닐 경우에만 작성자 확인
    if (!isLoggedIn && userIdentifier) {
      query = query.eq('user_identifier', userIdentifier);
    }
    
    const { data, error } = await query.select().single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 큐잉된 콘텐츠 업데이트 함수 (공개 API)
export const updateContentItem = async (
  itemId: string, 
  updates: Partial<ContentItemWithLikes>, 
  userIdentifier?: string, 
  isLoggedIn: boolean = false
) => {
  return requestQueue.enqueue('content_update', () => 
    _internalUpdateContentItem(itemId, updates, userIdentifier, isLoggedIn)
  );
};

// 내부 카테고리 업데이트 함수 (큐에서 실행될 실제 로직)
const _internalUpdateCategory = async (categoryId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 큐잉된 카테고리 업데이트 함수 (공개 API)
export const updateCategory = async (categoryId: string, updates: any) => {
  return requestQueue.enqueue('category_update', () => 
    _internalUpdateCategory(categoryId, updates)
  );
};

// 내부 보드 업데이트 함수 (큐에서 실행될 실제 로직)
const _internalUpdateBoard = async (boardId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('boards')
      .update(updates)
      .eq('id', boardId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 큐잉된 보드 업데이트 함수 (공개 API)
export const updateBoard = async (boardId: string, updates: any) => {
  return requestQueue.enqueue('board_update', () => 
    _internalUpdateBoard(boardId, updates)
  );
};

// 큐 상태 조회 (디버깅용)
export const getQueueStatus = () => {
  return requestQueue.getStatus();
};

// 개발 환경에서 큐 상태 모니터링 (브라우저에서만)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // 큐 상태를 주기적으로 로깅 (개발 시에만)
  setInterval(() => {
    const status = requestQueue.getStatus();
    if (status.queueSize > 0 || status.processing > 0) {
      console.log('🔄 Queue Status:', status);
    }
  }, 5000); // 5초마다 체크

  // 전역에서 접근 가능하도록 설정 (디버깅용)
  (window as any).getQueueStatus = getQueueStatus;
}

export const checkIfLiked = async (contentItemId: string, userIdentifier: string): Promise<boolean> => {
  try {
    // 더 효율적인 쿼리: count 사용하여 존재 여부만 확인
    const { data, error, count } = await supabase
      .from('user_likes')
      .select('id', { count: 'exact' })
      .eq('content_item_id', contentItemId)
      .eq('user_identifier', userIdentifier)
      .limit(1);

    if (error) {
      // 개발 환경에서만 에러 로깅
      if (process.env.NODE_ENV === 'development') {
        console.warn('checkIfLiked error:', error);
      }
      return false;
    }

    // count 또는 data 길이로 확인
    return (count ?? data?.length ?? 0) > 0;
  } catch (error) {
    // 예외 발생 시 안전하게 false 반환
    if (process.env.NODE_ENV === 'development') {
      console.warn('checkIfLiked exception:', error);
    }
    return false;
  }
};

// 좋아요 개수가 포함된 콘텐츠 아이템 가져오기
export const getContentItemsWithLikes = async (boardId: string): Promise<ContentItemWithLikes[]> => {
  try {
    // content_items_with_likes 뷰 사용
    const { data, error } = await supabase
      .from('content_items_with_likes')
      .select('*')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (error) {
      // 뷰가 없으면 기본 content_items 사용하고 좋아요 개수를 별도로 계산
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('content_items')
        .select('*')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        throw fallbackError;
      }

      // 각 콘텐츠 아이템의 좋아요 개수를 별도로 가져오기
      const itemsWithLikes: ContentItemWithLikes[] = [];
      
      for (const item of fallbackData || []) {
        const { data: likeData, error: likeError } = await supabase
          .from('user_likes')
          .select('id')
          .eq('content_item_id', item.id);
        
        const likeCount = likeError ? 0 : (likeData?.length || 0);
        
        itemsWithLikes.push({
          ...item,
          like_count: likeCount,
          age_seconds: Math.floor((Date.now() - new Date(item.created_at).getTime()) / 1000)
        });
      }

      return itemsWithLikes;
    }

    return data || [];
      } catch (error) {
      throw error;
    }
}; 

// 보드용 경량 콘텐츠 아이템 가져오기 (썸네일, 파일 메타데이터 포함)
export const getContentItemsForBoard = async (boardId: string): Promise<ContentItemWithLikes[]> => {
  try {
    const { data, error } = await supabase
      .from('content_items_with_likes')
      .select('id, board_id, category_id, type, title, content, link_url, thumbnail_url, file_name, file_type, file_size, created_at, updated_at, user_identifier, like_count, age_seconds')
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (error) {
      // 뷰가 없으면 기본 content_items 사용하고 좋아요 개수를 별도로 계산
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('content_items')
        .select('id, board_id, category_id, type, title, content, link_url, thumbnail_url, file_name, file_type, file_size, created_at, updated_at, user_identifier')
        .eq('board_id', boardId)
        .order('created_at', { ascending: false });

      if (fallbackError) {
        throw fallbackError;
      }

      // 각 콘텐츠 아이템의 좋아요 개수를 별도로 가져오기
      const itemsWithLikes: ContentItemWithLikes[] = [];
      
      for (const item of fallbackData || []) {
        const { data: likeData, error: likeError } = await supabase
          .from('user_likes')
          .select('id')
          .eq('content_item_id', item.id);
        
        const likeCount = likeError ? 0 : (likeData?.length || 0);
        
        itemsWithLikes.push({
          ...item,
          like_count: likeCount,
          age_seconds: Math.floor((Date.now() - new Date(item.created_at).getTime()) / 1000)
        });
      }

      return itemsWithLikes;
    }

    return data || [];
  } catch (error) {
    throw error;
  }
};

// 뷰어용 전체 콘텐츠 아이템 가져오기 (이미지 포함)
export const getContentItemForViewer = async (itemId: string): Promise<ContentItemWithLikes | null> => {
  try {
    // 기본 content_items 테이블에서 모든 컬럼 가져오기 (이미지 포함)
    const { data, error } = await supabase
      .from('content_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) {
      throw error;
    }

    // 좋아요 개수 별도 계산
    const { data: likeData, error: likeError } = await supabase
      .from('user_likes')
      .select('id')
      .eq('content_item_id', itemId);
    
    const likeCount = likeError ? 0 : (likeData?.length || 0);
    
    return {
      ...data,
      like_count: likeCount,
      age_seconds: Math.floor((Date.now() - new Date(data.created_at).getTime()) / 1000)
    };
  } catch (error) {
    throw error;
  }
};

// 잘못된 좋아요 데이터 정리 함수
export const cleanupInvalidLikes = async (contentItemId: string, userIdentifier: string) => {
  try {
    // 해당 사용자의 좋아요 데이터 삭제
    await supabase
      .from('user_likes')
      .delete()
      .eq('content_item_id', contentItemId)
      .eq('user_identifier', userIdentifier);

    return true;
  } catch {
    return false;
  }
}; 

// content_items_with_likes 뷰 새로고침 함수
export const refreshContentView = async () => {
  try {
    // 뷰를 삭제하고 다시 생성
    const { error: dropError } = await supabase.rpc('refresh_content_view');
    
    if (dropError) {
      // 수동으로 뷰 새로고침 시도
      const { error: manualError } = await supabase
        .from('content_items_with_likes')
        .select('count(*)')
        .limit(1);
      
      if (manualError) {
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}; 