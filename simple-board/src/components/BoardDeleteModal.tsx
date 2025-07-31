'use client';

import { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { Board } from '@/types';
import toast from 'react-hot-toast';

interface BoardDeleteModalProps {
  isOpen: boolean;
  board: Board | null;
  onClose: () => void;
  onDelete: (boardId: string) => Promise<void>;
}

export default function BoardDeleteModal({ 
  isOpen, 
  board, 
  onClose, 
  onDelete 
}: BoardDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const expectedText = board?.id || '';
  const isConfirmValid = confirmText === expectedText;

  const handleDelete = async () => {
    if (!board || !isConfirmValid) return;

    try {
      setIsDeleting(true);
      await onDelete(board.id);
      toast.success('보드가 완전히 삭제되었습니다.');
      onClose();
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('보드 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    setIsDeleting(false);
    onClose();
  };

  if (!isOpen || !board) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            보드 완전 삭제
          </h2>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 경고 내용 */}
        <div className="p-6 space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">⚠️ 주의: 되돌릴 수 없는 작업입니다</h3>
                <p className="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                  이 작업은 다음 데이터를 <strong>영구적으로 삭제</strong>합니다:
                </p>
                <ul className="mt-2 text-red-700 dark:text-red-300 text-sm space-y-1">
                  <li>• 보드 정보</li>
                  <li>• 모든 카테고리</li>
                  <li>• 모든 콘텐츠 (텍스트, 이미지, 파일, 링크)</li>
                  <li>• 업로드된 모든 첨부파일</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 보드 정보 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">삭제할 보드 정보</h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">제목:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">{board.title}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">보드 ID:</span>
                <span className="ml-2 font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-900 dark:text-gray-100">
                  {board.id}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">생성일:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{new Date(board.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 확인 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              삭제를 확인하려면 보드 ID를 정확히 입력하세요:
            </label>
            <div className="space-y-2">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border dark:border-gray-600 font-mono text-sm text-gray-800 dark:text-gray-200">
                {board.id}
              </div>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="위의 보드 ID를 여기에 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isDeleting}
              />
            </div>
            {confirmText && !isConfirmValid && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                입력한 ID가 일치하지 않습니다.
              </p>
            )}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-sm ${
              isConfirmValid && !isDeleting
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                영구 삭제
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 