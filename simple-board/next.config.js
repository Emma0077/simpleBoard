/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 배포를 위한 standalone 출력
  output: 'standalone',
  
  // 이미지 최적화 설정
  images: {
    domains: ['kvjxrxzkpdxrjxkbdijy.supabase.co'], // Supabase Storage 도메인
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      }
    ],
    // Docker 환경에서도 이미지 최적화 사용
    unoptimized: false, 
    // 이미지 포맷 우선순위 (WebP 우선)
    formats: ['image/webp', 'image/avif'],
    // 캐시 최적화
    minimumCacheTTL: 86400, // 24시간 캐시
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