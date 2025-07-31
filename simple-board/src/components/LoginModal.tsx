'use client';

import { useState } from 'react';
import { X, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email.trim(), password);
      
      if (success) {
        toast.success('로그인되었습니다.');
        onClose();
        setEmail('');
        setPassword('');
      } else {
        toast.error('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    toast.error('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <LogIn className="w-5 h-5 text-blue-600" />
            관리자 로그인
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 폼 내용 */}
        <form onSubmit={handleLogin} className="p-6 space-y-6">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 <span className="text-red-500">*</span>
            </label>
                                    <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="이메일을 입력하세요"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          autoFocus
                        />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>


        </form>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            취소
          </button>
          <button
            onClick={handleLogin}
            disabled={isLoading || !email.trim() || !password.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                로그인 중...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                로그인
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 