/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 배포를 위한 standalone 출력
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    unoptimized: true
  },

  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  // 서버 컴포넌트 외부 패키지 (deprecated experimental에서 이동)
  serverExternalPackages: []
}

module.exports = nextConfig 