'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Board } from '@/types';

interface BoardEditModalProps {
  isOpen: boolean;
  board: Board | null;
  onClose: () => void;
  onSave: (data: { title: string; description?: string }) => void;
}

export default function BoardEditModal({
  isOpen,
  board,
  onClose,
  onSave,
}: BoardEditModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || '');
    }
  }, [board]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title: title.trim(),
        description: description.trim() || undefined,
      });
    }
  };

  if (!isOpen || !board) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">보드 정보 수정</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                보드 제목 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="보드 제목을 입력하세요"
                required
                maxLength={500}
              />
            </div>

            {/* 설명 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                보드 설명
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="보드에 대한 설명을 입력하세요 (선택사항)"
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 