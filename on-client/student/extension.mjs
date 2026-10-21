// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const container = document.createElement('div');
      container.className = 'student-identity-box';

      // 1. 세 자료(me, devices, sessions)의 mode를 각각 개별 확인하여 서로 다른 모드가 가려지지 않도록 모두 표시 (loading/error 시에도 표시)
      const modeSources = [
        { key: 'me', label: '계정', mode: me?.mode },
        { key: 'devices', label: '기기', mode: devices?.mode },
        { key: 'sessions', label: '세션', mode: sessions?.mode },
      ];
      const validModes = modeSources.filter((item) => Boolean(item.mode));
      if (validModes.length > 0) {
        const modeWrap = document.createElement('div');
        modeWrap.style.marginBottom = '8px';
        modeWrap.style.display = 'flex';
        modeWrap.style.gap = '6px';
        modeWrap.style.flexWrap = 'wrap';

        // 세 자료의 mode를 각각 확인하여 서로 다른 모드가 가려지지 않도록 고유 모드별로 각각 태그 생성
        const uniqueModes = [...new Set(validModes.map((item) => item.mode))];
        for (const rawMode of uniqueModes) {
          const modeTag = document.createElement('span');
          modeTag.className = 'tag';
          if (rawMode === 'demo') {
            modeTag.className = 'tag tag-demo';
            modeTag.textContent = '예제 자료';
          } else if (rawMode === 'disconnected') {
            modeTag.textContent = '연결 없음';
          } else if (rawMode === 'unknown') {
            modeTag.textContent = '확인 불가';
          } else {
            modeTag.textContent = rawMode;
          }
          modeWrap.appendChild(modeTag);
        }
        container.appendChild(modeWrap);
      }

      // 2. 오류(error) 분기: 이전 사용자 값을 남기지 않고 실패 및 서버 message 표시
      const hasError = (me && me.status === 'error') ||
                       (devices && devices.status === 'error') ||
                       (sessions && sessions.status === 'error');

      if (hasError) {
        const errorMsg = me?.error?.message ||
                         devices?.error?.message ||
                         sessions?.error?.message ||
                         '확인 불가';
        const errEl = document.createElement('p');
        errEl.className = 'state state-error';
        errEl.textContent = `연결 실패: ${errorMsg}`;
        container.appendChild(errEl);
        return container;
      }

      // 3. 로딩(loading) 분기: 불러오는 중 표시 (이전 값 미포함)
      const isLoading = (!me && !devices && !sessions) ||
                        (me && me.status === 'loading') ||
                        (devices && devices.status === 'loading') ||
                        (sessions && sessions.status === 'loading');

      if (isLoading) {
        const loadEl = document.createElement('p');
        loadEl.className = 'state state-loading';
        loadEl.textContent = '불러오는 중';
        container.appendChild(loadEl);
        return container;
      }

      // 4. 정상(ok) 분기: 사용자, 기기, 세션 정보 및 상태 코드/설명 표시
      const dl = document.createElement('dl');
      dl.className = 'identity';

      // 사용자 정보
      const dtUser = document.createElement('dt');
      dtUser.textContent = '사용자';
      const ddUser = document.createElement('dd');
      const user = me?.data?.user;
      if (user) {
        const userLabel = user.label || user.id || '확인 불가';
        ddUser.textContent = user.id && user.label && user.label !== user.id
          ? `${userLabel} (${user.id})`
          : userLabel;
      } else {
        ddUser.textContent = '확인 불가';
      }
      dl.appendChild(dtUser);
      dl.appendChild(ddUser);

      // 기기 정보 및 보안 상태 (compliant, noncompliant, unknown)
      const dtDevice = document.createElement('dt');
      dtDevice.textContent = '기기';
      const ddDevice = document.createElement('dd');
      const device = me?.data?.device;
      if (device) {
        const devLabel = device.label || device.id || '확인 불가';
        const devStatus = device.status;
        let devStatusDesc = '확인 불가';
        if (devStatus === 'compliant') {
          devStatusDesc = '보안 기준 충족';
        } else if (devStatus === 'noncompliant') {
          devStatusDesc = '보안 기준 미충족';
        } else if (devStatus === 'unknown') {
          devStatusDesc = '확인 불가';
        } else if (devStatus) {
          devStatusDesc = devStatus;
        }
        ddDevice.textContent = `${devLabel} · ${devStatusDesc} (${devStatus || 'unknown'})`;
      } else {
        ddDevice.textContent = '확인 불가';
      }
      dl.appendChild(dtDevice);
      dl.appendChild(ddDevice);

      // 세션 정보 및 상태 (active, expired, revoked, unknown)
      const dtSession = document.createElement('dt');
      dtSession.textContent = '세션';
      const ddSession = document.createElement('dd');
      const session = me?.data?.session;
      if (session) {
        const sessId = session.id || '확인 불가';
        const sessStatus = session.status;
        let sessStatusDesc = '확인 불가';
        if (sessStatus === 'active') {
          sessStatusDesc = '활성';
        } else if (sessStatus === 'expired') {
          sessStatusDesc = '만료';
        } else if (sessStatus === 'revoked') {
          sessStatusDesc = '철회됨';
        } else if (sessStatus === 'unknown') {
          sessStatusDesc = '확인 불가';
        } else if (sessStatus) {
          sessStatusDesc = sessStatus;
        }
        ddSession.textContent = `${sessId} · ${sessStatusDesc} (${sessStatus || 'unknown'})`;
      } else {
        ddSession.textContent = '확인 불가';
      }
      dl.appendChild(dtSession);
      dl.appendChild(ddSession);

      container.appendChild(dl);

      // 전달된 devices, sessions 목록 개수 보조 표시
      if (Array.isArray(devices?.data) && devices.data.length > 0) {
        const devSummary = document.createElement('div');
        devSummary.className = 'muted';
        devSummary.style.marginTop = '6px';
        devSummary.textContent = `등록 기기: ${devices.data.length}대`;
        container.appendChild(devSummary);
      }
      if (Array.isArray(sessions?.data) && sessions.data.length > 0) {
        const sessSummary = document.createElement('div');
        sessSummary.className = 'muted';
        sessSummary.textContent = `전체 세션: ${sessions.data.length}개`;
        container.appendChild(sessSummary);
      }

      return container;
    },
    renderDecision({ status = 'idle', mode = null, data = null, error = null, appId = null } = {}) {
      const container = document.createElement('div');
      container.className = 'student-decision-box';

      // 1. 전달받은 모드(demo, disconnected, unknown) 안내 표시 (loading/error 시에도 표시)
      if (mode) {
        const modeWrap = document.createElement('div');
        modeWrap.style.marginBottom = '8px';
        const modeTag = document.createElement('span');
        modeTag.className = 'tag';
        if (mode === 'demo') {
          modeTag.className = 'tag tag-demo';
          modeTag.textContent = '예제 자료';
        } else if (mode === 'disconnected') {
          modeTag.textContent = '연결 없음';
        } else if (mode === 'unknown') {
          modeTag.textContent = '확인 불가';
        } else {
          modeTag.textContent = mode;
        }
        modeWrap.appendChild(modeTag);
        container.appendChild(modeWrap);
      }

      // 2. 요청 전(idle) 분기: 앱을 선택하라는 안내 표시
      if (status === 'idle') {
        const idleEl = document.createElement('p');
        idleEl.className = 'state state-empty';
        idleEl.textContent = '앱을 골라 접속을 요청하세요.';
        container.appendChild(idleEl);
        return container;
      }

      // 3. 요청 중(loading) 분기: 판정 확인 중 표시
      if (status === 'loading') {
        const loadEl = document.createElement('p');
        loadEl.className = 'state state-loading';
        const targetApp = appId || data?.appId || '';
        loadEl.textContent = targetApp ? `${targetApp} 판정 확인 중…` : '판정 확인 중…';
        container.appendChild(loadEl);
        return container;
      }

      // 4. 요청 실패(error) 분기: 요청 실패임을 알리고 차단/거부 판정이 아님을 명시 (이전 결과 미포함)
      if (status === 'error') {
        const errEl = document.createElement('div');
        errEl.className = 'state state-error';

        const errTitle = document.createElement('p');
        errTitle.style.margin = '0 0 4px';
        errTitle.style.fontWeight = 'bold';
        errTitle.textContent = `요청 실패: ${error?.message || '서버에 연결하지 못했습니다.'}`;
        errEl.appendChild(errTitle);

        const errNote = document.createElement('p');
        errNote.style.margin = '0';
        errNote.className = 'muted';
        errNote.textContent = '요청 실패는 접근 거부(차단) 판정이 아니며, 허용된 상태도 아닙니다. 다시 시도해 주세요.';
        errEl.appendChild(errNote);

        container.appendChild(errEl);
        return container;
      }

      // 5. 판정 수신(ok) 분기: allow, deny, challenge, unknown 판정 결과 표시
      const targetAppId = data?.appId || appId || '알 수 없는 앱';
      const rawDecision = data?.decision;

      let decisionText = '';
      let decisionClass = 'decision-unknown';
      let decisionNote = '';

      if (rawDecision === 'allow') {
        decisionText = '허용 (allow)';
        decisionClass = 'decision-allow';
        decisionNote = '서버 정책상 이 앱에 대한 접근이 허용되었습니다. (실제 앱 접속 성공을 보장하는 것은 아닙니다.)';
      } else if (rawDecision === 'deny') {
        decisionText = '거부 (deny)';
        decisionClass = 'decision-deny';
        decisionNote = '서버 정책상 이 앱에 대한 접근이 거부되었습니다.';
      } else if (rawDecision === 'challenge') {
        decisionText = '추가 확인 필요 (challenge)';
        decisionClass = 'decision-challenge';
        decisionNote = '서버가 추가 인증 또는 확인을 요구했습니다. 본 앱이 확인 절차를 대신하지 않습니다.';
      } else {
        // unknown 또는 목록에 없는 값: 절대 허용이나 정상처럼 보이지 않게 처리
        decisionText = `확인 불가 (${rawDecision || 'unknown'})`;
        decisionClass = 'decision-unknown';
        decisionNote = '판정 결과를 확인할 수 없습니다. 허용되지 않은 상태이며 정상으로 간주하지 마세요.';
      }

      // 판정 요약 박스
      const summaryBox = document.createElement('div');
      summaryBox.className = `decision ${decisionClass}`;
      summaryBox.style.marginBottom = '12px';

      const headEl = document.createElement('p');
      headEl.style.margin = '0 0 4px';
      headEl.style.fontWeight = 'bold';
      headEl.textContent = `${decisionText} · ${targetAppId}`;
      summaryBox.appendChild(headEl);

      const noteEl = document.createElement('p');
      noteEl.style.margin = '0';
      noteEl.textContent = decisionNote;
      summaryBox.appendChild(noteEl);

      container.appendChild(summaryBox);

      // 세부 정보 목록 (사유 reason, 판정 시각 checkedAt, 대상 앱)
      const dl = document.createElement('dl');
      dl.className = 'kv';

      // 사유
      const dtReason = document.createElement('dt');
      dtReason.textContent = '판정 이유';
      const ddReason = document.createElement('dd');
      ddReason.textContent = data?.reason || '판정 이유 정보 없음';
      dl.appendChild(dtReason);
      dl.appendChild(ddReason);

      // 판정 시각
      const dtTime = document.createElement('dt');
      dtTime.textContent = '판정 시각';
      const ddTime = document.createElement('dd');
      if (data?.checkedAt) {
        const parsedDate = new Date(data.checkedAt);
        const timeStr = Number.isNaN(parsedDate.getTime()) ? data.checkedAt : parsedDate.toLocaleString('ko-KR');
        ddTime.textContent = `${timeStr} (${data.checkedAt})`;
      } else {
        ddTime.textContent = '시각 정보 없음';
      }
      dl.appendChild(dtTime);
      dl.appendChild(ddTime);

      // 대상 앱
      const dtApp = document.createElement('dt');
      dtApp.textContent = '대상 앱';
      const ddApp = document.createElement('dd');
      ddApp.textContent = targetAppId;
      dl.appendChild(dtApp);
      dl.appendChild(ddApp);

      container.appendChild(dl);

      return container;
    },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
