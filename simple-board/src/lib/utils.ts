import { v4 as uuidv4 } from 'uuid';

// 로컬 스토리지에서 사용자 식별자 관리
export const getUserIdentifier = (): string => {
  if (typeof window === 'undefined') return uuidv4();
  
  const key = 'simpleboard_user_id';
  let userId = localStorage.getItem(key);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(key, userId);
  }
  
  return userId;
};

// 보드 ID 생성
export const generateBoardId = (): string => {
  return uuidv4().substring(0, 8);
};

// URL에서 유효한 링크인지 확인
export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
};

// 클래스명 조합 유틸리티
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// 상대 시간 표시
export const getRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  return past.toLocaleDateString('ko-KR');
}; 