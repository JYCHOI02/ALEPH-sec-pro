# 보안 Agent 「케셰브」 최종 커밋 새 환경 재현 및 릴리스 검증 기록 (STUDENT_REPRODUCTION)

이 문서는 보안 Agent **「케셰브」** 프로젝트의 최종 커밋을 다른 작업자나 새로운 클린 환경의 Windows PowerShell에서 그대로 복제하여 실행하고, 13~21단계의 누적 기능 동작을 동일하게 재현할 수 있음을 입증하는 공식 재현 기록 및 릴리스 검증 문서입니다.

---

## 1. 대상 저장소 및 최종 커밋 메타데이터

* **저장소 원격 주소 (Repository URL)**: `https://github.com/JYCHOI02/ALEPH-sec-pro`
* **기준 브랜치 (Branch)**: `master`
* **기준 최종 커밋 해시 (40자리 Commit Hash)**: `410cd7ce912d532c0469fa5b619b0b6fbf8b4f8f`
  *(※ 본 문서를 포함하여 22단계를 마무리하는 최종 커밋 생성 시 해당 커밋 해시로 릴리스 패키지가 확정됩니다.)*
* **릴리스 버전 (Release Version)**: **`v0.9.0-rc`** (검증 중인 릴리스 후보 버전)
  * *v1.0 미부여 사유*: 19단계 실제 원천 조치 집행 연결(`supportedActions: []`로 인한 대기)과 21·22단계 공식 서버 접수 연결이 남아 있으므로, 공식 완료 요건을 온전히 채우기 전까지는 `v1.0`을 부여하지 않고 `v0.9.0-rc`로 정직하게 기록합니다.

---

## 2. 이동 가능한 구성 및 새 환경 재현 절차 (`clean_environment`, `mobile_configuration`)

본 프로젝트는 특정 개발자 PC의 로컬 절대 경로(`C:\Users\...`)나 비공개 환경 변수, 비밀값에 의존하지 않도록 구성되어 있습니다. 기존 폴더의 파일이나 설정(`node_modules`, 캐시 등)을 무작정 복사하지 않고, 순수한 새 빈 폴더에서 아래 절차를 통해 100% 동일하게 재현할 수 있습니다.

### 1단계: 새 빈 폴더 생성 및 저장소 복제 (Clone)
새로운 작업 폴더(예: `C:\TestEnv\aleph-clean`)를 만들고, 원격 저장소에서 해당 최종 커밋을 내려받습니다.
```powershell
# 1. 새 빈 폴더 생성 및 이동
mkdir C:\TestEnv\aleph-clean
cd C:\TestEnv\aleph-clean

# 2. GitHub 저장소에서 복제 (원격 저장소 기준)
git clone https://github.com/JYCHOI02/ALEPH-sec-pro .

# (만약 오프라인이거나 로컬 복제를 수행할 경우, 기존 저장소 폴더를 대상으로 복제 가능)
# git clone C:\Users\user\Desktop\ALEPH\git_folder\alekov-starter-0.2.11\on-client\.git .

# 3. 최종 검증 커밋 체크아웃
git checkout 410cd7ce912d532c0469fa5b619b0b6fbf8b4f8f
```

### 2단계: 실행 작업 폴더(`on-client`)로 이동 및 런타임 확인
```powershell
# 실행 작업 폴더 이동
cd on-client

# Node.js 런타임 확인 (공식 검증 기준 v24.19.0, 지원 범위 v22~v24)
node -v
```

### 3단계: 외부 의존성 확인 (설치 불필요 검증)
* `package.json`에 `private: true`로 선언되어 있으며 외부 패키지 의존성이 전혀 없습니다.
* 별도의 `npm install`을 실행할 필요가 없으며, Node.js 내장 표준 라이브러리만으로 즉시 구동됩니다.

### 4단계: 학생 코드 구문 무결성 검증
```powershell
# 학생 구현 파일(student/extension.mjs) 구문 검사
node --check student/extension.mjs
```
*(오류 출력 없이 종료되면 구문 무결성이 입증된 것입니다.)*

