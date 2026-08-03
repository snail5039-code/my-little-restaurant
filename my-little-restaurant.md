# 나만의 작은 맛집 — 기획문서

## 1. 서비스 개요

- **서비스명**: 나만의 작은 맛집
- **한 줄 설명**: 혼밥 또는 친구들과 먹기 좋은 식당들을 저장 및 추천 해주면서 체크할 수 있는 앱
- **컨셉**: 맛집 도장깨기 — 가고 싶은 식당을 저장해두고, 다녀온 곳은 체크하면서 별점/메모를 남기는 개인 맛집 기록 서비스

## 2. 기술 스택

| 구분 | 선택 | 비고 |
| --- | --- | --- |
| 프레임워크 | Next.js (App Router) | 프론트+API Route를 한 프로젝트에서 처리 |
| DB / 인증 / (추후) 파일 저장 | Supabase | Postgres DB + Auth + Storage 제공 |
| 지도 | 카카오맵 API | 국내 주소/좌표 정확도가 높음 |
| 로그인 | 소셜 로그인 (카카오, 구글) | Supabase Auth의 OAuth Provider 기능 사용 |

> Supabase Auth를 쓰면 이메일/비밀번호는 `auth.users`(Supabase 내부 테이블)에서 자동 관리되므로, 서비스에서 직접 만드는 `profiles` 테이블에는 비밀번호를 저장하지 않습니다.

## 3. 테이블 설계 (ERD)

### profiles (유저 프로필)

> Supabase Auth의 `auth.users`와 1:1로 연결되는 확장 테이블. `id`는 `auth.users.id`(uuid)를 그대로 사용.

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | auth.users.id 참조 (uuid, PK) |
| 2 | nickname | 닉네임 |
| 3 | phone | 전화번호 (선택) |
| 4 | provider | 로그인 경로 (kakao/google) |
| 5 | role | 일반/관리자 |
| 6 | created_at | 가입일 (자동) |
| 7 | updated_at | 수정일 |

### categories (카테고리)

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | (자동) |
| 2 | name | 카테고리명 (한식/중식/일식/양식/카페 등) |
| 3 | created_at | (자동) |

### restaurants (식당)

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | (자동) |
| 2 | name | 식당 이름 |
| 3 | category_id | categories 테이블 참조 |
| 4 | address | 주소 |
| 5 | latitude | 위도 (카카오맵 좌표) |
| 6 | longitude | 경도 (카카오맵 좌표) |
| 7 | visited | 다녀왔는지 (true/false) |
| 8 | alone_ok | 혼밥 난이도 (1~5) |
| 9 | rating | 별점 (1~5, 안 갔으면 비움) |
| 10 | memo | 한 줄 메모 |
| 11 | user_id | profiles 참조 (누가 등록했는지) |
| 12 | created_at | (자동) |

### reviews (리뷰)

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | (자동) |
| 2 | user_id | profiles 참조 |
| 3 | restaurant_id | restaurants 참조 |
| 4 | rating | 별점 |
| 5 | content | 내용 |
| 6 | created_at | 작성일 |
| 7 | updated_at | 수정일 |

### favorites (좋아요/즐겨찾기)

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | (자동) |
| 2 | user_id | profiles 참조 |
| 3 | restaurant_id | restaurants 참조 |
| 4 | created_at | 좋아요 클릭일 |

### menu (메뉴)

| # | 컬럼명 | 설명 |
| --- | --- | --- |
| 1 | id | (자동) |
| 2 | restaurant_id | restaurants 참조 |
| 3 | name | 메뉴 이름 |
| 4 | price | 메뉴 가격 |
| 5 | description | 메뉴 설명 |
| 6 | is_representative | 대표 메뉴 여부 (true/false) |

### 테이블 관계

- `auth.users` 1 : 1 `profiles`
- `profiles` 1 : N `restaurants` (한 유저가 여러 식당을 등록)
- `profiles` 1 : N `reviews`
- `profiles` 1 : N `favorites`
- `categories` 1 : N `restaurants`
- `restaurants` 1 : N `reviews`
- `restaurants` 1 : N `favorites`
- `restaurants` 1 : N `menu`

## 4. 화면 구성

### 4-1. 메인 화면 (`/`)

- **사이드바**: 좌측 고정 네비게이션
- **중앙**: 간단한 웹사이트 설명 (사진 포함)
- **우측**: 시작하기 및 사용 방법 안내
- **우상단**: 회원가입 버튼 → 카카오/구글 소셜 로그인으로 연결

### 4-2. 맛집 카드 리스트 / 지도 화면 (`/restaurants`)

- 상단에 **"카드 형식으로만 보기 / 지도로만 보기"** 토글 버튼
- **카드 뷰**: 맛집 카드(별점, 리뷰수, 상세보기)를 그리드로 나열, 카드에 메모장 기능 포함
- **지도 뷰**: 카카오맵 위에 `latitude`/`longitude` 기준으로 핀 표시, 핀 클릭 시 카드 정보 노출

### 4-3. 맛집 상세 화면 (`/restaurants/[id]`)

- 가게 사진
- 카테고리 / 가게 설명
- 평점
- 방문 여부 / 좋아요 수 / 혼밥 난이도
- 리뷰 수 / 리뷰 내용
- 메뉴 목록

### 4-4. 마이페이지 (`/mypage`)

- **좌측**: 최애 맛집 및 방문한 수를 간단하게 요약 표시 (카드형 요약 박스 3개)
- **우측**: 개인정보 수정 (토글로 열었다 닫을 수 있게), 닉네임/전화번호 등 입력 필드 (이메일/비밀번호는 소셜 로그인 계정 정보이므로 수정 불가)

