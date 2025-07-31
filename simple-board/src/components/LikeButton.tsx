'use client';

import { useState, useEffect, memo } from 'react';
import { likeContentItem, unlikeContentItem, checkIfLiked, supabase } from '@/lib/supabase';

interface LikeButtonProps {
  contentItemId: string;
  userIdentifier: string;
  initialLikeCount: number;
  onLikeChange?: (newLikeCount: number) => void;
}

function LikeButton({ 
  contentItemId, 
  userIdentifier, 
  initialLikeCount,
  onLikeChange
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // likeCount 사용 (단순화)
  const displayCount = likeCount;

  useEffect(() => {
    const initializeLikeStatus = async () => {
      try {
        const liked = await checkIfLiked(contentItemId, userIdentifier);
        setIsLiked(liked);
      } catch {
        // 에러 처리 (로그 없이)
      }
    };

    if (contentItemId && userIdentifier) {
      initializeLikeStatus();
    }
  }, [contentItemId, userIdentifier]);

  // 실시간 좋아요 개수 업데이트 (안정성 강화)
  useEffect(() => {
    if (!contentItemId) return;

    let isMounted = true; // 컴포넌트 마운트 상태 추적

    const refreshLikeCount = async () => {
      try {
        const { data: likeData, error: likeError } = await supabase
          .from('user_likes')
          .select('id')
          .eq('content_item_id', contentItemId);
        
        if (!isMounted) return; // 언마운트된 경우 상태 업데이트 방지
        
        const actualLikeCount = likeError ? 0 : (likeData?.length || 0);
        
        // 처리 중이 아닐 때만 업데이트 (상태 충돌 방지)
        if (!isProcessing) {
          setLikeCount(prevCount => {
            if (actualLikeCount !== prevCount) {
              return actualLikeCount;
            }
            return prevCount;
          });
        }
      } catch (error) {
        // 에러 처리 강화
        if (process.env.NODE_ENV === 'development') {
          console.warn('Like count refresh error:', error);
        }
      }
    };

    // 초기 로드
    refreshLikeCount();

    // Supabase Realtime 구독 (중복 방지)
    const channelName = `likes-${contentItemId}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_likes',
          filter: `content_item_id=eq.${contentItemId}`
        },
        refreshLikeCount
      )
      .subscribe();

    return () => {
      isMounted = false;
      channel.unsubscribe();
    };
  }, [contentItemId, isProcessing]);



  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Race Condition 방지: 이미 처리 중이면 무시
    if (isLoading || isProcessing) return;
    
    setIsLoading(true);
    setIsProcessing(true);
    
    try {
      if (!isLiked) {
        // 좋아요 추가
        const result = await likeContentItem(contentItemId, userIdentifier);
        if (result !== null) { // 성공적으로 추가된 경우에만 UI 업데이트
          setIsLiked(true);
          // 서버에서 반환된 최신 데이터로 업데이트
          const newCount = result.like_count;
          setLikeCount(newCount);
          if (onLikeChange) onLikeChange(newCount);
        }
      } else {
        // 좋아요 제거
        await unlikeContentItem(contentItemId, userIdentifier);
        setIsLiked(false);
        
        // 낙관적 업데이트
        const newCount = Math.max(0, likeCount - 1);
        setLikeCount(newCount);
        if (onLikeChange) onLikeChange(newCount);
      }
          } catch {
        // 오류 발생 시 UI만 임시로 토글 (실제 DB 연동 실패 시)
        if (!isLiked) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        } else {
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } finally {
        setIsLoading(false);
        // 약간의 지연 후 처리 상태 해제 (중복 클릭 방지)
        setTimeout(() => setIsProcessing(false), 100);
      }
  };

  // 항상 버튼을 표시 (디버깅을 위해)
  return (
    <button
      onClick={handleLikeClick}
      disabled={isLoading || isProcessing}
      className={`
        flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200
        ${isLiked 
          ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
        }
        ${(isLoading || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isLiked ? '좋아요 취소' : '좋아요'}
    >
      <svg
        className={`w-4 h-4 transition-all duration-200 ${isLiked ? 'fill-current' : 'fill-none'}`}
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className={`text-sm font-medium ${displayCount === 0 ? 'text-gray-400' : ''}`}>
        {displayCount}
      </span>
    </button>
  );
}

export default memo(LikeButton); 