'use client';

import { useState } from 'react';
import { Edit3, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, ContentItemWithLikes } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ContentCard from './ContentCard';
import GripIcon from './GripIcon';
import ConfirmModal from './ConfirmModal';

interface CategoryColumnProps {
  category: Category;
  contentItems: ContentItemWithLikes[];
  userIdentifier: string;
  onAddContent: (categoryId: string) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleCategoryVisibility: (categoryId: string, isHidden: boolean) => void;
  onDeleteContent: (itemId: string, userIdentifier: string) => void;
  onUpdateContent: (itemId: string, updates: Partial<ContentItemWithLikes>) => void;
  onContentClick: (item: ContentItemWithLikes) => Promise<void>;
}

export default function CategoryColumn({
  category,
  contentItems,
  userIdentifier,
  onAddContent,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryVisibility,
  onDeleteContent,
  onUpdateContent,
  onContentClick,
}: CategoryColumnProps) {
  const { isLoggedIn } = useAuth();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryName: string }>({
    isOpen: false,
    categoryName: ''
  });

  // 드래그 앤 드롭 설정
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };



  // 카테고리에 속한 콘텐츠들을 최신순으로 정렬
  const sortedItems = contentItems
    .filter(item => item.category_id === category.id)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const handleDeleteCategory = () => {
    setDeleteConfirm({
      isOpen: true,
      categoryName: category.name
    });
  };

  const confirmDelete = () => {
    onDeleteCategory(category.id);
    setDeleteConfirm({ isOpen: false, categoryName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, categoryName: '' });
  };

  return (
    <div 
      ref={setNodeRef}
      style={{ ...style, minHeight: '150px' }}
      className="bg-gray-50 rounded-lg border border-gray-200 w-80 flex-shrink-0 flex flex-col"
    >
      {/* 카테고리 헤더 */}
      <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* 드래그 핸들 */}
            <button
              {...attributes}
              {...listeners}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing transition-colors"
              title="드래그하여 위치 변경"
            >
              <GripIcon size={12} />
            </button>
            
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {sortedItems.length}
            </span>
            {isLoggedIn && (
              <>
                <button
                  onClick={() => onToggleCategoryVisibility(category.id, !category.is_hidden)}
                  className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                  title={category.is_hidden ? "카테고리 보이기" : "카테고리 숨기기"}
                >
                  {category.is_hidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onEditCategory(category)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="카테고리 편집"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="카테고리 삭제"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 콘텐츠 추가 버튼 */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => onAddContent(category.id)}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Plus className="w-3 h-3" />
          <span className="text-xs font-medium">콘텐츠 추가</span>
        </button>
      </div>

      {/* 콘텐츠 목록 */}
      <div className="p-3 space-y-3 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {sortedItems.length === 0 ? (
          <div className="text-center py-2 text-gray-400">
            <div className="text-lg mb-1">📝</div>
            <p className="text-xs">아직 콘텐츠가 없습니다</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div key={item.id} className="w-full">
              <ContentCard
                item={item}
                isOwner={isLoggedIn || item.user_identifier === userIdentifier}
                userIdentifier={userIdentifier}
                onDelete={() => onDeleteContent(item.id, item.user_identifier)}
                onClick={async () => await onContentClick(item)}
                onUpdate={(updates) => onUpdateContent(item.id, updates)}
              />
            </div>
          ))
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title="카테고리 삭제"
        message={sortedItems.length > 0 
          ? `"${deleteConfirm.categoryName}" 카테고리에 ${sortedItems.length}개의 콘텐츠가 있습니다.\n\n카테고리를 삭제하면 모든 콘텐츠도 함께 삭제됩니다.\n정말 삭제하시겠습니까?`
          : `"${deleteConfirm.categoryName}" 카테고리를 삭제하시겠습니까?`
        }
        confirmText="삭제"
        cancelText="취소"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
} 