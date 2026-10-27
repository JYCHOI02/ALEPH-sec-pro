# 19단계 작업 요약 (케셰브 보안 Agent)

이 문서는 보안 Agent **「케셰브」**의 19단계 **「보안 조치 요청 상태와 실제 결과 구분」**에서 구현한 기능과 핵심 보안 원칙을 정리한 작업 기록입니다.

---

## 1. 전체 목표

AI 조치 제안과 실제 원천 시스템의 집행 처리를 엄격히 분리하고, **조치 준비(사람 확인 필요) → 서버 전달 중 → 서버 접수(ACK) → 원천 효과 관측**의 전체 수명주기 상태를 사용자에게 명확히 구분하여 전달합니다. 서버 접수 응답(ACK)이나 시간 초과, 결과 불명을 성공이나 효과 없음으로 단정하지 않고, 원천 시스템에서 실제 효과(`observation.effectApplied === true`)가 관측된 경우에만 성공으로 표시합니다.

* **수정 파일**: `student/extension.mjs` 내 `renderAction` (학생 조치 상태 표시 영역)
* **표시 위치**: "보안 기록" 탭의 **[학생 조치 상태 표시]** 영역 (`renderAction`)

---

## 2. 구현한 핵심 기능

### 1) 11대 조치 상태의 명확한 상태 분기 및 전문 안내
| status | 상태 레이블 | 핵심 화면 안내 및 보안 원칙 |
|---|---|---|
| **`idle`** | `아직 미실행 (idle)` | 조치 제안은 아직 실행되지 않았음을 명시. AI 제안만으로 조치가 자동 집행되지 않음을 보장. |
| **`loading`** | `조치 준비 또는 결과 조회 중… (loading) · 완료 아님` | 원천 시스템에 조치를 준비하거나 실행 결과를 재조회하는 중이며 아직 완료되지 않았음을 안내. |
| **`prepared`** | `준비됨·미실행 (prepared)` | 조치가 준비되었으나 아직 실행되지 않았음(미실행)을 명시. 사람 확인 기한(`confirmationExpiresAt`)과 대상(`target`)을 확인하고 제공 화면 버튼으로 승인하도록 안내. |
| **`executing`** | `서버에 전달 중 (executing) · 결과 아직 없음` | 사람 확인을 거쳐 서버로 전송 중이며, 결과가 아직 확인되지 않았으므로 완료/성공이 아님을 명시. |
| **`pending`** | `서버 접수·처리 중 (pending) · 서버 접수(ACK)는 완료나 효과가 아님` | **서버의 접수 응답(ACK)을 실제 조치 완료나 효과로 오인하지 않도록 차단.** 결과는 별도로 확인해야 함을 명시. |
| **`succeeded`** | `효과 확인 (succeeded)` | **`observation?.effectApplied === true`일 때만 제한적으로 수용.** 관측 시각과 영수증 ID를 표시. |
| **`denied`** | `원천 거절 (denied)` | 원천 정책에 의해 조치가 거절되었음을 사유와 함께 안내. |
| **`failed`** | `원천 실패 (failed)` | 원천 처리 중 실패가 발생했음을 사유와 함께 안내. |
| **`unknown`** | `결과 불명 (unknown) · 효과 없음이나 성공으로 판단 금지` | 결과를 알 수 없음을 알리고, 성공이나 효과 없음으로 단정하지 말며 제공 영역의 「원천 결과만 재조회」 버튼으로 다시 확인하도록 안내. |
| **`expired`** | `확인 기한 지남 (expired) · 다시 준비 필요` | 사람 확인 기한이 지났으므로 현재 준비 정보로는 집행할 수 없으며 사건에서 다시 준비해야 함을 안내. |
| **`error`** | `요청 미처리 (error)` | 안전한 오류 코드(`error.code`)와 메시지(`error.message`)를 표시. |

### 2) 엄격한 원천 효과 검증 (`observed_server_result`)
* `status === 'succeeded'` 응답을 받더라도, 관측 객체의 `observation.effectApplied`가 `true`가 아니거나 관측 데이터가 없는 경우 **성공으로 표시하지 않고 `unknown` (결과 불명)으로 자동 강등** 처리합니다.
* 이를 통해 서버가 성공이라고 주장하더라도 실제 시스템 효과가 관측되지 않은 상태를 성공으로 오인하는 보안 착시를 원천 방지했습니다.