## 5. 인증 흐름

1. 사용자가 "회원가입/로그인" 클릭 → 카카오 또는 구글 OAuth 화면으로 이동
2. Supabase Auth가 로그인 처리 후 `auth.users`에 계정 생성/조회
3. 최초 로그인 시 `profiles` 테이블에 해당 `user_id`로 프로필 row 생성 (닉네임 기본값은 소셜 계정 이름)
4. 이후 서비스 내 모든 데이터(restaurants, reviews, favorites)는 `profiles.id` 기준으로 연결

## 6. 미구현 (차후 구현 예정)

- 사진 업로드 (Supabase Storage 연동 예정)
- 친구 팔로우
- 댓글

## 7. 협업 가이드라인 (Claude 작업 시 참고)

- **배경**: 정보처리산업기사 자격 보유(국비지원 과정 이수). 직업군인으로 9년 근무 후 개발로 전향. 자바 기본기가 있고 현재 파이썬 학습 중. 개발 경험은 어느 정도 있는 편.
- **사용자 경험 수준**: 주니어 — 기본기는 있지만 Next.js/Supabase 등 이 프로젝트에서 쓰는 특정 기술은 낯설 수 있음. 새로운 개념이나 API를 도입할 때는 짧게라도 왜 필요한지 짚어줄 것.
- **배포 관련**: 배포 경험 자체가 적어서 불안해하는 편(실력 문제라기보다 경험 부족). Vercel 배포/환경변수 설정 등은 진행 전후로 어떤 단계인지, 왜 필요한지 짧게 짚어주고 실패 시 원인을 명확히 짚어줄 것.
- **협업 방식**: 설명보다 실행 우선. 배포, 계정 설정 변경처럼 승인이 필요한 작업이 아니면 먼저 진행하고 결과를 보고한다.
- **설명 스타일**: 적당히 자세하게 — 핵심 변경 사항과 이유 정도만 전달. 불필요한 배경 설명이나 장황한 부연은 생략.

## 8. 진행 상황 (2026-08-03 기준)

**완료**
- 라우트 구조: `/`(랜딩), `/restaurants`(카드·지도 토글), `/restaurants/[id]`(상세), `/mypage`
- 공통 사이드바 레이아웃, 맛집 카드 컴포넌트
- Supabase 스키마: restaurants/categories/profiles/reviews/favorites/menu + RLS (프로젝트 ID `fttlyjldmxzybkzkjfng`, 서울 리전)
- 카카오맵 연동 (`src/components/KakaoMap.tsx`) — Kakao Developers 앱 "나만의 작은 맛집"(ID 1532223)의 JS 키 사용, 로컬/Vercel 도메인 등록 완료
- 카카오 + 구글 소셜 로그인 (Supabase Auth, `@supabase/ssr`) — 로그인 시 `handle_new_user` 트리거로 profiles row 자동 생성, `/mypage`는 로그인 필요
  - Kakao: Kakao Developers 앱의 카카오 로그인 활성화, 동의항목(닉네임/프로필사진) 필수 설정, Redirect URI 등록 완료
  - Google: GCP 프로젝트 "my-little-restaurant" 생성, OAuth 동의화면 설정 후 **프로덕션으로 게시 완료** (테스트 사용자 제한 없음, 민감 스코프 미사용이라 검증 불필요)
- Vercel 환경변수에 `NEXT_PUBLIC_KAKAO_MAP_KEY` 등록 완료 (Production, Preview) — 다음 배포부터 지도 표시됨
- UI 아이콘 정리: 이모지 대신 `lucide-react` 라이브러리 아이콘으로 교체 (랜딩/사이드바/카드/상세/마이페이지 전반)
- 로그인 가드: `/mypage` 미로그인 시 안내 문구 + 로그인 버튼만 노출, `맛집 등록` 버튼도 미로그인 시 비활성 안내로 대체
- 쓰기(write) 기능 1차 구현
  - 맛집 등록: `/restaurants`의 "맛집 등록" 모달 (`RegisterRestaurantModal.tsx`) — 이름/카테고리/주소/혼밥난이도/메모 입력, 주소는 카카오 Geocoder로 좌표 자동 변환 후 저장
  - 메모 수정: 맛집 카드에서 본인이 등록한 가게만 인라인으로 메모 수정 가능 (RLS로 소유자만 UPDATE 허용)
  - 마이페이지: 실제 로그인 사용자의 방문 수(등록한 가게 중 `visited=true`)/즐겨찾기 수/즐겨찾기 목록을 Supabase에서 조회해 표시, 닉네임·전화번호 수정 폼 실제 반영 (`src/app/restaurants/actions.ts`, `src/app/mypage/actions.ts`의 Server Action)

**남은 것 / 다음 세션 시작점**
- 즐겨찾기(하트) 토글 버튼 자체는 아직 없음 — 마이페이지는 데이터를 읽어오지만, 카드/상세에서 즐겨찾기를 누르는 UI는 미구현
- 리뷰 작성 폼 미구현 (상세 페이지는 리뷰 조회만 가능)
- 방문 여부(`visited`) 토글 UI 없음 — DB 컬럼은 있지만 사용자가 직접 체크할 방법이 아직 없음
- 사진 업로드(Supabase Storage), 친구 팔로우, 댓글은 기획 단계에서도 "차후 구현"으로 분류됨 (6번 항목 참고)
- 이번 세션에서는 다른 세션이 로컬 dev 서버(포트 3000)를 점유하고 있어 브라우저로 직접 클릭 테스트는 못 했음 — `npm run build` 통과는 확인함. 다음에 열 때 실제 로그인 → 등록 → 메모 수정 플로우 한 번 확인 필요