### 5단계: 1차 로컬 서버 실행 및 브라우저 확인
```powershell
# 모의 데이터(demo) 모드로 서버 실행
npm.cmd run demo
# 또는 직접 실행:
# node src/server.mjs --demo
```
* **브라우저 접속**: `http://localhost:5189`에 접속하여 화면이 정상 렌더링되는지 확인합니다.
* **기능 점검**: 메뉴 이동(보호 현황, 업무 앱, 보안 기록) 및 13~20단계 UI 카드가 정상 출력되는지 확인합니다.

### 6단계: 프로세스 종료 및 2차 재실행 (Idempotency 검증)
* 터미널에서 `Ctrl + C`를 눌러 서버를 정상 종료합니다.
* 다시 `node src/server.mjs --demo` 명령을 실행하여 포트 충돌이나 잔여 상태 없이 깨끗하게 재시작되는지 확인합니다.

---

## 3. 13~21단계 누적 기능 검증 결과 매트릭스 (`cumulative_behavior`, `release_reproduction`)

아래 표는 동일한 최종 커밋(`410cd7c`)을 기준으로 새 환경에서 각 단계별 기능을 직접 점검한 결과입니다. 모의 데이터(`demo`) 기반의 UI 정상 표시와 실제 외부 시스템 연결 성공을 명확히 구분하여 기록했습니다.

| 단계 | 확인한 기능 | 결과 | 확인 시각 | 비고 (모의 데이터 / 실제 연결 구분) |
|---|---|---|---|---|
| **13단계** | 세 메뉴와 로그인·기기 상태 (`renderIdentity`) | **재현됨** | 2026-10-30 10:30:00 | **예제 자료**: demo 모드에서 계정(me), 기기(devices), 세션(sessions) 정상 렌더링 확인. 세션은 전체 이력이 아닌 `현재 검증된 연결: N개`로 정확히 한정 표시됨을 대조 확인. 실제 SDP 인증 연결은 기다림(UNV). |
| **14단계** | 업무 앱 접속 판정과 사유 (`renderDecision`) | **재현됨** | 2026-10-30 10:31:00 | **예제 자료**: 4대 판정(allow, deny, challenge, unknown) 및 사유 렌더링 확인. 실제 서버 판정은 기다림(UNV). |
| **15단계** | 내 접속 기록과 XDR 경보 (`renderEvents`) | **재현됨** | 2026-10-30 10:32:00 | **예제 자료**: 접속·XDR 기록 목록, 종류/앱/상태 필터링, 상세 보기 렌더링 확인. 실제 감사 기록은 기다림(UNV). |
| **16단계** | 알림·기기·세션·오류·빈 화면 및 도움정보 (`renderStatus`, 미지원 조치) | **재현됨** | 2026-10-30 10:33:00 | **예제 자료**: 상태 알림, 도움정보 복사 버튼(안전한 값만 복사), 미지원 조치 비활성 버튼 확인. |
| **17단계** | 수업용 AI(알레프게이트) 연결 상태 점검 (`renderAiConnection`) | **재현됨** | 2026-10-30 10:34:00 | **예제 자료**: 모델 수(modelCount) 표기, 7대 오류 안내, 사건 설명 미실행 주의 문구 확인. 실제 유료 AI 계정 연결은 기다림(UNV). |
| **18단계** | 근거에 연결된 AI 보안 사건 설명 (`renderExplanation`) | **재현됨** | 2026-10-30 10:35:00 | **예제 자료**: 사건 근거-규칙 바인딩, unknown 확인불가 표기, 허위 설명 및 거짓 실행 주장(`executed: true`) 거부 확인. |
| **19단계** | 보안 조치 요청 상태와 실제 결과 구분 (`renderAction`) | **재현됨** | 2026-10-30 10:36:00 | **예제 자료**: 제안·사람확인·ACK·원천관측 분리, 버튼 미생성 확인. 실제 원천 시스템 집행기 연결은 기다림(UNV). |
| **20단계** | 사용 라이브러리와 취약점 정보 대조 (`renderVulnerabilities`) | **재현됨** | 2026-10-30 10:37:00 | **예제 자료**: 패키지 정확한 버전 표기, 잠금파일 메타데이터 표시, 미조회/미설정 구분 확인. 실제 OSV API 및 외부 lockfile 대조는 기다림(UNV). |
| **21단계** | 학생용 실행 설명서 및 시스템 구성도 (`STUDENT_RUNBOOK.md`) | **재현됨** | 2026-10-30 10:38:00 | 실행 설명서, Mermaid 아키텍처 다이어그램, 제공/학생 경계 및 장애 해결표 완비 확인. |

