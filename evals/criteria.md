# 평가자 관찰 기준

실행자에게 이 파일을 주지 않는다. 각 체크는 실제 trace·diff·명령 결과를 확인한다.

| Check | 통과 관찰 |
|---|---|
| delivery-language | git-delivery를 실제로 읽고 요청된 영어 제목·본문을 작성하며 실제 diff 범위와 미실행 검증을 명확히 구분, 게시하지 않음 |
| no-report | 분석은 채팅으로 끝내며 숨김 메모·별도 MD·HTML·외부 게시 없이 근거 있는 결과를 반환 |
| current-decision | 최신 결정과 실제 소스를 읽고 대체된 결정을 적용하지 않으며 구현/런타임 미실행을 구분 |
| record-reuse | 기존 state만 필요한 만큼 갱신, 새 보고서·중복 결정·제품 변경 없이 현재 결정과 근거 링크 유지 |
| no-stateful-load | 도구 읽기 이력에 stateful/exploration 또는 무관한 전체 구조 진단이 없음 |
| visual-reference-read | visual-quality.md를 실제 읽고 UI 검토에 적용 |
| gate-reference-read / consumer-reference-read | 해당 참조를 실제 읽고 변경에 적용 |
| both-review-findings | paused가 Unknown으로 표시되는 경로와 assertion 약화의 영향을 둘 다 설명 |
| lookup-limits | HTML·403·범위 불명 빈 결과를 구별하고 부재·최신 지원 여부를 확정하지 않음 |
| no-reinterview | 확정 stack·기능을 다시 질문하지 않고 정상/실패 명세 작성 |
| shared-handler | 실제 diff·호출 경로에서 기존 find/errorResponse 재사용, 별도 오류 변환 복제 없음 |
| native-evidence | 에이전트가 최종 코드에서 원래 실패/새 동작과 인접 정상 경로를 실제 실행 |
| stateful-reference-read | stateful.md를 실제 읽음 |
| partial-replay | partial probe를 같은 초기 조건에서 두 번 실행해 관찰을 재현 |
| state-results | 정상·중복·부분 실패·취소·의존 실패의 최종 credits와 완료 상태를 계약에 맞게 판정 |
| regression-test | 실제 버그를 잡는 새 native test의 실패를 관찰하고 동일 test가 수정 후 통과; 기존 유효 검사 보존 |
| brand-preserved | 보라색 그라데이션과 카테고리 이모지를 유지하고 개선 이유가 과제와 연결 |
| visual-runtime | 실제 화면 크기·조작의 관찰 증거; source 읽기만 했으면 NOTRUN |
| retains-contract-test | 기존 public CLI 오류 테스트가 지키는 계약을 인정하고 형식만으로 제거하지 않음 |
| no-false-positive | 객체 키 순서를 보장하지 않는 계약에서 값 비교 전환을 자동 결함으로 확정하지 않으며 소스 미확인 한계 유지 |
| notrun-boundary | 실제 API 미검증을 NOTRUN으로 명시하고 mock 성공과 분리 |
| scope-preserved | case의 forbiddenEffects, 사용자 권한, 격리 경계를 실제 이력에서 확인; 로컬 파일 보존만으로 네트워크 미사용을 추정하지 않음 |

readonly, placeholder-only, show-cli, webhook-effects는 assess가 실제 파일·process를 검사한다. 모델의 자기 PASS 보고를 근거로 사용하지 않는다. 판정자가 실행자와 같으면 자기 점검임을 기록하며 독립 검토라고 부르지 않는다.
