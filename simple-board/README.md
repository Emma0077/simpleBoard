# 🧾 그로쓰캠프 담벼락 - 협업보드

> 누구나 링크 하나로 쉽게 콘텐츠를 작성하고 공유할 수 있는 초간단 온라인 협업 보드

## ✨ 주요 기능

- 🚀 **가입/로그인 없이 즉시 사용** - 고유 링크로 바로 시작
- 📝 **다양한 콘텐츠 지원** - 텍스트, 이미지, 링크, 파일 자유롭게 추가
- ⚡ **실시간 동기화** - 여러 사용자가 동시에 작업하는 내용 실시간 반영
- 🗑️ **본인 콘텐츠 관리** - 로컬 식별자 기반으로 본인이 작성한 콘텐츠만 삭제 가능
- ✏️ **콘텐츠 수정** - 작성한 콘텐츠를 언제든지 수정 가능
- 👁️ **상세 뷰어** - 클릭으로 콘텐츠 전체 내용 확인 및 다운로드
- 📂 **카테고리 기반 구조** - 필수 카테고리 생성 후 콘텐츠 관리
- 📊 **컬럼 레이아웃** - 카테고리별 세로 컬럼으로 체계적 관리
- 👤 **작성자 표시** - 각 콘텐츠의 작성자 이름 표시
- 📱 **반응형 디자인** - 모바일, 태블릿, 데스크탑 모든 기기에서 사용 가능
- 🔗 **링크 공유** - 복사/붙여넣기로 간편하게 보드 공유

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Realtime**: Supabase Realtime
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 🚀 시작하기

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd wall_board
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. 프로젝트 설정에서 API 키와 URL 확인
3. 환경 변수 설정

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 데이터베이스 스키마 설정

Supabase SQL Editor에서 `database/schema.sql` 파일의 내용을 실행하여 테이블을 생성합니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📊 데이터베이스 스키마

### boards 테이블

- `id`: VARCHAR (Primary Key) - 보드 고유 식별자
- `title`: VARCHAR - 보드 제목
- `description`: TEXT - 보드 설명 (선택사항)
- `created_by_identifier`: UUID - 생성자 식별자
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### categories 테이블

- `id`: UUID (Primary Key)
- `board_id`: VARCHAR - 보드 식별자 (FK)
- `name`: VARCHAR - 카테고리 이름
- `description`: TEXT - 카테고리 설명 (선택사항)
- `color`: VARCHAR - 카테고리 색상 (HEX)
- `position`: INTEGER - 정렬 순서
- `created_by_identifier`: UUID - 생성자 식별자
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### content_items 테이블

- `id`: UUID (Primary Key)
- `board_id`: VARCHAR - 보드 식별자
- `category_id`: UUID - 카테고리 식별자 (FK, 선택사항)
- `type`: ENUM ('text', 'image', 'link', 'file') - 콘텐츠 타입
- `content`: TEXT - 텍스트 내용/설명
- `title`: VARCHAR - 제목 (선택사항)
- `image_url`: TEXT - 이미지 URL (이미지 타입일 때)
- `link_url`: TEXT - 링크 URL (링크 타입일 때)
- `file_url`: TEXT - 파일 URL (파일 타입일 때)
- `file_name`: VARCHAR - 파일명 (파일 타입일 때)
- `file_type`: VARCHAR - 파일 MIME 타입 (파일 타입일 때)
- `file_size`: BIGINT - 파일 크기 (파일 타입일 때)
- `author_name`: VARCHAR - 작성자 이름 (선택사항)
- `user_identifier`: UUID - 사용자 식별자 (로컬)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## 🏗️ 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── board/[boardId]/   # 동적 보드 페이지
│   ├── globals.css        # 전역 스타일
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈페이지
├── components/            # React 컴포넌트
│   ├── AddContentModal.tsx    # 콘텐츠 추가 모달
│   ├── BoardHeader.tsx        # 보드 헤더 (카테고리/콘텐츠 추가 버튼)
│   ├── CategoryColumn.tsx     # 카테고리별 세로 컬럼
│   ├── CategoryManager.tsx    # 카테고리 관리 모달
│   ├── ContentCard.tsx        # 콘텐츠 카드
│   ├── ContentGrid.tsx        # 콘텐츠 그리드 (레거시)
│   └── ContentViewer.tsx      # 콘텐츠 상세 뷰어
├── lib/                   # 유틸리티 및 설정
│   ├── supabase.ts       # Supabase 클라이언트
│   └── utils.ts          # 헬퍼 함수들
└── types/                # TypeScript 타입 정의
    └── index.ts