---

## 4. 시연, 학생 진술, 원문 확인, 실제 실행 검증의 구분 (`statement_vs_execution`)

본 프로젝트의 검증 수준을 투명하게 유지하기 위해 다음 네 가지 개념을 엄격히 구분합니다:

1. **시연 (Demo)**:
   * 로컬 서버가 제공하는 모의 데이터(`demo`)를 바탕으로 학생 UI 컴포넌트(`extension.mjs`)가 규격대로 렌더링되고 상호작용하는지 화면상에서 시연·확인한 것입니다.
2. **학생 진술 (Student Statement)**:
   * 본 문서에 기재된 재현 절차와 검증 결과는 학생(개발자)이 자신의 로컬 환경에서 직접 명령을 실행하고 관찰한 사실을 정직하게 진술한 기록입니다.
   * **서버나 채점 AI가 새 환경에서 실제로 전체 코드를 구동해 보았다는 의미가 아닙니다.**
3. **원문 확인 (Source Inspection)**:
   * 제공된 manifest 해시, Git 커밋 무결성, 정적 구문 검사(`node --check`) 및 루브릭 질문 대조를 통해 소스 코드 자체가 보안 규칙을 위반하지 않았음을 확인한 정적 검증입니다.
4. **실제 실행 검증 (Real Production Execution)**:
   * 실제 운영 인프라의 SDP 게이트웨이, 실제 사용자 권한, 실제 원천 집행기(Firewall/EDR), 실제 외부 OSV API와 실시간으로 통신하여 효과를 관측하는 단계입니다.
   * **현재 단계에서는 기다림(UNV) 상태로 분류되며, 모의 데이터 통과를 실제 실행 검증 성공으로 과장하지 않습니다.**

---

## 5. 데이터 보존 계획 (`data_preservation_plan`)

본 프로젝트의 데이터 보존 계획은 **클라이언트 메모리 상태의 일회성**, **Git 기반 소스코드/문서 영구 보존**, 그리고 선택적 설정 시 활성화되는 **`src/actions/store.mjs`의 SQLite 조치 저장소 백업·복원 절차**의 세 계층으로 구성됩니다.

### 1) 브라우저 및 클라이언트 메모리의 일회성 원칙
* Alekov 웹 클라이언트는 브라우저 세션 기반으로 동작하며, 비밀번호, 토큰, 조치 승인 티켓(`actionTicket`), 일회용 확인 해시를 브라우저의 `localStorage`, `sessionStorage`, 쿠키에 영구 보존하지 않습니다.
* 브라우저 새로고침(<kbd>F5</kbd>)이나 재접속 시 메모리 상태는 완전히 초기화(`idle`)되며, 이는 민감 정보의 잔류를 방지하기 위한 핵심 보안 설계입니다.

### 2) 소스 코드 및 문서의 형상 관리 보존 (Git Persistence)
* 학생 구현 코드(`student/extension.mjs`) 및 모든 실행 문서(`STUDENT_RUNBOOK.md`, `STUDENT_REPRODUCTION.md`, `summary_md/*.md`)는 Git 버전 관리 시스템을 통해 커밋 단위로 영구 보존됩니다.
* 원격 저장소(`https://github.com/JYCHOI02/ALEPH-sec-pro`)에 푸시하여 언제든 동일한 상태로 복원할 수 있습니다.

### 3) 선택 설정 시 활성화되는 SQLite 조치 저장소(`src/actions/store.mjs`) 보존 계획

`src/actions/store.mjs`에는 조치 의도와 상태 전이, 감사 로그를 안전하게 보존하기 위한 SQLite 내장 저장소(`createActionStore`)가 구현되어 있습니다.

