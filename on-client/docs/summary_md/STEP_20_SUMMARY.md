# 20단계 작업 요약 (케셰브 보안 Agent)

이 문서는 보안 Agent **「케셰브」**의 20단계 **「설치 패키지 버전과 알려진 취약점 조회 결과」**에서 구현한 기능과 핵심 보안 원칙을 정리한 작업 기록입니다.

---

## 1. 전체 목표

프로젝트에 실제 설치된 패키지의 정확한 버전을 OSV 취약점 정보와 대조하고, **출처·확인 시각·실패·미조회**를 왜곡 없이 엄격히 구분하여 표시합니다. 미조회(`not_checked`), 프로젝트 미설정(`not_configured`), 잠금 파일 검증 불가(`unverifiable`) 및 조회 실패(`error`, `partial`) 상태를 "취약점 없음"으로 오인하는 보안 착시를 원천 차단합니다.

* **수정 파일**: `student/extension.mjs` 내 `renderVulnerabilities`
* **표시 위치**: "보호 현황" 탭의 **[학생 패키지 조회 표시]** 영역 (`renderVulnerabilities`)

---

## 2. 구현한 핵심 기능

### 1) 4대 생명주기 상태 분기 및 이전 표 미잔류 (`refresh_replaces`, `stale_response_blocked`)
* **`idle`**: 조회 전 상태임을 명확히 표시 (`조회 전: 설치 패키지 취약점 조회가 아직 실행되지 않았습니다.`).
* **`loading`**: 조회 진행 중임을 명시하며, 이전 조회 표나 결과가 남아있지 않도록 즉시 정리.
* **`error`**: 조회 실패 상태 및 에러 메시지(`error.message` 또는 `error.code`)를 표시하고, 이전 결과를 현재 결과로 오인하지 않도록 안내.
* **`ok`**: 정상적으로 수신된 전체 상태 및 데이터 렌더링.

### 2) 5대 전체 조회 상태(`data.status`)의 원본 및 한국어 표시
| status | 상태 레이블 | 공식 안내 및 보안 원칙 |
|---|---|---|
| **`complete`** | `모두 조회 (complete)` | 허용된 모든 공개 패키지의 취약점 조회를 완료함. |
| **`partial`** | `일부 조회 실패 (partial)` | 일부 패키지의 조회가 실패했거나 확인할 수 없음. **조회 실패는 취약점 없음이 아님.** |
| **`not_checked`** | `아직 조회 안 함 (not_checked)` | 승인된 공개 패키지가 없거나 아직 조회하지 않음. **미조회는 취약점 없음이 아님.** |
| **`not_configured`** | `조회 준비 미완료 (not_configured)` | 프로젝트 조회 대상 경로 또는 승인 목록 설정이 필요함. |
| **`unverifiable`** | `lock 파일 확인 불가 (unverifiable)` | `package-lock.json` 잠금 파일을 검증할 수 없음. |

### 3) 잠금 파일 메타데이터 및 설치 목록 원천 대조
전달된 경우에만 선별하여 정의 목록(`<dl>`)으로 표시:
* **설치 목록 원천**: `package-lock.json과 설치된 node_modules 메타데이터 대조`
* **잠금 파일 버전 (`lockfileVersion`)**: 2 또는 3
* **잠금 파일 해시 (`lockfileHash`)**: 64자리 SHA-256 해시값 (패키지 변경 후 재조회 시 해시 변경 검증 가능)
* **조회 제외 건수 (`excluded.count`)**: 허용되지 않거나 검증 제외된 건수 표시
* **확인 일시 (`checkedAt`)**: ISO 8601 시각

### 4) 패키지 대조 표 및 `data-student-package-*` 속성 부여 (`exact_lock_version`)
* 패키지 목록이 빈 배열인 경우 상태별 안내(설정 필요, 미조회 등)를 출력하여 조회 실패를 결과 없음으로 왜곡하지 않음.
* 패키지 목록이 존재하는 경우 정형화된 테이블(`<table>`)로 렌더링:
  * 각 행(`<tr>`)에 필수 속성 **`data-student-package-name="<pkg.name>"`** 및 **`data-student-package-version="<pkg.version>"`** 지정.
  * `^1.2.0` 같은 버전 범위 표현이 아닌 **설치된 정확한 버전** 표시.
  * 패키지 상태 구분:
    * `known_vulnerabilities`: 알려진 항목 있음
    * `none_found`: 알려진 항목 없음 (조회 범위 내 알려진 취약점 없음)
    * `unverifiable`: 취약점이 존재하면 `일부 확인 · 전체 조회 확인 불가`, 없으면 `조회 확인 불가`
  * 출처(`source`) 및 확인 시각(`checkedAt`) 명시.

### 5) 취약점 ID 보존 (`partial_preservation`) 및 `none_found` 한계 안내
* 일부 조회 실패(`partial` 또는 패키지 `unverifiable`) 상황이라도 이미 서버에서 수신한 취약점 ID(`finding.id`)와 수정 시각(`finding.modified`)은 절대 지우지 않고 온전히 표시.
* 하단 안내 문구를 통해 `none_found`는 지정 시점·지정 DB 기준일 뿐이며, 소프트웨어 전체의 안전성을 보장하는 증명은 아님을 명시.

---

## 3. 핵심 보안 원칙 및 설계 근거

1. **미조회/실패와 무결성의 엄격한 분리 (`no_results_distinction`)**:
   * 네트워크 에러나 미설정 상태에서 "취약점 0건"이나 "안전함"으로 표기하면 심각한 보안 사각지대가 발생합니다. 미조회는 취약점 없음이 아니라는 원칙을 확립했습니다.
2. **범위 표현 배제 및 실제 설치 버전 대조 (`exact_lock_version`)**:
   * `package.json`의 semver 범위(`^`, `~`) 대신 `package-lock.json`과 설치된 `node_modules`의 실제 설치 버전을 대조하여 실제 실행 중인 코드를 기준으로 취약점을 확인합니다.
3. **부분 실패 시 기존 취약점 정보 보존 (`partial_preservation`)**:
   * 10개 패키지 중 1개가 타임아웃되었더라도, 나머지 9개에서 발견된 취약점 정보를 폐기하지 않고 보존하여 관제사에게 최선의 가시성을 제공합니다.
4. **DOM 조작 보안 및 시맨틱 UI (`textContent` 원칙)**:
   * 모든 텍스트는 `textContent`로만 주입하여 XSS 위험을 원천 차단하고, 색상에만 의존하지 않고 명확한 텍스트 라벨을 사용했습니다.

---

## 4. 검증 결과

* **문법 검사 (`npm run check`)**: `node --check student/extension.mjs` 구문 검사 통과.
* **단위 검증 (`test_step20.mjs`)**: 6개 핵심 시나리오 100% 정상 통과.
  * `idle`, `loading`, `error` 분기 및 표 미잔류 확인 (`refresh_replaces`, `stale_response_blocked`, `request_recovery`)
  * `not_configured`, `not_checked` 상태의 원본 레이블 및 왜곡 방지 확인 (`lookup_unavailable`, `no_results_distinction`)
  * `complete` 상태의 패키지 표 렌더링, 정확한 설치 버전 및 `data-student-package-*` 속성 부여 확인 (`exact_lock_version`, `osv_match`)
  * `partial` 상태에서 `unverifiable` 패키지의 기 수신 취약점 ID 보존 확인 (`partial_preservation`)
* **실제 화면 검증**: 로컬 데모 서버(`http://127.0.0.1:5189`)에서 제공 영역과 학생 영역의 `not_configured` 상태, 코드, 시각 일치 확인.
