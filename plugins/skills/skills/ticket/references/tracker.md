# Tracker 게시와 상태

## 동일 명세 재실행과 불명확한 응답

승인된 정확한 tracker/repository 범위만 변경한다. 기존 URL이 있으면 우선 사용하고, 각 slice에 지속적인 marker `<!-- ticket-key: <spec-key>/<slice-key> -->`를 둔다. 재실행 때 시간값으로 키를 바꾸지 않는다. 하나의 작성자가 쓰기를 소유하게 한다. check-then-create는 원자적 exactly-once 보장이 아니다.

생성 전에 open/closed 목록을 pagination 끝까지 읽어 URL·marker·원문을 대조한다. GitHub 목록의 pull request는 제외한다. 검색 인덱스의 0건은 부재 증거가 아니다. 일치 1건이고 동일 내용이면 no-op으로 기존 URL을 반환한다. 갱신 요청은 현재 본문을 다시 읽어 무관한 편집을 보존한다. 여러 후보나 동시 편집 충돌이면 쓰기를 멈추고 해결 조건을 남긴다.

기존 항목 부재가 확인되고 권한이 있으면 완성된 본문을 구조화된 인자 또는 UTF-8 body-file로 한 번 게시한다. 반환 ID로 본문·marker·라벨·대상을 readback한다. 응답이 timeout/불완전하면 create/update를 반복하지 않고 ID 또는 전체 목록으로 reconcile한다. 1건과 의도한 내용이 확인되면 회수한다. 0건·여러 건·조회 실패·불완전 목록이면 게시 상태 미확정으로 추가 쓰기를 멈춘다. 모호한 create 이후 0건이나 시간 경과만으로 재생성하지 않는다. 최초 요청이 적용되지 않았고 앞으로도 적용되지 않는 확정 증거 또는 원자적 중복 방지가 있어야 재생성을 판단한다. 관계와 상태 변경도 응답이 불명확하면 해당 관계/이슈를 먼저 재조회한다.

## Native 관계

GitHub에서는 containment와 execution dependency를 구분한다. parent의 native sub-issue로 자식을 연결하고, 실제 선행 작업은 dependent의 native blocked-by로 연결한다. 본문 링크만으로 native 관계 완료를 주장하지 않는다. 실행 환경의 현재 공식 API 문서, 권한, 지원 여부를 먼저 확인한다.

- Sub-issue: `GET/POST /repos/{owner}/{repo}/issues/{parent_number}/sub_issues`. 추가 body의 `sub_issue_id`는 자식의 numeric database ID다.
- Blocker: `GET/POST /repos/{owner}/{repo}/issues/{dependent_number}/dependencies/blocked_by`. 추가 body의 `issue_id`는 선행 이슈의 numeric database ID다. URL의 issue number와 body의 database ID를 혼동하지 않는다.
- 관계 추가 전 목록을 확인하여 중복 요청을 피하고, 추가 후 양쪽 이슈와 관계 목록을 readback한다. 기존의 다른 parent/blocker를 임의로 제거하지 않는다. 다른 parent에 속하면 충돌을 먼저 해결한다.
- 미지원 tracker는 `Parent: <URL>`, `Blocked by: <URL> — 필요한 산출물/해소 기준`을 본문에 명시하고 양방향 참조를 검증한다. native 지원 없음과 대체 사용을 보고한다. 단순 권한 오류를 미지원으로 포장하지 않는다.

선행 이슈가 닫혔다는 것만으로 해소하지 않는다. 필요한 산출물과 검증이 충족됐는지 확인한다. wontfix/중복 종료는 계약을 공급하지 않을 수 있다. 해소된 관계는 이력을 보존하고, 현재 open blocker와 증거를 기준으로 계산한다. 선행 재개 시 의존 이슈의 영향을 재평가한다.

## 단일 상태와 전환

기존 tracker vocabulary 대응을 확인한다. 아래 여섯 상태 중 정확히 하나를 유지한다. 허용된 범위에서 필요한 라벨을 생성한다. 변경 직전 라벨을 읽고 이 상태 집합의 이전 라벨만 제거하며 feature/bug 등 무관한 라벨은 보존한다. 전체 라벨 덮어쓰기를 피한다. 변경 후 전체 라벨을 읽어 상태 수=1과 무관 라벨 보존을 확인한다. 동시 편집으로 불일치하면 조정하고 성공을 단정하지 않는다.

| 상태 | 진입 조건 |
|---|---|
| `status:triage` | 범위·실행 가능성을 정리 중 |
| `status:ready` | 계약과 수용 기준 준비, 실제 미해결 선행/외부 blocker 없음 |
| `status:active` | 구현 또는 검증을 실제 수행 중 |
| `status:blocked` | 미해결 의존성·권한·중요 미결정; 원인, 필요한 조치, 재개 조건 기록 |
| `status:done` | 필요한 수용 기준별 검증 증거가 충족되고 완료 요약 기록 |
| `status:wontfix` | 수행하지 않는 결정과 이유 기록 |

검증은 active에서 수행한다. 사용자 검수 대기 라벨은 만들지 않는다. ready→active→done을 실제 작업과 연결하고 done은 completed 종료와 일치시킨다. wontfix는 사유에 맞게 not planned 종료한다. 재개 요청이면 과거 증거를 남기고 reopen한 뒤 남은 계약에 따라 ready/blocked/active로 전환한다. 재개 자체가 active의 증거는 아니다.

선행 완료 후에는 의존 티켓의 blocker와 완료 증거를 다시 읽고 해소된 것만 ready로 바꾼다. 상태·종료 변경과 관계는 별도 요청일 수 있으므로 각 단계 readback으로 부분 성공을 기록한다. 전환 성공을 확인한 뒤 새 frontier를 보고한다.

공식 API 참고 (실행 시 현재 지원 재확인): [Sub-issues](https://docs.github.com/en/rest/issues/sub-issues), [Issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies), [Issue labels](https://docs.github.com/en/rest/issues/labels), [Issues](https://docs.github.com/en/rest/issues/issues).