### 3) 사건·조치·대상·영수증·관측 상세 데이터 표시
* 입력에 존재하는 항목만 선별하여 안전하게 나열합니다:
  * 사건 ID(`event.id`) 및 근거 ID(`evidence.id`)
  * 조치 식별자(`actionId`)
  * 실제 원천 대상 ID 및 세대(`target.id`, `target.generation`)
  * 사람 확인 기한(`confirmationExpiresAt`)
  * 요청 ID(`receipt.requestId`), 영수증 ID(`receipt.receiptId`), 버전(`receipt.version`)
  * 이전 조회 결과 대체 안내(`receipt.superseded`)
  * 원천 관측 시각 및 효과 여부(`observation.observedAt`, `effectApplied`)

### 4) 속성 제어 및 버튼 미생성 원칙 준수
* **식별자 속성 부여**:
  * 유효한 `event?.id`가 존재하면 최상위 요소에 `data-student-action-event="<event.id>"` 속성 부여.
  * 유효한 `receipt?.requestId`가 존재하면 `data-student-action-request="<receipt.requestId>"` 속성 부여.
  * 해당 값이 없거나 초기화(`idle`) 시에는 속성을 깨끗이 제거(`removeAttribute`).
* **실행 버튼 미생성**:
  * 학생 화면 내부에는 조치 실행이나 집행 요청(POST) 버튼을 일체 생성하지 않으며, 집행 및 재조회는 제공 화면의 버튼을 사용하도록 안내합니다.

---

## 3. 핵심 보안 원칙 및 설계 근거

1. **제안과 집행의 분리 (Proposal vs Execution)**:
   * AI가 조치를 제안했다는 사실과 실제 조치가 원천 시스템에 집행되었다는 사실은 완전히 다릅니다. 제안 단계는 언제나 "미실행" 상태로 취급되어야 합니다.
2. **서버 접수(ACK)와 실제 효과(Observation)의 분리**:
   * 서버가 요청을 잘 받았다는 응답(ACK/pending)은 집행 성공이 아닙니다. 원천 방화벽이나 격리 시스템에서 실제 규칙이 적용되었는지 관측(`effectApplied: true`)하기 전까지는 성공으로 간주하지 않습니다.
3. **결과 불명(`unknown`)의 단정 금지**:
   * 네트워크 타임아웃이나 상태 조회 불가 상황을 "효과가 없었다(실패)"라거나 "알아서 됐겠지(성공)"로 단정하는 것은 보안 관제에서 매우 위험합니다. 반드시 불명으로 명시하고 결과 재조회를 유도해야 합니다.
4. **사람 확인 필수 원칙 (Human-in-the-Loop)**:
   * 보안 조치는 대상(기기/계정)과 세대, 확인 기한을 사람이 최종 확인한 후 집행되어야 하므로, 자동 실행 버튼을 두지 않고 제공 영역의 확인 절차를 거치도록 설계했습니다.

---

## 4. 검증 결과

* **문법 검사 (`npm run check`)**: `node --check student/extension.mjs` 검사 결과 구문 오류 없음 (**정상 통과**).
* **단위 검증 (`test_step19.mjs`)**: 11개 시나리오 47개 검증 항목 100% 통과.
  * `idle`, `loading`, `prepared`, `executing`, `pending` 상태 문구 및 완료 오인 차단 확인
  * `succeeded` 상태에서 `effectApplied: true`일 때만 효과 확인으로 렌더링됨 확인
  * `succeeded` 상태에서 `effectApplied: false`일 경우 `unknown`으로 강등 처리됨 확인
  * `denied`, `failed`, `expired`, `error` 상태의 올바른 라벨 및 메시지 확인
  * `data-student-action-event`, `data-student-action-request` 속성 부여 및 초기화 확인
  * 전체 상태에서 실행 버튼(`button`) 미생성 확인
* **회귀 검증 (`test_step18.mjs`)**: 18단계 검증 40개 항목 100% 정상 통과 (기존 기능 영향 없음 확인).
