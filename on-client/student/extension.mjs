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
        // unknown 또는 네 판정 목록(allow, deny, challenge)에 없는 모든 값은 표시용 판정을 unknown으로 정규화하여 한국어 뜻과 함께 표시
        decisionText = '확인 불가 (unknown)';
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
    renderEvents({ status = 'loading', mode = null, data = null, error = null } = {}) {
      const container = document.createElement('div');
      container.className = 'student-events-box';

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

      // 2. 오류(error) 분기: 기록 조회 실패 및 서버 message 표시 (빈 목록과 엄격히 구분)
      if (status === 'error') {
        const errEl = document.createElement('p');
        errEl.className = 'state state-error';
        errEl.textContent = `기록을 불러오지 못했습니다: ${error?.message || '서버 오류'}`;
        container.appendChild(errEl);
        return container;
      }

      // 3. 로딩(loading) 분기: 불러오는 중 표시 (이전 목록/상세 미포함)
      if (status === 'loading') {
        const loadEl = document.createElement('p');
        loadEl.className = 'state state-loading';
        loadEl.textContent = '기록을 불러오는 중…';
        container.appendChild(loadEl);
        return container;
      }

      // 4. 정상(ok)이지만 빈 배열인 경우: 표시할 기록이 없음 표시 (오류와 명확히 구분)
      const eventList = Array.isArray(data) ? data : [];
      if (eventList.length === 0) {
        const emptyEl = document.createElement('p');
        emptyEl.className = 'state state-empty';
        emptyEl.textContent = '표시할 기록이 없습니다';
        container.appendChild(emptyEl);
        return container;
      }

      // 5. 정상(ok) 데이터 정렬: 원본 배열을 변형하지 않고 복사본을 at 기준 최신순(내림차순) 정렬
      const sortedEvents = [...eventList].sort((a, b) => {
        const timeA = a.at ? new Date(a.at).getTime() : 0;
        const timeB = b.at ? new Date(b.at).getTime() : 0;
        return timeB - timeA;
      });

      // 상태 번역 헬퍼 함수
      const getAccessDesc = (val) => {
        if (val === 'allowed') return '허용 (allowed)';
        if (val === 'denied') return '거부 (denied)';
        return '확인 불가 (unknown)';
      };
      const getSessionDesc = (val) => {
        if (val === 'active') return '활성 (active)';
        if (val === 'expired') return '만료 (expired)';
        if (val === 'revoked') return '철회됨 (revoked)';
        return '확인 불가 (unknown)';
      };
      const getDeviceDesc = (val) => {
        if (val === 'compliant') return '보안 기준 충족 (compliant)';
        if (val === 'noncompliant') return '보안 기준 미충족 (noncompliant)';
        return '확인 불가 (unknown)';
      };

      // 6. 필터 컨트롤 영역 구성 (기록 종류, 업무 앱, 접속 상태)
      const filterWrap = document.createElement('div');
      filterWrap.className = 'row';
      filterWrap.style.marginBottom = '12px';
      filterWrap.style.alignItems = 'center';

      // 필터 상태 변수 (다시 불러오면 renderEvents가 새로 실행되어 자동 초기화됨)
      let selectedKind = 'all';
      let selectedApp = 'all';
      let selectedAccess = 'all';
      let selectedDetailId = null;

      // 1) 기록 종류 필터
      const kindGroup = document.createElement('div');
      kindGroup.style.display = 'inline-flex';
      kindGroup.style.alignItems = 'center';
      kindGroup.style.gap = '4px';

      const kindLabel = document.createElement('label');
      kindLabel.textContent = '기록 종류:';
      const kindSelect = document.createElement('select');
      kindSelect.className = 'btn';
      kindSelect.setAttribute('aria-label', '기록 종류');

      const allKindOpt = document.createElement('option');
      allKindOpt.value = 'all';
      allKindOpt.textContent = '전체 종류';
      kindSelect.appendChild(allKindOpt);

      const uniqueKinds = [...new Set(sortedEvents.map((e) => e.kind).filter(Boolean))];
      for (const k of uniqueKinds) {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = k === 'access' ? '접속 (access)' : k === 'xdr' ? 'XDR 경보 (xdr)' : k;
        kindSelect.appendChild(opt);
      }
      kindGroup.appendChild(kindLabel);
      kindGroup.appendChild(kindSelect);
      filterWrap.appendChild(kindGroup);

      // 2) 업무 앱 필터
      const appGroup = document.createElement('div');
      appGroup.style.display = 'inline-flex';
      appGroup.style.alignItems = 'center';
      appGroup.style.gap = '4px';

      const appLabel = document.createElement('label');
      appLabel.textContent = '업무 앱:';
      const appSelect = document.createElement('select');
      appSelect.className = 'btn';
      appSelect.setAttribute('aria-label', '업무 앱');

      const allAppOpt = document.createElement('option');
      allAppOpt.value = 'all';
      allAppOpt.textContent = '전체 앱';
      appSelect.appendChild(allAppOpt);

      const uniqueApps = [...new Set(sortedEvents.map((e) => e.appId || 'none'))];
      for (const a of uniqueApps) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a === 'none' ? '앱 없음' : a;
        appSelect.appendChild(opt);
      }
      appGroup.appendChild(appLabel);
      appGroup.appendChild(appSelect);
      filterWrap.appendChild(appGroup);

      // 3) 접속 상태 필터
      const accessGroup = document.createElement('div');
      accessGroup.style.display = 'inline-flex';
      accessGroup.style.alignItems = 'center';
      accessGroup.style.gap = '4px';

      const accessLabel = document.createElement('label');
      accessLabel.textContent = '접속 상태:';
      const accessSelect = document.createElement('select');
      accessSelect.className = 'btn';
      accessSelect.setAttribute('aria-label', '접속 상태');

      const allAccessOpt = document.createElement('option');
      allAccessOpt.value = 'all';
      allAccessOpt.textContent = '전체 상태';
      accessSelect.appendChild(allAccessOpt);

      const uniqueAccessStates = [...new Set(sortedEvents.map((e) => e.state?.access).filter(Boolean))];
      for (const acc of uniqueAccessStates) {
        const opt = document.createElement('option');
        opt.value = acc;
        opt.textContent = getAccessDesc(acc);
        accessSelect.appendChild(opt);
      }
      accessGroup.appendChild(accessLabel);
      accessGroup.appendChild(accessSelect);
      filterWrap.appendChild(accessGroup);

      container.appendChild(filterWrap);

      // 7. 상세 영역 컨테이너 생성
      const detailSlot = document.createElement('div');
      detailSlot.className = 'student-event-detail-slot';
      detailSlot.style.marginBottom = '16px';
      container.appendChild(detailSlot);

      // 8. 목록 렌더링 영역
      const listContainer = document.createElement('ul');
      listContainer.className = 'records';
      listContainer.style.listStyle = 'none';
      listContainer.style.padding = '0';
      listContainer.style.margin = '0';
      container.appendChild(listContainer);

      // 상세 영역 갱신 함수
      const renderDetail = (targetEvent) => {
        detailSlot.replaceChildren();
        if (!targetEvent) {
          detailSlot.removeAttribute('data-student-event-detail');
          return;
        }

        detailSlot.setAttribute('data-student-event-detail', targetEvent.id);

        const card = document.createElement('div');
        card.className = 'card student';
        card.style.padding = '14px 16px';
        card.style.background = 'var(--surface)';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';

        const title = document.createElement('h3');
        title.style.margin = '0';
        title.textContent = `사건 상세: ${targetEvent.id}`;
        header.appendChild(title);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn';
        closeBtn.textContent = '상세 닫기';
        closeBtn.onclick = () => {
          selectedDetailId = null;
          renderDetail(null);
        };
        header.appendChild(closeBtn);
        card.appendChild(header);

        // 기본 정보
        const dl = document.createElement('dl');
        dl.className = 'kv';
        dl.style.marginBottom = '12px';

        const dtId = document.createElement('dt');
        dtId.textContent = '사건 ID';
        const ddId = document.createElement('dd');
        ddId.textContent = targetEvent.id;
        dl.appendChild(dtId);
        dl.appendChild(ddId);

        const dtApp = document.createElement('dt');
        dtApp.textContent = '업무 앱';
        const ddApp = document.createElement('dd');
        ddApp.textContent = targetEvent.appId || '확인 불가 (앱 없음)';
        dl.appendChild(dtApp);
        dl.appendChild(ddApp);

        // 세 상태: access, session, device (원래 값과 한국어 설명 모두 표시)
        const dtAccess = document.createElement('dt');
        dtAccess.textContent = '접속 상태';
        const ddAccess = document.createElement('dd');
        ddAccess.textContent = getAccessDesc(targetEvent.state?.access);
        dl.appendChild(dtAccess);
        dl.appendChild(ddAccess);

        const dtSession = document.createElement('dt');
        dtSession.textContent = '세션 상태';
        const ddSession = document.createElement('dd');
        ddSession.textContent = getSessionDesc(targetEvent.state?.session);
        dl.appendChild(dtSession);
        dl.appendChild(ddSession);

        const dtDevice = document.createElement('dt');
        dtDevice.textContent = '기기 상태';
        const ddDevice = document.createElement('dd');
        ddDevice.textContent = getDeviceDesc(targetEvent.state?.device);
        dl.appendChild(dtDevice);
        dl.appendChild(ddDevice);

        card.appendChild(dl);

        // 근거(evidence) 목록
        const evTitle = document.createElement('h4');
        evTitle.textContent = '근거 (Evidence)';
        card.appendChild(evTitle);

        const evList = document.createElement('ul');
        evList.style.margin = '0 0 12px';
        evList.style.paddingLeft = '18px';
        if (Array.isArray(targetEvent.evidence) && targetEvent.evidence.length > 0) {
          for (const ev of targetEvent.evidence) {
            const li = document.createElement('li');
            li.textContent = `[${ev.id || 'id 없음'}] ${ev.text || '내용 없음'}`;
            evList.appendChild(li);
          }
        } else {
          const li = document.createElement('li');
          li.className = 'muted';
          li.textContent = '근거 정보 없음';
          evList.appendChild(li);
        }
        card.appendChild(evList);

        // 규칙(rules) 목록
        const ruleTitle = document.createElement('h4');
        ruleTitle.textContent = '규칙 (Rules)';
        card.appendChild(ruleTitle);

        const ruleList = document.createElement('ul');
        ruleList.style.margin = '0 0 8px';
        ruleList.style.paddingLeft = '18px';
        if (Array.isArray(targetEvent.rules) && targetEvent.rules.length > 0) {
          for (const ru of targetEvent.rules) {
            const li = document.createElement('li');
            li.textContent = `[${ru.id || 'id 없음'}] ${ru.text || '내용 없음'}`;
            ruleList.appendChild(li);
          }
        } else {
          const li = document.createElement('li');
          li.className = 'muted';
          li.textContent = '규칙 정보 없음';
          ruleList.appendChild(li);
        }
        card.appendChild(ruleList);

        // 미지원 조치(supportedActions) 안내 영역 (16단계 요구사항: supportedActions가 있을 때만 미지원 비활성 버튼 표시)
        if (Array.isArray(targetEvent.supportedActions) && targetEvent.supportedActions.length > 0) {
          const actWrap = document.createElement('div');
          actWrap.style.marginTop = '12px';
          actWrap.style.padding = '10px 12px';
          actWrap.style.border = '1px dashed var(--border)';
          actWrap.style.borderRadius = 'var(--radius)';

          const actTitle = document.createElement('h4');
          actTitle.style.margin = '0 0 6px';
          actTitle.textContent = '조치 제안';
          actWrap.appendChild(actTitle);

          const actNote = document.createElement('p');
          actNote.className = 'muted';
          actNote.style.margin = '0 0 8px';
          actNote.textContent = '조치 실행 연결은 준비 중입니다 (아직 지원하지 않는 조치입니다).';
          actWrap.appendChild(actNote);

          const btnRow = document.createElement('div');
          btnRow.style.display = 'flex';
          btnRow.style.gap = '8px';
          btnRow.style.flexWrap = 'wrap';

          for (const actionName of targetEvent.supportedActions) {
            const unsuppBtn = document.createElement('button');
            unsuppBtn.type = 'button';
            unsuppBtn.className = 'btn';
            unsuppBtn.disabled = true;
            unsuppBtn.textContent = `${actionName} 미지원`;
            btnRow.appendChild(unsuppBtn);
          }
          actWrap.appendChild(btnRow);
          card.appendChild(actWrap);
        }

        detailSlot.appendChild(card);
      };

      // 목록 새로고침 함수
      const refreshList = () => {
        listContainer.replaceChildren();

        // 필터링 적용
        const filtered = sortedEvents.filter((ev) => {
          if (selectedKind !== 'all' && ev.kind !== selectedKind) return false;
          if (selectedApp !== 'all' && (ev.appId || 'none') !== selectedApp) return false;
          if (selectedAccess !== 'all' && ev.state?.access !== selectedAccess) return false;
          return true;
        });

        if (filtered.length === 0) {
          const emptyLi = document.createElement('li');
          const emptyP = document.createElement('p');
          emptyP.className = 'state state-empty';
          emptyP.textContent = '조건에 맞는 기록이 없습니다';
          emptyLi.appendChild(emptyP);
          listContainer.appendChild(emptyLi);
          return;
        }

        // 목록 행 생성
        for (const ev of filtered) {
          const li = document.createElement('li');
          li.className = 'event';
          li.setAttribute('data-student-event-id', ev.id);
          li.style.border = '1px solid var(--border)';
          li.style.borderRadius = 'var(--radius)';
          li.style.padding = '12px 14px';
          li.style.marginBottom = '8px';
          li.style.background = 'var(--surface)';

          // 헤더: 사건 요약 및 종류 태그
          const head = document.createElement('div');
          head.style.display = 'flex';
          head.style.justifyContent = 'space-between';
          head.style.alignItems = 'center';
          head.style.marginBottom = '6px';

          const title = document.createElement('h3');
          title.style.margin = '0';
          title.textContent = ev.summary || '요약 없음';
          head.appendChild(title);

          const kindTag = document.createElement('span');
          kindTag.className = 'tag';
          kindTag.textContent = ev.kind === 'access' ? '접속 (access)' : ev.kind === 'xdr' ? 'XDR 경보 (xdr)' : ev.kind;
          head.appendChild(kindTag);
          li.appendChild(head);

          // 메타 정보: 시각, 업무 앱, 사건 ID
          const metaP = document.createElement('p');
          metaP.className = 'muted';
          metaP.style.margin = '0 0 8px';
          const timeText = ev.at ? `${new Date(ev.at).toLocaleString('ko-KR')} (${ev.at})` : '시각 정보 없음';
          const appText = ev.appId || '앱을 확인할 수 없음';
          metaP.textContent = `사건 ID: ${ev.id} · 시각: ${timeText} · 업무 앱: ${appText}`;
          li.appendChild(metaP);

          // 요약 내용
          const summaryP = document.createElement('p');
          summaryP.style.margin = '0 0 10px';
          summaryP.textContent = `요약: ${ev.summary || '요약 내용 없음'}`;
          li.appendChild(summaryP);

          // 하단 버튼 영역: <event.id> 상세 버튼
          const actionsDiv = document.createElement('div');
          actionsDiv.style.display = 'flex';
          actionsDiv.style.gap = '8px';

          const detailBtn = document.createElement('button');
          detailBtn.type = 'button';
          detailBtn.className = 'btn';
          detailBtn.textContent = `${ev.id} 상세`;
          detailBtn.setAttribute('aria-label', `${ev.id} 상세`);
          detailBtn.onclick = () => {
            selectedDetailId = ev.id;
            renderDetail(ev);
          };
          actionsDiv.appendChild(detailBtn);

          li.appendChild(actionsDiv);
          listContainer.appendChild(li);
        }
      };

      // 필터 이벤트 리스너 연결
      kindSelect.onchange = () => {
        selectedKind = kindSelect.value;
        refreshList();
      };
      appSelect.onchange = () => {
        selectedApp = appSelect.value;
        refreshList();
      };
      accessSelect.onchange = () => {
        selectedAccess = accessSelect.value;
        refreshList();
      };

      // 초기 목록 렌더링
      refreshList();

      return container;
    },
    renderStatus({ devices = null, sessions = null, notifications = [], diagnostics = null, mode = null } = {}) {
      const container = document.createElement('div');
      container.className = 'student-status-box';

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

      // 2. 기기 상태 영역 (devices: loading / ok / error / empty)
      const devSection = document.createElement('section');
      devSection.style.marginBottom = '16px';
      const devTitle = document.createElement('h3');
      devTitle.textContent = '내 기기 상태';
      devSection.appendChild(devTitle);

      if (!devices || devices.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'state state-loading';
        p.textContent = '기기 목록을 불러오는 중…';
        devSection.appendChild(p);
      } else if (devices.status === 'error') {
        const isTimeout = devices.error?.code === 'TIMEOUT' || devices.error?.code === 'REQUEST_TIMEOUT' || String(devices.error?.message).includes('초과');
        const timeoutNote = isTimeout ? ' (요청 시간 초과)' : '';
        const p = document.createElement('p');
        p.className = 'state state-error';
        p.textContent = `기기 목록을 불러오지 못했습니다${timeoutNote}: ${devices.error?.message || '알 수 없는 오류'}`;
        devSection.appendChild(p);

        const retryNote = document.createElement('p');
        retryNote.className = 'muted';
        retryNote.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. (자동으로 다시 요청하지 않습니다.)';
        devSection.appendChild(retryNote);
      } else if (devices.status === 'ok') {
        const devList = Array.isArray(devices.data) ? devices.data : [];
        if (devList.length === 0) {
          const emptyP = document.createElement('p');
          emptyP.className = 'state state-empty';
          emptyP.textContent = '등록된 기기가 없습니다';
          devSection.appendChild(emptyP);
        } else {
          const ul = document.createElement('ul');
          ul.className = 'plain-list';
          for (const d of devList) {
            const li = document.createElement('li');
            let statusDesc = '확인 불가';
            if (d.status === 'compliant') statusDesc = '보안 기준 충족';
            else if (d.status === 'noncompliant') statusDesc = '보안 기준 미충족';
            else if (d.status) statusDesc = d.status;

            li.textContent = `${d.label || d.id || '알 수 없는 기기'} · ${statusDesc} (${d.status || 'unknown'})`;
            ul.appendChild(li);
          }
          devSection.appendChild(ul);
        }
      }
      container.appendChild(devSection);

      // 3. 세션 상태 영역 (sessions: 지금 연결 하나만 온다는 점 명시, loading / ok / error / empty)
      const sessSection = document.createElement('section');
      sessSection.style.marginBottom = '16px';
      const sessTitle = document.createElement('h3');
      sessTitle.textContent = '내 세션 상태';
      sessSection.appendChild(sessTitle);

      const sessScopeNote = document.createElement('p');
      sessScopeNote.className = 'muted';
      sessScopeNote.style.margin = '0 0 6px';
      sessScopeNote.textContent = '세션은 지금 검증된 연결 하나만 옵니다 (지난 세션 목록이 아닙니다).';
      sessSection.appendChild(sessScopeNote);

      if (!sessions || sessions.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'state state-loading';
        p.textContent = '세션 정보를 불러오는 중…';
        sessSection.appendChild(p);
      } else if (sessions.status === 'error') {
        const isTimeout = sessions.error?.code === 'TIMEOUT' || sessions.error?.code === 'REQUEST_TIMEOUT' || String(sessions.error?.message).includes('초과');
        const timeoutNote = isTimeout ? ' (요청 시간 초과)' : '';
        const p = document.createElement('p');
        p.className = 'state state-error';
        p.textContent = `세션 정보를 불러오지 못했습니다${timeoutNote}: ${sessions.error?.message || '알 수 없는 오류'}`;
        sessSection.appendChild(p);

        const retryNote = document.createElement('p');
        retryNote.className = 'muted';
        retryNote.textContent = '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. (자동으로 다시 요청하지 않습니다.)';
        sessSection.appendChild(retryNote);
      } else if (sessions.status === 'ok') {
        const sessList = Array.isArray(sessions.data) ? sessions.data : [];
        if (sessList.length === 0) {
          const emptyP = document.createElement('p');
          emptyP.className = 'state state-empty';
          emptyP.textContent = '현재 연결 없음 (등록된 세션이 없습니다)';
          sessSection.appendChild(emptyP);
        } else {
          const ul = document.createElement('ul');
          ul.className = 'plain-list';
          for (const s of sessList) {
            const li = document.createElement('li');
            let statusDesc = '확인 불가';
            if (s.status === 'active') statusDesc = '활성';
            else if (s.status === 'expired') statusDesc = '만료';
            else if (s.status === 'revoked') statusDesc = '철회됨';
            else if (s.status) statusDesc = s.status;

            li.textContent = `${s.id || '알 수 없는 세션'} · ${statusDesc} (${s.status || 'unknown'})`;
            ul.appendChild(li);
          }
          sessSection.appendChild(ul);
        }
      }
      container.appendChild(sessSection);

      // 4. 주의 알림 영역 (notifications: resource, code, message)
      const notiSection = document.createElement('section');
      notiSection.style.marginBottom = '16px';
      const notiTitle = document.createElement('h3');
      notiTitle.textContent = '주의 알림';
      notiSection.appendChild(notiTitle);

      const notiList = Array.isArray(notifications) ? notifications : [];
      if (notiList.length === 0) {
        const emptyP = document.createElement('p');
        emptyP.className = 'state state-empty';
        emptyP.textContent = '주의할 알림이 없습니다';
        notiSection.appendChild(emptyP);
      } else {
        const ul = document.createElement('ul');
        ul.className = 'plain-list';
        for (const item of notiList) {
          const li = document.createElement('li');
          const res = item.resource || '알 수 없는 자료';
          const code = item.code || 'UNVERIFIED';
          const msg = item.message || '';
          li.textContent = `[${res}] (${code}) ${msg}`;
          ul.appendChild(li);
        }
        notiSection.appendChild(ul);
      }
      container.appendChild(notiSection);

      // 5. 도움정보(진단 정보) 영역 (diagnostics: 비밀 배제 6개 필드 표시 및 "도움정보 복사" 버튼)
      const diagSection = document.createElement('section');
      diagSection.style.marginBottom = '8px';
      const diagTitle = document.createElement('h3');
      diagTitle.textContent = '도움정보 (진단 결과)';
      diagSection.appendChild(diagTitle);

      const diagNotice = document.createElement('p');
      diagNotice.className = 'muted';
      diagNotice.style.margin = '0 0 8px';
      diagNotice.textContent = '이 정보는 기술 지원 및 도움 요청에 쓰도록 복사하는 정보입니다 (API 키·인증 토큰은 포함되지 않습니다).';
      diagSection.appendChild(diagNotice);

      if (!diagnostics || diagnostics.status === 'idle') {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = '도움정보가 아직 조회되지 않았습니다. 상단 제공 영역의 도움정보 불러오기를 누르면 점검 결과가 연동됩니다.';
        diagSection.appendChild(p);
      } else if (diagnostics.status === 'loading') {
        const p = document.createElement('p');
        p.className = 'state state-loading';
        p.textContent = '도움정보를 불러오는 중…';
        diagSection.appendChild(p);
      } else if (diagnostics.status === 'error') {
        const p = document.createElement('p');
        p.className = 'state state-error';
        p.textContent = `도움정보 확인 실패: ${diagnostics.error?.message || '오류 발생'}`;
        diagSection.appendChild(p);
      } else if (diagnostics.status === 'ok') {
        const diagData = diagnostics.data || {};

        // 6대 안전 필드 추출 (비밀정보/토큰 제외)
        const safeFields = {
          requestId: diagData.requestId || '확인 불가',
          component: diagData.component || '확인 불가',
          version: diagData.version || '확인 불가',
          checkedAt: diagData.checkedAt || '확인 불가',
          engineMode: diagData.engine?.mode || '확인 불가',
          engineCode: diagData.engine?.code || '확인 불가',
        };

        const dl = document.createElement('dl');
        dl.className = 'kv';
        dl.style.marginBottom = '10px';

        const addRow = (term, val) => {
          const dt = document.createElement('dt');
          dt.textContent = term;
          const dd = document.createElement('dd');
          dd.textContent = String(val);
          dl.appendChild(dt);
          dl.appendChild(dd);
        };

        addRow('요청 ID', safeFields.requestId);
        addRow('컴포넌트', safeFields.component);
        addRow('버전', safeFields.version);
        addRow('점검 시각', safeFields.checkedAt);
        addRow('엔진 모드', safeFields.engineMode);
        addRow('엔진 코드', safeFields.engineCode);

        diagSection.appendChild(dl);

        // 정확한 이름의 "도움정보 복사" 버튼
        const copyRow = document.createElement('div');
        copyRow.style.display = 'flex';
        copyRow.style.alignItems = 'center';
        copyRow.style.gap = '8px';

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'btn';
        copyBtn.textContent = '도움정보 복사';

        const copyStatus = document.createElement('span');
        copyStatus.className = 'muted';

        copyBtn.onclick = async () => {
          const copyPayload = JSON.stringify({
            requestId: safeFields.requestId,
            component: safeFields.component,
            version: safeFields.version,
            checkedAt: safeFields.checkedAt,
            engine: {
              mode: safeFields.engineMode,
              code: safeFields.engineCode,
            },
          }, null, 2);

          try {
            if (navigator?.clipboard?.writeText) {
              await navigator.clipboard.writeText(copyPayload);
              copyStatus.textContent = '도움정보가 클립보드에 복사되었습니다.';
            } else {
              copyStatus.textContent = '클립보드 접근 권한이 없습니다.';
            }
          } catch {
            copyStatus.textContent = '복사에 실패했습니다.';
          }
        };

        copyRow.appendChild(copyBtn);
        copyRow.appendChild(copyStatus);
        diagSection.appendChild(copyRow);
      }
      container.appendChild(diagSection);

      return container;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
