'use client';

import { useState } from 'react';
import { ContentItemWithLikes } from '@/types';
import ContentCard from './ContentCard';
import ContentViewer from './ContentViewer';

interface ContentGridProps {
  contentItems: ContentItemWithLikes[];
  userIdentifier: string;
  onDeleteContent: (itemId: string, userIdentifier: string) => void;
  onUpdateContent: (itemId: string, updates: Partial<ContentItemWithLikes>) => void;
}

export default function ContentGrid({ 
  contentItems, 
  userIdentifier, 
  onDeleteContent,
  onUpdateContent
}: ContentGridProps) {
  const [selectedContent, setSelectedContent] = useState<ContentItemWithLikes | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleContentClick = (item: ContentItemWithLikes) => {
    setSelectedContent(item);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = async () => {
    setIsViewerOpen(false);
    setSelectedContent(null);
  };

  const handleUpdateContent = async (updates: Partial<ContentItemWithLikes>) => {
    if (selectedContent) {
      await onUpdateContent(selectedContent.id, updates);
      // 업데이트된 내용으로 선택된 콘텐츠도 업데이트
      setSelectedContent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteFromViewer = async () => {
    if (selectedContent) {
      try {
        await onDeleteContent(selectedContent.id, selectedContent.user_identifier);
        handleCloseViewer();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };



  if (contentItems.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            아직 콘텐츠가 없습니다
          </h3>
          <p className="text-gray-600 mb-6">
            첫 번째 콘텐츠를 추가해서 보드를 시작해보세요!
          </p>
          <div className="text-sm text-gray-500">
            💡 텍스트, 이미지, 링크를 자유롭게 추가할 수 있어요
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {contentItems.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            isOwner={item.user_identifier === userIdentifier}
            userIdentifier={userIdentifier}
            onDelete={() => onDeleteContent(item.id, item.user_identifier)}
            onClick={() => handleContentClick(item)}
            onUpdate={(updates) => onUpdateContent(item.id, updates)}
          />
        ))}
      </div>

      <ContentViewer
        isOpen={isViewerOpen}
        content={selectedContent}
        isOwner={selectedContent?.user_identifier === userIdentifier}
        onClose={handleCloseViewer}
        onUpdate={handleUpdateContent}
        onDelete={handleDeleteFromViewer}
      />
    </>
  );
} 