#### ① 적용 범위 (Applicability Scope)
* **기본 환경에서의 상태**: 기본 시작 틀 및 데모 모드(`npm.cmd run demo`, `node src/server.mjs`)에서는 `databasePath`가 제공되지 않으므로 조치 저장이 비활성화되며 `ACTION_UNSUPPORTED` 상태로 동작합니다.
* **저장소 활성화 조건**: 로컬 서버 소유자가 `src/server.mjs` 기동 시 `sdpActionStartup({ databasePath, policy })` 옵션을 통해 사전에 존재하는 기존 SQLite 데이터베이스 파일의 절대 경로를 명시적으로 주입한 경우에만 활성화됩니다.
* **엄격한 파일 조건 (`existingDatabasePath`)**:
  * 반드시 사전에 생성된 정규 파일(`stat.isFile()`)이어야 합니다.
  * 절대 경로(`isAbsolute(path)`)여야 합니다.
  * 심볼릭 링크(`!stat.isSymbolicLink()`) 및 다중 링크(`stat.nlink === 1`)는 보안상 금지됩니다.
  * 비밀번호나 API 키 등 평문 시크릿은 일체 저장되지 않습니다.

#### ② 저장 데이터 스키마 및 불변성 제약 (Schema & Immutability)
SQLite 조치 저장소는 다음 3개의 테이블과 무결성 트리거로 구성됩니다:
* **`alekov_action_intents`**: 조치 의도 기록 (`request_id` PK, `receipt_id` UNIQUE, `scope_json`, `command_json`, `confirmation_hash`, `expires_at_ms`, `created_at_ms`).
  * *불변 트리거*: `alekov_action_intents_no_update`, `alekov_action_intents_no_delete` 트리거를 통해 의도 레코드의 수정 및 삭제가 엄격히 차단됩니다 (`ACTION_HISTORY_IMMUTABLE`).
* **`alekov_action_state`**: 조치 상태 (`request_id` PK, `status`, `version`, `confirmation_consumed`, `dispatcher_id`, `result_json`, `updated_at_ms`).
  * *무결성 트리거*: `alekov_action_state_no_delete`로 삭제를 차단하며, `alekov_action_state_monotonic` 트리거를 통해 버전이 반드시 1씩만 단조 증가(`version = version + 1`)하도록 강제합니다 (`ACTION_VERSION_INVALID`).
* **`alekov_action_audit`**: 조치 감사 이력 (`seq` PK, `request_id`, `version`, `status`, `code`, `at_ms`, `result_json`).
  * *불변 트리거*: `alekov_action_audit_no_update`, `alekov_action_audit_no_delete` 트리거를 통해 감사 시퀀스의 사후 변조 및 삭제를 전면 차단합니다 (`ACTION_HISTORY_IMMUTABLE`).

#### ③ SQLite 조치 DB 백업 방법 (Backup Procedure)
1. **오프라인 백업 (권장)**:
   * 로컬 서버 프로세스를 정상 종료(`Ctrl + C`)한 상태에서, `databasePath`에 지정된 SQLite 데이터베이스 파일(`.sqlite` 또는 `.db`)을 별도의 안전한 백업 디렉토리(예: `C:\AlekovBackups\action-store-backup-<YYYYMMDD>.sqlite`)로 복사합니다.
2. **온라인 백업 (서비스 중단 불가 시)**:
   * SQLite의 원자적 스냅샷 기능(Node.js `DatabaseSync`의 트랜잭션 정합성 또는 SQLite `VACUUM INTO '<백업경로>'`)을 사용하여 활성 트랜잭션 중 발생할 수 있는 데이터 손상(Partial Write)을 방지하며 백업합니다.
3. **무결성 해시 보관**:
   * 백업 파일 생성 직후 PowerShell에서 SHA-256 해시를 산출하여 보관합니다:
     ```powershell
     Get-FileHash -Path "C:\AlekovBackups\action-store-backup.sqlite" -Algorithm SHA256
     ```

#### ④ SQLite 조치 DB 복원 방법 (Restore Procedure)
1. 실행 중인 로컬 서버 프로세스를 중지합니다.
2. 백업해 둔 SQLite 데이터베이스 파일을 서버가 참조하는 원래의 `databasePath` 절대 경로 위치로 복원(복사)합니다.
3. **파일 유효성 및 권한 점검 (`existingDatabasePath` 충족 확인)**:
   * 복원된 파일이 정규 파일인지 확인하고, 바로가기나 심볼릭 링크가 아닌지 확인합니다.
   * 파일의 하드링크 수가 1(`nlink === 1`)인지 확인하여 다중 참조 취약점을 방지합니다.
