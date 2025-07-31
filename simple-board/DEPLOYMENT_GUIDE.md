# 그로쓰캠프 담벼락 배포 가이드

## 🚀 Google Cloud Run 배포 완전 가이드

### 1단계: GitHub 저장소 생성 및 연결

#### 1.1 GitHub에서 새 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. 우측 상단 `+` 버튼 → `New repository` 클릭
3. Repository name: `growthcamp-wall-board` (또는 원하는 이름)
4. Description: `그로쓰캠프 담벼락 - A Padlet clone with real-time collaboration`
5. **Public** 또는 **Private** 선택
6. **Initialize this repository with** 옵션들은 **체크하지 않음**
7. `Create repository` 클릭

#### 1.2 로컬 저장소와 GitHub 연결
```bash
# GitHub 저장소 URL로 원격 저장소 추가 (YOUR_USERNAME을 실제 사용자명으로 변경)
git remote add origin https://github.com/bartshim75/simple-board.git

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

### 2단계: Google Cloud 프로젝트 설정

#### 2.1 Google Cloud Console 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 ID 기록 (예: `simple-board-123456`)

#### 2.2 필요한 API 활성화
```bash
# Cloud Run API
gcloud services enable run.googleapis.com

# Artifact Registry API  
gcloud services enable artifactregistry.googleapis.com

# Cloud Build API
gcloud services enable cloudbuild.googleapis.com
```

#### 2.3 Artifact Registry 저장소 생성
```bash
gcloud artifacts repositories create simpleboard \
    --repository-format=docker \
    --location=us-central1 \
    --description="Wall Board Docker images"
```

### 3단계: GitHub Actions 설정

#### 3.1 Workload Identity Federation 설정
```bash
# Workload Identity Pool 생성
gcloud iam workload-identity-pools create "github-pool-new" \
  --project="r3-poob" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Workload Identity Provider 생성
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --project="r3-poob" \
  --location="global" \
  --workload-identity-pool="github-pool-new" \
  --display-name="GitHub Provider" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="attribute.repository == 'bartshim75/simple-board'"

# 서비스 계정 생성
gcloud iam service-accounts create "github-actions-sa" \
  --project="r3-poob" \
  --display-name="GitHub Actions Service Account"

# 서비스 계정에 권한 부여
gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:github-actions-sa@r3-poob.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding r3-poob \
  --member="serviceAccount:github-actions-sa@r3-poob.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.admin"

# Workload Identity 바인딩
gcloud iam service-accounts add-iam-policy-binding \
  --project="r3-poob" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/260346172085/locations/global/workloadIdentityPools/github-pool/attribute.repository/bartshim75/simple-board" \
  github-actions-sa@r3-poob.iam.gserviceaccount.com
```

#### 3.2 GitHub Secrets 설정
GitHub 저장소 → Settings → Secrets and variables → Actions

필요한 Secrets:
- `GCP_PROJECT_ID`: `r3-poob`
- `WIF_PROVIDER`: `projects/260346172085/locations/global/workloadIdentityPools/github-pool-new/providers/github-provider`
- `WIF_SERVICE_ACCOUNT`: `github-actions-sa@r3-poob.iam.gserviceaccount.com`
- `NEXT_PUBLIC_SUPABASE_URL`: `https://avumgsudxtjtweelnlib.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2dW1nc3VkeHRqdHdlZWxubGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTUzMzIsImV4cCI6MjA2OTA5MTMzMn0._2Hb78Fjievygt1tufKsYtT14PeoOAazKGdXfiIJGWM`

### 4단계: Supabase 환경 변수 설정

#### 4.1 프로덕션용 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `database/schema.sql` 파일 내용을 SQL Editor에서 실행
3. Settings → API에서 URL과 anon key 확인

#### 4.2 RLS (Row Level Security) 설정
```sql
-- boards 테이블 RLS 활성화 및 정책 설정
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read boards" ON boards FOR SELECT USING (true);
CREATE POLICY "Anyone can create boards" ON boards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update boards" ON boards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete boards" ON boards FOR DELETE USING (true);

-- categories 테이블 RLS 설정
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage categories" ON categories FOR ALL USING (true);

-- content_items 테이블 RLS 설정  
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage content" ON content_items FOR ALL USING (true);
```

### 5단계: 배포 실행

#### 5.1 자동 배포 (권장)
```bash
# 메인 브랜치에 푸시하면 자동 배포
git add .
git commit -m "feat: Add new feature"
git push origin main
```

#### 5.2 수동 배포 (Cloud Build)
```bash
# Cloud Build 트리거 생성
gcloud builds submit --config cloudbuild.yaml

# 또는 직접 배포
docker build -t gcr.io/r3-poob/simpleboard .
docker push gcr.io/r3-poob/simpleboard

gcloud run deploy simpleboard \
  --image gcr.io/r3-poob/simpleboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 6단계: 도메인 설정 (선택사항)

#### 6.1 커스텀 도메인 연결
```bash
# 도메인 매핑 생성
gcloud run domain-mappings create \
  --service simpleboard \
  --domain your-domain.com \
  --region us-central1
```

#### 6.2 HTTPS 인증서 자동 관리
Cloud Run이 Let's Encrypt 인증서를 자동으로 관리합니다.

### 7단계: 모니터링 및 로그

#### 7.1 Cloud Run 서비스 확인
```bash
# 서비스 상태 확인
gcloud run services list --region us-central1

# 로그 확인
gcloud run services logs read simpleboard --region us-central1
```

#### 7.2 성능 모니터링
- Google Cloud Console → Cloud Run → simpleboard
- Metrics 탭에서 요청량, 응답 시간, 오류율 확인

### 🔧 트러블슈팅

#### 빌드 실패
```bash
# 로컬에서 Docker 빌드 테스트
docker build -t simpleboard-test .
docker run -p 3000:3000 simpleboard-test
```

#### 환경 변수 문제
```bash
# Cloud Run 서비스 환경 변수 확인
gcloud run services describe simpleboard --region us-central1
```

#### 권한 문제
```bash
# 서비스 계정 권한 확인
gcloud projects get-iam-policy r3-poob
```

### 📊 비용 최적화

#### Cold Start 최소화
- 최소 인스턴스 수 설정: `--min-instances=1`
- CPU 할당: `--cpu-throttling` (요청 시에만 CPU 사용)

#### 리소스 최적화
- 메모리: `--memory=512Mi` (필요에 따라 조정)
- CPU: `--cpu=1` (기본값)
- 최대 인스턴스: `--max-instances=10`

### 🎯 성공 확인

배포가 완료되면:
1. Cloud Run 서비스 URL 접속
2. 보드 생성 테스트
3. 카테고리 및 콘텐츠 추가 테스트
4. 실시간 업데이트 확인

### 📈 다음 단계

- [ ] CDN 설정 (Cloud CDN)
- [ ] 데이터베이스 백업 자동화
- [ ] 알림 설정 (Cloud Monitoring)
- [ ] A/B 테스팅 환경 구축
- [ ] 성능 프로파일링 