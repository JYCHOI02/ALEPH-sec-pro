# 21단계 작업 요약 (케셰브 보안 Agent)

이 문서는 보안 Agent **「케셰브」**의 21단계 **「학생용 실행 설명서와 시스템 구성도」**에서 구현한 문서화 작업과 핵심 보안 원칙을 정리한 작업 기록입니다.

---

## 1. 전체 목표

다른 작업자가 실제 작업 위치와 검증된 실행 명령을 확인하며 프로젝트를 스스로 설치·실행·검증할 수 있도록 완전한 실행 설명서(Runbook)를 제공하고, 시스템의 4대 핵심 구성요소와 데이터 흐름을 Mermaid 다이어그램 및 상세 설명 표로 투명하게 문서화합니다. 제공 코드와 학생 구현 영역을 명확히 구분하고, 실제 화면에 나타나는 실패 문구별 복구 절차 및 아직 확인되지 않은 항목을 정직하게 구분합니다.

* **작성 파일**: `docs/STUDENT_RUNBOOK.md` (신규 학생 실행 설명서)
* **연계 문서**: `summary_md/STEP_21_SUMMARY.md` 및 `docs/summary_md/STEP_21_SUMMARY.md`

---

## 2. 작성된 핵심 내용

### 1) 실행 절차 및 환경 명세 (`run_instructions`)
* **필요 런타임 및 버전**: Node.js `24.19.0` (외부 npm 의존성 없음, `npm install` 불필요).
* **PowerShell 실행 정책 회피**: Windows의 `npm.ps1` 실행 차단 이슈를 명시하고, 검증된 `npm.cmd run demo` 및 `node src/server.mjs` 명령어 안내.
* **작업 디렉토리**: 프로젝트 루트 `c:\Users\je004\OneDrive\Desktop\Aleph\sec_pro\on-client`.
* **정상 시작 신호 및 접속 주소**: 콘솔에 `http://127.0.0.1:5189` 출력 확인 및 브라우저 접속.
* **종료 및 재실행**: <kbd>Ctrl</kbd> + <kbd>C</kbd> 종료 후 재실행 절차 명시.

### 2) 시스템 4대 핵심 구성도 (`architecture`)
* **Mermaid 다이어그램**: 브라우저 UI ↔ 로컬 앱 서버 ↔ 접근 제어/XDR 엔진 ↔ 수업용 AI/OSV 게이트웨이 간 데이터 흐름 시각화.
* **글로 쓴 구성도 표**:
  1. **사용자 브라우저 (Web Client)**: `public/index.html`, `public/app.js`, `student/extension.mjs`, 주소 `http://127.0.0.1:5189`
  2. **로컬 앱 서버 (Local App Server)**: `src/server.mjs`, `src/engine.mjs`, 포트 5189
  3. **접근 제어 및 보안 원천 (SDP / XDR)**: `src/actions/sdp-action-engine.mjs`, `src/actions/store.mjs`
  4. **AI 게이트웨이 및 공개 DB (Gateway & OSV)**: `src/ai/service.mjs`, `src/vulnerabilities/project-scan.mjs`, `https://api.osv.dev/v1/querybatch`
* **보안 원칙**: 토큰, 열쇠, 비밀값 코드 및 문서 내 직접 노출 금지, XSS 방지(`textContent` 사용).

### 3) 제공 코드 vs 학생 코드 경계 (`provided_student_boundary`)
* `.on-starter-manifest.json` 해시 기반으로 경계 구분.
* **학생 구현 8대 함수 명세**:
  * `renderIdentity` (13단계): 계정, 기기, 세션 및 고유 모드 분리 표시
  * `renderDecision` (14단계): 업무 앱 접속 인가 판정 및 사유 표시
  * `renderEvents` (15단계): XDR 탐지 사건 및 근거 표시
  * `renderStatus` (16단계): 통합 보안 경보 통지 및 진단 정보 클립보드 복사
  * `renderAiConnection` (17단계): AI 게이트웨이 연결 상태, 모델명 및 네트워크 오류 분기
  * `renderExplanation` (18단계): 보안 사건 근거 연결 AI 분석 및 권한 상태 표시
  * `renderAction` (19단계): 11대 보안 조치 수명주기 및 실제 효과(`effectApplied: true`) 관측 분리
  * `renderVulnerabilities` (20단계): package-lock.json 설치 버전 대조, OSV 취약점 ID 보존, 미조회 왜곡 차단
* **제공 영역**: `src/*`, `public/*`, `tools/*`, `docs/*` 등 핵심 인프라 코드 수정 금지 준수.

### 4) 화면 실패 문구별 복구 가이드 (`failure_guide`)
* 실제 UI에 나타나는 7대 실패 문구 분석:
  * `연결 실패: ...` / `연결 없음`
  * `확인 불가 (unknown)`
  * `전체 조회 상태: 조회 준비 미완료 (not_configured)`
  * `전체 조회 상태: 아직 조회 안 함 (not_checked)`
  * `전체 조회 상태: lock 파일 확인 불가 (unverifiable)`
  * `조회 실패: 패키지 조회를 취소했습니다...`
  * `결과 불명 (unknown) · 효과 없음이나 성공으로 판단 금지`
* 각 상태별 근본 원인 및 단계별 확인/조치 절차 표 작성.

### 5) 실제 지원 범위 및 기다림(UNV) 목록
* **확인 완료 범위**: Windows PowerShell 환경에서의 구동, Node.js 버전 확인, 8대 학생 함수 모의/데모 렌더링, XSS 방지.
* **기다림(UNV) 범위**: 실제 상용 외부 SDP/XDR 방화벽 실시간 명령 집행, 실제 외부 유료 LLM API 추론, 폐쇄망 라이브 OSV 대량 쿼리.

---

## 3. 검증 결과

* **문서 검증 (`STUDENT_RUNBOOK.md`)**:
  * 마크다운 렌더링 및 링크 문법 이상 없음 확인.
  * Mermaid 문법 및 표 형식 이상 없음 확인.
  * 비밀값, 개인정보, API 키 및 토큰 노출 없음 확인.
* **절차 일치성 검증**:
  * 기술된 명령어(`npm.cmd run demo`, `node -v`, `node --check student/extension.mjs`)가 실제 PowerShell 환경의 동작과 100% 일치함을 확인.
