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

상태 판정·완료·재개에는 [공유 상태 계약](tracker-state.md)을 적용한다.

공식 API 참고 (실행 시 현재 지원 재확인): [Sub-issues](https://docs.github.com/en/rest/issues/sub-issues), [Issue dependencies](https://docs.github.com/en/rest/issues/issue-dependencies), [Issue labels](https://docs.github.com/en/rest/issues/labels), [Issues](https://docs.github.com/en/rest/issues/issues).
