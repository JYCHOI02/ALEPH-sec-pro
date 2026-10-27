# 21단계 작업 요약 (케셰브 보안 Agent)

이 문서는 보안 Agent **「케셰브」**의 21단계 **「학생용 실행 설명서와 시스템 구성도」**에서 구현한 문서화 작업과 핵심 보안 원칙을 정리한 작업 기록입니다. (공식 AI 심사 피드백 2차 보강 완료)

---

## 1. 전체 목표

다른 작업자가 실제 작업 위치와 검증된 실행 명령을 확인하며 프로젝트를 스스로 설치·실행·검증할 수 있도록 완전한 실행 설명서(Runbook)를 제공하고, 시스템의 핵심 구성요소와 데이터 흐름을 Mermaid 다이어그램 및 상세 설명 표로 투명하게 문서화합니다. 제공 코드와 학생 구현 영역을 명확히 구분하고, 실제 화면에 나타나는 실패 문구별 복구 절차 및 아직 확인되지 않은 항목을 정직하게 구분합니다.

* **작성 파일**: `docs/STUDENT_RUNBOOK.md` (학생 실행 설명서 최종 개정판)
* **연계 문서**: `summary_md/STEP_21_SUMMARY.md` 및 `docs/summary_md/STEP_21_SUMMARY.md`

---

## 2. 2차 심사 피드백 반영 및 최종 보강 내용

### 1) 실제 API 엔드포인트 경로 일치 (`architecture_matches_source`)
* 구성도(Mermaid) 및 요청 흐름의 API 경로를 실제 `src/server.mjs`의 라우트와 100% 일치시킴:
  * 사용자 정보 조회: `/api/identity` ➔ **`GET /api/me`**
  * AI 사건 설명: `/api/explanation` ➔ **`POST /api/ai/explain`**
  * 업무 앱 접속 판정: **`POST /api/access`**
  * 원천 조치 라우트: **`POST /api/actions/prepare`**, **`/execute`**, **`/result`**

### 2) 실제 UI 버튼 이름 및 점검 경로 일치 (`failure_guide_matches_source`)
* **점검 경로**: 장애 발생 시 브라우저 Network 탭에서 점검할 경로를 `/api/identity`에서 실제 엔드포인트인 **`/api/me`**로 수정.
* **도움정보 버튼 이름 대조**:
  * 제공 UI 버튼: **`[도움정보 불러오기]`** (`id="diag-load"`), **`[확인했으며 복사합니다]`** (`id="diag-copy"`)
  * 학생 구현 버튼: **`[도움정보 복사]`** (`student/extension.mjs`의 `renderStatus`)
* **연결 실패와 데모 모드의 명확한 구분**:
  * `npm.cmd run demo`는 예제 자료(모의 데이터)로 화면 컴포넌트 렌더링을 확인하기 위한 '테스트 모드'일 뿐이며, 백엔드 서버나 호스트 연결 실패의 실제 복구 절차가 아님을 명시.
  * 실제 연결 복구는 로컬 서버 프로세스 실행 여부 확인(`npm.cmd start` / `node src/server.mjs`) 및 네트워크 어댑터 점검으로 기술.

### 3) 8대 학생 함수 및 제공 인프라 경계 확립 (`provided_student_boundary`)
* `.on-starter-manifest.json` 해시 대조를 통해 `student/engine-adapter.mjs`는 제공 어댑터 틀임을 명시.
* 학생이 작성하는 유일한 코드는 **`student/extension.mjs` (13~20단계 8대 UI 렌더링 함수)** 뿐임을 확립.

### 4) 지원 버전 엄격화 (`run_instructions_match_source`, `support_scope_honest`)
* `package.json`의 선언 버전인 **`Node.js 24.19.0` (실행 허용 범위: 22~24)**로 명확히 한정하고, 20·21 버전은 미지원/미확인으로 분리.
* 작업 디렉토리는 개인 PC 절대 경로를 배제하고 Git 저장소 기준 **`cd on-client` 상대 경로**로 일반화.

---

## 3. 검증 결과

* **문서 검증 (`STUDENT_RUNBOOK.md`)**:
  * `/api/me`, `POST /api/ai/explain` 경로 전수 검사 완료 (오기재 0건 확인).
  * `[도움정보 불러오기]`, `[확인했으며 복사합니다]`, `[도움정보 복사]` 실제 버튼명 대조 완료.
  * 마크다운 렌더링 및 Mermaid 다이어그램 구문 오류 없음 확인.
* **구문 검사 (`node --check`)**: `student/extension.mjs` 구문 무결성 확인 (정상 통과).
