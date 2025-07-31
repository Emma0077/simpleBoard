'use client';

import { useState } from 'react';
import { ArrowLeft, Share2, Plus, Check, Trash2, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Board } from '@/types';
import toast from 'react-hot-toast';

interface BoardHeaderProps {
  boardId: string;
  board: Board | null;
  isLoggedIn: boolean;
  onAddCategory: () => void;
  onDeleteBoard: () => void;
  onEditBoard: () => void;
}

export default function BoardHeader({ boardId, board, isLoggedIn, onAddCategory, onDeleteBoard, onEditBoard }: BoardHeaderProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const shareBoard = async () => {
    const url = `${window.location.origin}/board/${boardId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('보드 링크가 클립보드에 복사되었습니다!');
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 로고 및 보드 정보 */}
          <div className="flex items-center gap-4">
            <button
              onClick={goHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">홈으로</span>
            </button>
            
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {board?.title || `보드 ${boardId}`}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">
                  ID: <span className="font-mono">{boardId}</span>
                </p>
                {board?.description && (
                  <>
                    <span className="text-gray-300">•</span>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">
                      {board.description}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 액션 버튼들 */}
          <div className="flex items-center gap-2">
            <button
              onClick={shareBoard}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="hidden sm:inline text-green-600">복사됨!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">공유</span>
                </>
              )}
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={onEditBoard}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="보드 정보 수정"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">편집</span>
                </button>

                <button
                  onClick={onAddCategory}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">카테고리 관리</span>
                </button>



                <button
                  onClick={onDeleteBoard}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                  title="보드 완전 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">보드 삭제</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 