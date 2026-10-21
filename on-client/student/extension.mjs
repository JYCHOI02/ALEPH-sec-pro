// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      const container = document.createElement('div');
      container.className = 'student-identity-box';

      // 1. 전달받은 모드(demo, disconnected, unknown) 안내 표시 (loading/error 시에도 표시)
      const mode = me?.mode || devices?.mode || sessions?.mode || null;
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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
