'use client';

import { useState, useEffect } from 'react';
import { X, FolderPlus, Save } from 'lucide-react';
import { Category } from '@/types';
import toast from 'react-hot-toast';

interface CategoryEditModalProps {
  isOpen: boolean;
  category?: Category; // undefined면 새 카테고리 생성, 있으면 편집
  onClose: () => void;
  onSave: (data: { name: string; description?: string; color: string }) => Promise<void>;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

export default function CategoryEditModal({ 
  isOpen, 
  category, 
  onClose, 
  onSave 
}: CategoryEditModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLORS[0]);

  const isEditing = !!category;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        // 편집 모드
        setName(category.name);
        setDescription(category.description || '');
        setColor(category.color);
      } else {
        // 생성 모드
        setName('');
        setDescription('');
        setColor(DEFAULT_COLORS[0]);
      }
    }
  }, [isOpen, category]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }

    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      color
    });

    onClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor(DEFAULT_COLORS[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            {isEditing ? (
              <>
                <Save className="w-5 h-5 text-blue-600" />
                카테고리 수정
              </>
            ) : (
              <>
                <FolderPlus className="w-5 h-5 text-green-600" />
                새 카테고리 생성
              </>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 내용 */}
        <div className="p-6 space-y-6">
          {/* 카테고리 이름 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리 이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 아이디어, 할 일, 완료됨"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              autoFocus
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명 (선택사항)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 카테고리에 대한 간단한 설명을 입력하세요"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-colors"
            />
          </div>

          {/* 색상 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              색상 선택
            </label>
            <div className="grid grid-cols-5 gap-3">
              {DEFAULT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                    color === colorOption 
                      ? 'border-gray-600 scale-110 shadow-md ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  title={`색상: ${colorOption}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className={`px-6 py-2.5 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-sm ${
              isEditing 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-4 h-4" />
                수정하기
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                생성하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 