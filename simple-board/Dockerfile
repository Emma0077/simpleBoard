# 멀티 스테이지 빌드를 사용하여 이미지 크기 최적화
FROM node:18-alpine AS base

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치 스테이지
FROM base AS deps
WORKDIR /app

# 패키지 파일 복사
COPY package.json package-lock.json* ./

# 의존성 설치
RUN npm ci --only=production

# 빌드 스테이지
FROM base AS builder
WORKDIR /app

# Build-time 환경 변수를 ARG로 받기
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 환경 변수 설정 (빌드 시 필요)
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# 패키지 파일 복사
COPY package.json package-lock.json* ./

# 모든 의존성 설치 (dev dependencies 포함)
RUN npm ci

# 소스 코드 복사
COPY . .

# Next.js 앱 빌드
RUN npm run build

# 프로덕션 스테이지
FROM base AS runner
WORKDIR /app

# Build-time 환경 변수를 ARG로 받기
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# 프로덕션 환경 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# 시스템 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js 정적 파일 복사
COPY --from=builder /app/public ./public

# Next.js 빌드 출력 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 사용자 변경
USER nextjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 애플리케이션 실행
CMD ["node", "server.js"] 