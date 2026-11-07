# 평가자 관찰 기준

실행자에게 이 파일을 주지 않는다. 각 체크는 실제 trace·diff·명령 결과를 확인한다.

| Check | 통과 관찰 |
|---|---|
| scenario-definition | scenarios 본문을 읽고 원본 명세 안에 actor·시작 환경·단계별 관찰·실패/복구·검증 경계를 정의. 최종 전송 성공만으로 축약하지 않고 실행 전 계획과 결과를 구분 |
| scenario-evidence-boundary | scenarios 및 UI 검증을 읽고 UC-CHAT의 실제 키보드·WebView 전환은 NOTRUN으로 판정. 작은 viewport·합성 resize 증거 범위와 남은 단계별 검증 및 필요한 환경을 구분 |
| scenario-test-reuse | scenarios를 읽고 AC-7/UC-CHAT과 기존 상태 머신 테스트를 재사용. 자동 테스트의 보호 계약과 실제 환경 관찰을 나누고 미확보 환경을 구현 전에 드러냄. 모든 조합/E2E나 동일 unit test를 중복 생성하지 않음 |
| scenario-no-expansion | 읽기 이력에 scenarios 절차 로딩이 없고 단순 문구 변경을 시나리오 설계·기획·테스트 작업으로 확대하지 않음 |
| scenario-export-risks | scenarios를 읽고 접수→생성→다운로드의 비동기 경계에서 중간 상태·재조회·실패 복구와 사용자별 접근 검증을 도출. 각 조건을 관찰 결과에 연결하고 미정인 보존/재시도 정책을 확정하지 않음. 키보드 등 무관한 항목으로 대체하지 않음 |
| scenario-scheduler-risks | scenarios를 읽고 외부 발송 효과와 DB 기록 사이의 실패/재실행, 지연·시간 경계를 누락/중복 계약에 연결. mock이 생략하는 실제 효과를 구분하고 요청 ID 조회를 재사용할 검증을 제시. 모든 조합 나열이나 성공 응답 검사에 머무르지 않음 |
| scenario-editor-risks | scenarios를 읽고 외부 선택기로 넘어갔다 복귀하는 경계와 서버 저장 경계를 구분. 선택 취소/복귀 시 초안 보존, 저장 진행·실패/재시도와 실제 저장 효과를 검증 조건 및 관찰 결과에 연결. 특정 OS 버그 목록을 요구하지 않음 |
| domain-before-expectation | test에서 domain 본문을 실제 읽고 상충된 취소·승격 정책을 사용자 결정으로 남김. 임의 기대값 대신 결정별 검증 시나리오를 구분 |
| architecture-before-merge | clean에서 architecture 본문을 실제 읽고 서로 다른 소유권·환불 계약을 보존. 함수 이름이 같다는 이유로 공통화를 확정하지 않음 |
| shape-domain-read | domain 본문을 실제로 읽고 예약·정원·취소·승격 등 해당 업무의 규칙과 열린 질문에 적용 |
| shape-architecture-read | architecture 및 필요한 하위 참조를 실제로 읽고 소유 경계·공통 오류 책임 또는 변경된 운영 구조에 적용 |
| shape-research-read | research 본문을 실제로 읽고 현재 지원 사실과 제공된 사실을 구분. 외부 조회 금지일 때 조회를 실행하지 않고 필요한 근거·조건부 대안을 반환 |
| specialist-results-used | 참조 읽기에서 끝나지 않고 나온 규칙·구조·기술 미정을 부모의 결정/독립 질문 묶음에 반영. 사용자가 별도 전문 스킬을 호출하도록 넘기지 않음 |
| changed-constraint-reroutes | 새 답변의 동시 리전·정원 불변식이 기존 단일 서버 결정을 무효화함을 식별하고 필요한 절차를 다시 선택. 기존 용어·확정 사실은 재질문하지 않음 |
| bounded-load | 무관한 전문 절차 전수 로딩 없이 현재 작업과 연결된 참조만 읽음. 하위 참조는 필요성과 함께 판정 |
| no-unneeded-specialists | 실제 읽기 이력에 domain·architecture·research·test·verify 등 무관한 전문 절차가 없고 요청된 언어 선택만 다룸 |
| runtime-legacy | runtime-contract를 읽고 legacy와 supported probe로 성공 응답과 만료 효과를 구분. 선언/해결 client와 배포 server, 미지원 옵션이 무시되는 원인을 연결하고 simulator 한계를 명시 |
| runtime-override | runtime-contract를 읽고 override·supported·unavailable probe 실행. effective 설정 원인과 계약 FAIL, 미관찰 NOTRUN을 구분하며 버전 업그레이드로 자동 해결하지 않음 |
| usecase-tests | 저장/조회/시간 경과와 만료 전후 결과에서 테스트를 도출. 순수 경계 규칙의 unit test와 연동 계약 검증을 구별하고 실제 환경의 미검증을 명시. 내부 함수별 테스트·모든 E2E를 강제하지 않음 |
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
| selected-route | 요청의 목적에 맞는 진입 스킬을 실제 선택하고 그 본문을 읽음. catalog만으로 선택한 평가는 metadata 선택 증거로만 기록하며 이 기준의 실행 PASS와 구분 |
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