```

## 🔧 주요 구현 사항

### 실시간 기능

Supabase Realtime을 사용하여 다음 이벤트를 실시간으로 동기화:
- 새 콘텐츠 추가 (INSERT)
- 콘텐츠 삭제 (DELETE)
- 콘텐츠 수정 (UPDATE)

### 사용자 식별

로그인 없이 사용하기 위해 로컬 스토리지에 UUID를 저장하여 사용자를 식별:
- 브라우저당 고유한 사용자 식별자 생성
- 본인이 작성한 콘텐츠만 수정/삭제 가능

### 파일 처리

- **이미지**: 파일 업로드 또는 외부 URL 지원
- **문서/압축파일**: 최대 10MB까지 업로드 가능
- Base64 인코딩으로 데이터베이스에 저장
- 파일 정보(이름, 타입, 크기) 자동 저장
- 상세 뷰어에서 다운로드 기능 제공

### 카테고리 시스템

- 보드 내에서 카테고리 생성 및 관리
- 10가지 사전 정의된 색상 중 선택
- 카테고리별 콘텐츠 필터링
- 드래그앤드롭으로 콘텐츠 카테고리 이동 (향후 기능)

### 콘텐츠 뷰어

- 클릭으로 콘텐츠 전체 내용 확인
- 이미지 확대보기 및 다운로드
- 파일 정보 표시 및 다운로드
- 인라인 편집 기능
- 작성자 정보 및 시간 표시

## 🚀 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 배포 완료

### 환경 변수 (Vercel)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📝 사용법

### 새 보드 만들기

1. 홈페이지에서 "새 보드 시작하기" 클릭
2. 보드 제목과 설명 입력
3. "생성하기" 버튼으로 보드 생성
4. 자동으로 생성된 고유 URL로 이동

### 카테고리 관리

1. 보드 내에서 "카테고리 관리" 버튼 클릭 (우측 상단 녹색 버튼)
2. 카테고리 관리 화면에서 기존 카테고리들을 세로 리스트로 확인
3. "새 카테고리 추가" 버튼으로 생성 모달 열기
4. 개선된 폼에서 카테고리 이름, 설명, 색상(10가지) 선택
5. "생성하기" 버튼으로 카테고리 생성
6. 기존 카테고리 편집은 각 항목의 편집 버튼으로 별도 모달에서 처리

🎨 **UI 개선**: 
- 카테고리 관리 화면 좌우 여백 확대 및 세로 리스트 형태
- 생성/편집을 위한 깔끔한 모달 UI
- 카테고리별 번호 표시 및 향상된 시각적 구분

### 콘텐츠 추가하기

⚠️ **카테고리를 먼저 생성해야 합니다!**

1. 각 카테고리 컬럼 내의 "콘텐츠 추가" 버튼 클릭
2. 텍스트, 이미지, 링크, 파일 중 선택
3. 제목, 작성자 이름 입력 (카테고리는 자동 선택됨)
4. 필요한 정보 입력 후 "추가하기" 클릭

📝 **카테고리 없이는 콘텐츠 추가 불가**: 우측 상단의 "콘텐츠 추가" 버튼이 제거되었습니다.

### 보드 삭제

⚠️ **위험한 작업**: 보드와 모든 데이터를 영구적으로 삭제합니다.

1. 보드 화면 우측 상단의 "보드 삭제" 버튼 클릭 (빨간색 버튼)
2. 삭제 확인 모달에서 보드 ID를 정확히 입력
3. "영구 삭제" 버튼으로 완전 삭제 실행

🔒 **안전 장치**: 보드 ID 재입력으로 실수 방지, 삭제 후 홈페이지 자동 이동

💡 **새로운 컬럼 기반 레이아웃**
- 카테고리별로 세로 컬럼 형태로 표시
- 각 컬럼 내에서 콘텐츠가 위에서 아래로 쌓임
- 최신 수정된 콘텐츠가 맨 위에 표시

### 콘텐츠 보기 및 관리

1. **상세 보기**: 콘텐츠 카드 클릭으로 전체 내용 확인
2. **다운로드**: 이미지/파일은 상세 뷰어에서 다운로드 가능
3. **수정**: 본인 작성 콘텐츠는 상세 뷰어에서 수정 가능
4. **삭제**: 본인 작성 콘텐츠만 삭제 가능

### 보드 공유하기

1. 보드 헤더의 "공유" 버튼 클릭
2. 자동으로 클립보드에 링크 복사
3. 링크를 다른 사람들과 공유

## 🚀 배포

### Google Cloud Run으로 프로덕션 배포

이 프로젝트는 Google Cloud Run에 자동 배포되도록 설정되어 있습니다.

#### 📖 상세 배포 가이드
전체 배포 과정은 [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)를 참조하세요.

#### ⚡ 빠른 배포
1. GitHub 저장소 생성 및 소스 푸시
2. Google Cloud 프로젝트 설정
3. GitHub Secrets 설정
4. `main` 브랜치에 푸시하면 자동 배포

#### 🔧 배포 구성
- **Docker**: 멀티 스테이지 빌드로 최적화
- **GitHub Actions**: 자동 CI/CD 파이프라인
- **Cloud Run**: 서버리스 컨테이너 플랫폼
- **Artifact Registry**: Docker 이미지 저장소

#### 🌐 배포된 환경 특징
- HTTPS 자동 적용
- 자동 스케일링 (0→N)
- Cold Start 최적화
- 실시간 로그 및 모니터링

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 🙋‍♂️ 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 남겨주세요.
