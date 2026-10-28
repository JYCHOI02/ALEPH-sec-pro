# 21단계 작업 요약 (케셰브 보안 Agent)

이 문서는 보안 Agent **「케셰브」**의 21단계 **「학생용 실행 설명서와 시스템 구성도」**에서 구현한 문서화 작업과 핵심 보안 원칙을 정리한 작업 기록입니다. (공식 AI 심사 4차 피드백 최종 보강 완료)

---

## 1. 전체 목표

다른 작업자가 실제 작업 위치와 검증된 실행 명령을 확인하며 프로젝트를 스스로 설치·실행·검증할 수 있도록 완전한 실행 설명서(Runbook)를 제공하고, 시스템의 핵심 구성요소와 데이터 흐름을 Mermaid 다이어그램 및 상세 설명 표로 투명하게 문서화합니다. 제공 코드·문서와 학생 작성 영역을 명확히 구분하고, 실제 화면에 나타나는 실패 문구별 복구 절차 및 아직 확인되지 않은 항목을 정직하게 구분합니다.

* **작성 파일**: `docs/STUDENT_RUNBOOK.md` (학생 실행 설명서 최종 개정판)
* **연계 문서**: `summary_md/STEP_21_SUMMARY.md` 및 `docs/summary_md/STEP_21_SUMMARY.md`

---

## 2. 심사 피드백 반영 및 최종 정밀 보강 내용

### 1) AI API 구성도 메서드 및 경로 일치 (`architecture_matches_source`)
* 구성도(Mermaid)에서 AI API를 `GET`으로 표시하던 오류를 바로잡고, 실제 `src/server.mjs`의 라우터와 100% 일치하도록 수정:
  * **사건 설명**: `POST /api/ai/explain`
  * **AI 연결 점검**: `POST /api/ai/check`
  * **AI 연결 수명주기**: `POST /api/ai/connect/*`
  * 구성도 화살표: `HTTP -- "POST /api/ai/explain, POST /api/ai/check (사건 설명 및 연결 점검)" --> AIService`
  * 서버에서 AI 관련 경로는 모두 POST로 처리되며 GET 방식은 존재하지 않음을 구성도 및 역할 대조표에 명시.

### 2) 요청 세대(`generation`) 관리와 서버 타임아웃 위치 분리 (`architecture_matches_source`)
* 세대 관리(`generation`)와 타임아웃 관리의 코드 원문 실제 위치 분리 반영:
  * **브라우저 클라이언트 (`public/app.js`)**: 세대 값(`let generation = 0`)이 브라우저 코드에 정의되어 있으며, `loadAll()` 실행 시 세대 번호(`++generation`)를 증가시켜 이전 세대의 지연 응답(GET, 판정, AI)이 최신 화면을 덮어쓰지 않도록 무효화하는 역할을 담당함.
  * **서버 라우터 (`src/server.mjs`)**: 세대 관리가 아닌 `requestTimeoutMs`(15초) 및 `readTimeoutMs`(10초) 기반 `AbortController` 수명주기 및 요청 타임아웃(`REQUEST_TIMEOUT`) 처리를 담당함.
  * Mermaid 다이어그램 및 구성요소 역할 대조표에서 세대 관리를 브라우저(`public/app.js`)로 이동하고 서버 라우터에는 서버 타임아웃 관리로 분리 배치 완료.

### 3) 학생 작성 파일/문서와 제공 파일 경계 명확화 (`provided_student_boundary`)
* '유일한'이라는 표현이 **실행 가능한 소스 코드 파일(JavaScript 코드)**에만 한정됨을 명시:
  * **학생 작성 소스 코드**: `student/extension.mjs` (유일한 학생 작성 실행 코드 파일; 13~20단계 8대 UI 렌더링 함수 구현)
  * **학생 작성 문서**: `docs/STUDENT_RUNBOOK.md` (21단계 공식 실행 설명서), `summary_md/*.md` (단계별 작업 요약)
* 제공 원천 인프라와 명확히 분리:
  * 제공 코드: `student/engine-adapter.mjs` (manifest 원천 해시 등록), `src/` (백엔드 서버), `public/` (프론트엔드 UI), `tools/` (실행 도구), `package.json`, `.on-starter-manifest.json`
  * 제공 문서: `docs/` 내의 `CURRICULUM.json`, `STUDENT_PROMPTS.md`, `STUDENT_LAUNCH_GUIDE.md` 등 수업 안내서

### 4) 운영체제 지원 표현 정직한 한정 (`support_scope_honest`)
* 현재 저장소의 소스 코드 및 설정(`tools/start-alekov.ps1`, `package.json`)에는 특정 Windows 10 vs 11 및 64-bit 아키텍처를 식별·판별하는 별도 로직이 없음을 명시.
* 확인 범위를 **'Node.js 22~24 및 Windows PowerShell이 구동되는 일반 Windows 환경'**으로 정직하게 표현을 좁히고, Windows 10·11 개별 빌드별 전수 호환성은 기다림(UNV)으로 분리.

### 5) 취약점 기능 및 화면 검증의 실제 검증 범위 (`support_scope_honest`)
* **실제 확인 범위**:
  * `renderVulnerabilities` 함수의 6대 스캔 상태 분기 및 `data-student-package-*` 속성 바인딩 로직 구현 확인.
  * 기본 시작 틀(루트에 `package-lock.json` 및 `ON_PROJECT_DIRECTORY` 부재) 환경에서 `GET /api/vulnerabilities` 호출 시 `{ status: 'not_configured', code: 'PROJECT_NOT_CONFIGURED', packages: [] }` 기본 계약 응답 확인.
* **기다림(UNV) 분류**:
  * 실제 `package-lock.json` 분석, 공개 OSV API(`https://api.osv.dev/v1/querybatch`) 대량 쿼리, 실제 CVE/GHSA 매칭 결과 수신은 프로젝트 lockfile 및 외부 통신 대기 상태(`기다림(UNV)`).
  * 공식 AI 심사는 코드 원문 정적 분석 기준이므로, 브라우저 런타임 상의 실시간 취소/타임아웃 동적 화면 검증을 단정하지 않고 런타임 인증 대기(`기다림(UNV)`)로 정직하게 명시.

---

## 3. 자체 검증 결과

* **문서 검증 (`STUDENT_RUNBOOK.md`)**:
  * Mermaid 다이어그램: 브라우저 상자에 `요청 세대(generation) 관리`, 서버 라우터에 `서버 타임아웃(requestTimeoutMs) 관리`로 분리 확인.
  * Mermaid 화살표: `POST /api/ai/explain, POST /api/ai/check` 반영 확인.
  * 실행 환경 표현: `Windows PowerShell 및 Node.js 22~24`로 한정 및 UNV 분리 확인.
  * 학생 작성 소스 코드(`extension.mjs`)와 학생 작성 문서(`STUDENT_RUNBOOK.md`, `summary_md/`) 분리 표기 확인.
  * 취약점 기능의 정적 계약 확인 및 라이브 OSV 조회의 UNV 분리 확인.
* **구문 검사 (`node --check`)**: `student/extension.mjs` 문법 무결성 100% 정상 통과.
