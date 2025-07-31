'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ExternalLink, Clipboard, History, LogIn, LogOut, User } from 'lucide-react';
import { generateBoardId, getUserIdentifier } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Board } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import toast from 'react-hot-toast';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const [boardUrl, setBoardUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [boardTitle, setBoardTitle] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [userIdentifier] = useState(() => getUserIdentifier());

  // 최근 보드 목록 로드
  const loadRecentBoards = async () => {
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentBoards(data || []);
    } catch (error) {
      console.error('Error loading recent boards:', error);
    }
  };

  const createNewBoard = async () => {
    if (!boardTitle.trim()) {
      toast.error('보드 제목을 입력해주세요.');
      return;
    }

    setIsCreating(true);
    try {
      const boardId = generateBoardId();
      
      // 데이터베이스에 보드 생성
      const { error } = await supabase
        .from('boards')
        .insert([{
          id: boardId,
          title: boardTitle.trim(),
          description: boardDescription.trim() || null,
          created_by_identifier: userIdentifier,
        }]);

      if (error) throw error;
      
      // 폼 초기화
      setBoardTitle('');
      setBoardDescription('');
      setShowCreateForm(false);
      
      // 새 보드로 이동
      router.push(`/board/${boardId}`);
    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('보드 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // 컴포넌트 마운트 시 최근 보드 로드
  useEffect(() => {
    loadRecentBoards();
  }, []);

  const navigateToBoard = () => {
    if (!boardUrl.trim()) {
      toast.error('보드 URL을 입력해주세요.');
      return;
    }

    // URL에서 보드 ID 추출
    try {
      const url = new URL(boardUrl);
      const pathParts = url.pathname.split('/');
      const boardId = pathParts[pathParts.length - 1];
      
      if (!boardId || boardId.length < 6) {
        throw new Error('Invalid board ID');
      }
      
      router.push(`/board/${boardId}`);
    } catch {
      // URL이 아닌 경우, 보드 ID로 직접 처리
      const cleanId = boardUrl.trim().replace(/[^a-zA-Z0-9-]/g, '');
      if (cleanId.length >= 6) {
        router.push(`/board/${cleanId}`);
      } else {
        toast.error('올바른 보드 URL 또는 ID를 입력해주세요.');
      }
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setBoardUrl(text);
      toast.success('클립보드에서 붙여넣기 완료');
    } catch {
      toast.error('클립보드 접근에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 헤더 */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/gcamp_logo.svg" alt="GrowthCamp Logo" className="w-8 h-8" />
            </div>
            <img src="/gcamp_name_logo_gray.svg" alt="GrowthCamp Name Logo" className="h-8" />
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">관리자</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">로그아웃</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">관리자 로그인</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* 메인 헤더 */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              그로쓰캠프
              <span className="text-blue-600"> 담벼락</span>
            </h1>
            <p className="text-xl text-gray-600 mb-1">
              협업보드
            </p>
            <p className="text-gray-500">
              가입 없이 바로 시작하세요. 텍스트, 이미지, 링크를 자유롭게 공유하세요.
            </p>
          </div>

          {/* 메인 액션 */}
          <div className="space-y-6">
            {/* 새 보드 생성 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    새 보드 만들기
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  몇 초 만에 새로운 협업 보드를 생성하고 팀과 공유하세요.
                </p>
              </div>
              
              {!showCreateForm ? (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  새 보드 시작하기
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      보드 제목 *
                    </label>
                    <input
                      type="text"
                      value={boardTitle}
                      onChange={(e) => setBoardTitle(e.target.value)}
                      placeholder="보드 제목을 입력하세요"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명 (선택사항)
                    </label>
                    <textarea
                      value={boardDescription}
                      onChange={(e) => setBoardDescription(e.target.value)}
                      placeholder="보드에 대한 간단한 설명을 입력하세요"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setBoardTitle('');
                        setBoardDescription('');
                      }}
                      className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={createNewBoard}
                      disabled={isCreating || !boardTitle.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          생성 중...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          생성하기
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 기존 보드 참여 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    기존 보드 참여하기
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  공유받은 보드 링크나 ID를 입력해서 참여하세요.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={boardUrl}
                    onChange={(e) => setBoardUrl(e.target.value)}
                    placeholder="보드 URL 또는 ID를 입력하세요"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && navigateToBoard()}
                  />
                  <button
                    onClick={pasteFromClipboard}
                    className="px-4 py-3 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="클립보드에서 붙여넣기"
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={navigateToBoard}
                  disabled={!boardUrl.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  보드 참여하기
                </button>
              </div>
            </div>
          </div>

          {/* 최근 보드 목록 */}
          {recentBoards.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mt-6">
              <div className="mb-4">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <History className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    최근 보드
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">
                  최근에 생성된 보드들을 확인하고 바로 접속하세요.
                </p>
              </div>

              <div className="space-y-2">
                {recentBoards.slice(0, 5).map((board) => (
                  <div
                    key={board.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => router.push(`/board/${board.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {board.title}
                      </h3>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  </div>
                ))}
              </div>

              {recentBoards.length > 5 && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500">
                    총 {recentBoards.length}개의 보드가 있습니다
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 특징 소개 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">즉시 시작</h3>
              <p className="text-gray-600 text-sm">
                가입이나 로그인 없이 바로 사용할 수 있어요
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">실시간 동기화</h3>
              <p className="text-gray-600 text-sm">
                여러 사람이 동시에 작업하는 내용이 실시간으로 반영돼요
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">어디서나</h3>
              <p className="text-gray-600 text-sm">
                모바일, 태블릿, 데스크탑 어디서나 사용 가능해요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 모달 */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