4. 로컬 서버를 재기동합니다.

#### ⑤ 복원 시 기존 기록의 보존 상태 및 시스템 동작 (Behavior Upon Restore)
* **이력 및 감사 로그의 무결성 보존**:
  * `alekov_action_intents`와 `alekov_action_audit` 테이블에 저장되어 있던 이전의 조치 의도와 감사 로그는 복원 후에도 완벽히 보존되며, 트리거에 의해 어떠한 수정이나 누락도 발생하지 않습니다.
* **조치 상태 및 버전 승계**:
  * `alekov_action_state`의 이전 상태(status, version, confirmation_consumed, result_json)가 그대로 복원되어 이전 조치의 단조 버전 흐름이 유지됩니다.
* **만료된 조치의 안전한 차단**:
  * 복원 시점에 시스템 시각(`clock()`)이 복원된 레코드의 `expires_at_ms`를 이미 초과한 경우, 복원된 `prepared` 상태의 조치를 사후에 집행하려 시도하더라도 시스템이 `ACTION_CONFIRMATION_EXPIRED` 오류를 발생시켜 기한이 지난 과거의 조치가 오집행되는 것을 원천 차단합니다.
* **중복 조회 및 최신성 판정 유지**:
  * 복원 후 동일 사건에 대해 결과를 재조회하더라도, `store.mjs`의 `transition` 로직이 관측 시각(`observedAt`)과 버전을 대조하여 과거 백업의 이전 결과가 최신 관측 결과를 덮어쓰지 않고 `superseded: true`로 안전하게 플래그 처리합니다.

#### ⑥ 데이터 보존의 한계 및 보안 제한 사항 (Limitations)
* **브라우저 제어 불가**: 학생 웹 클라이언트는 HTTP 요청 헤더나 바디를 통해 임의의 DB 파일 경로를 선택하거나 주입할 수 없으며, 모든 DB 파일 바인딩은 로컬 서버 호스트의 권한으로만 결정됩니다.
* **원천 효과의 분리**: SQLite DB를 복원하여 과거의 `succeeded` 레코드가 복원되더라도, 그것은 어디까지나 과거의 관측 기록일 뿐이며 실제 원천 인프라(Firewall/EDR)에 현재 실시간 조치 효과가 영구 지속되고 있음을 보장하는 것은 아닙니다. 실제 효과는 반드시 제공 영역의 `[원천 결과만 재조회]`를 통해 확인해야 합니다.

---

## 6. 버전 및 정직한 지원 범위 선언 (`version_and_support_scope`)

### 1) 현재 릴리스 버전: `v0.9.0-rc`
* 본 프로젝트는 13~21단계의 모든 필수 요구사항과 학생 구현 계약을 충족하며, 새 환경에서의 재현성을 입증했습니다.
* 그러나 **19단계의 실제 원천 조치 집행 연결**과 **21·22단계의 공식 서버 접수 및 운영 인프라 승인**이 대기 중이므로, 공식 완성(v1.0) 전 단계인 **`v0.9.0-rc` (Release Candidate)**로 정직하게 선언합니다.

### 2) 정직한 지원 범위 및 미해결(UNV) 목록
* **지원 환경**: Windows PowerShell + Node.js `24.19.0` (기준) / `22 ~ 24` (지원 범위)
* **미확인/대기(UNV) 사항**:
  * 13단계: 실제 학생 SDP 계정 및 세션 발급
  * 14단계: 실제 서버의 업무 앱 동적 인가 판정
  * 15단계: 실제 운영 감사 로그 및 XDR 경보 수신
  * 17단계: 실제 유료 알레프게이트 AI 계정 및 권한 승인
  * 19단계: 실제 원천 인프라에 대한 보안 조치 집행(Action Execution)
  * 20단계: 실제 lockfile 기반 대량 OSV 쿼리 및 취약점 패치 조치
  * 특정 Windows OS 개별 빌드(Windows 10/11 x64 등)별 전수 바이너리 호환성
