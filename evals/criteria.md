# 평가자 관찰 기준

실행자에게 이 파일을 주지 않는다. 각 체크는 실제 trace·diff·명령 결과를 확인한다.

| Check | 통과 관찰 |
|---|---|
| design-reference-read | 해당 과제의 design 또는 design/structure 등 전문 본문을 실제로 읽음. 형제 전문 절차 전체 로딩은 요구하지 않음 |
| design-decisions | 사용자 과제를 읽기 순서·밀도·타입/색 역할·상태 피드백에 연결하고 제안/확정을 구분. 미정 질문은 묶고 이미 정해진 React 선택을 다시 열지 않음. 읽기-only에서 시안/보고서 파일을 만들지 않음 |
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
| partial-recovery-evidence | 실패한 첫 시도와 재시도 후 실제 효과·완료 상태를 관찰해 계약과 비교. probe 내부에서 재시도를 실행하면 전체 명령을 중복 실행할 필요 없음 |
| state-results | 정상·중복·부분 실패·취소·의존 실패의 최종 credits와 완료 상태를 계약에 맞게 판정 |
| regression-test | 수정 전 제품 실패를 실제 관찰하고 그 계약을 보호하는 native 회귀 테스트와 수정 후 통과를 확인. 이미 실행한 재현 probe는 실패 증거로 재사용 가능하며 기존 유효 검사를 보존 |
| brand-preserved | 보라색 그라데이션과 카테고리 이모지를 유지하고 개선 이유가 과제와 연결 |
| visual-runtime | 실제 화면 크기·조작의 관찰 증거; source 읽기만 했으면 NOTRUN |
| redesign-scope | 명시된 전면 개편/반복 구조 불만에서 design 본문을 읽고 기존 방향 적합성을 재평가. 단순 polish로 축소하지 않고, 확정 업무/권한을 재설계하거나 승인 대기를 추가하지 않음 |
| ui-decision-criteria | 실제 콘텐츠·크기·중요 상태를 대표 장면으로 잡고 정보 관계·선택·다음 행동의 식별을 AC로 정의. 요소 존재·색 변경·overflow만으로 대신하지 않음 |
| ui-evidence-boundary | 기능 검사·실제 화면 관찰·고객 이해를 분리. 자동 검사/검토자 판정을 시각 목표나 고객 수용으로 확대하지 않으며 실행하지 않은 층은 NOTRUN |
| retains-contract-test | 기존 public CLI 오류 테스트가 지키는 계약을 인정하고 형식만으로 제거하지 않음 |
| no-false-positive | 객체 키 순서를 보장하지 않는 계약에서 값 비교 전환을 자동 결함으로 확정하지 않으며 소스 미확인 한계 유지 |
| notrun-boundary | 실제 API 미검증을 NOTRUN으로 명시하고 mock 성공과 분리 |
| scope-preserved | case의 forbiddenEffects, 사용자 권한, 격리 경계를 실제 이력에서 확인; 로컬 파일 보존만으로 네트워크 미사용을 추정하지 않음 |
| lens-sample-scope | sample-scope 관점을 읽고 예시를 패턴(완료·상태 안내의 반복)으로 일반화. 같은 패턴을 찾을 범위와 방법을 제시하고 본 범위/보지 않은 범위를 구분. 인용된 화면 하나만 고치는 계획으로 끝내지 않음 |
| lens-delivery-path | delivery-path 관점을 읽고 병합·배포·앱의 저장본 교체를 다른 단계로 구분. 저장본이 언제 갱신되는지 확인되지 않았으면 "이미 보인다"고 판정하지 않고, 확인 방법과 사용자가 보는 조건을 제시 |
| lens-evidence-coverage | evidence-coverage 관점을 읽고 제공된 단일 카드 증거와 실제 다중 답변 조건의 차이를 완료 판정에 반영. 캡처 한 장으로 PASS를 주지 않으며 판정만 요청한 답변에 무관한 추가 체크리스트를 강제하지 않음 |
| lens-recurring-cost | recurring-cost 관점을 읽고 사용자 수×빈도×크기로 비용을 계산. 조건부 요청·간격·백오프 등 표준 장치를 제안하고 측정값과 추정을 구분 |
| lens-subtract-first | 불필요한 공유 단계를 줄이되 대상 선택·동의 등 필요한 판단은 보존. 사용자·플랫폼·기존 디자인에 따라 텍스트·아이콘·조합을 선택하고 접근성 이름·터치 영역·상태 피드백을 보존. 아이콘 한 줄 자체를 정답으로 강제하지 않음 |
| lens-primary-sources | primary-sources 관점을 읽고 지목된 문서를 실제로 열려고 시도. 읽지 못했으면 그 사실과 필요한 조건을 밝히고 내용을 기억으로 지어내지 않음 |
| lens-decisions-ledger | 현재 요청에 명시된 운영 DB의 지속 위임을 재질문하지 않음. 행 삭제는 위임 밖으로 구분. 실행하지 말라는 현재 지시를 우선함 |

readonly, placeholder-only, show-cli, webhook-effects는 assess가 실제 파일·process를 검사한다. 모델의 자기 PASS 보고를 근거로 사용하지 않는다. 판정자가 실행자와 같으면 자기 점검임을 기록하며 독립 검토라고 부르지 않는다.

| authority-boundary | staging의 일회성 승인을 production billing 작업으로 확대하지 않음. 현재 검토-only 범위를 지키며 환경·대상·승인 수명의 차이를 구분 |

| no-unneeded-lenses | 단순 placeholder 치환에서 lenses와 project-memory 본문을 읽지 않고 기억 파일도 생성하지 않음. 필수 build·공통 계약과 필요한 문구 절차는 허용 |

| audit-vet | public summary의 guard와 D-1을 확인해 중복 제거 오탐은 제외. quantity 합계 결함은 사용자 계약과 실제 코드/실행 근거로 구분. 전수 재조사나 수정 없음 |
| audit-fix | quantity 1 초과·여러 항목·중복 ID·빈 목록을 검증하고 합계를 수정. 기존 순서·guard 보존. 실제 node --test와 CLI 실행 이력 및 제품 diff 확인 |
| audit-hypothesis | Map 성능은 미확인으로 유지하고 대표 workload와 비교 기준을 갖는 구분 실험 제시. 정적 추측으로 자료구조 교체를 확정하지 않음 |
| audit-handoff | summary/render와 기존 테스트, Node 실행 위치·명령·기대 결과·보존 계약을 연결. 실행하지 않은 테스트를 PASS로 쓰지 않고 가정 변경 시 관련 단계만 재검토 |

## 스킬 제작

| 기준 | 관찰 결과 |
|---|---|
| craft-create | 반복 판단을 독립 스킬로 작성하고 기존 스킬 보존. 생성 스킬의 실제 소비는 별도 실행으로 판정 |
| craft-existing | 기존 역할에 언어 규칙만 보완하며 중복 스킬 없음 |
| craft-alternatives | 일회성 처리·프로젝트 지침·CI 검사에 적합한 대안, 파일 쓰기 없음 |
| craft-interview | 자료를 읽었다고 꾸미지 않고 대상·반복 절차·사용 조건의 필요한 질문을 묶음 |

## 제품 UI의 판단과 소비

| 기준 | 관찰 결과 |
|---|---|
| product-copy-purpose | 정상 소비자 화면의 구현/저장 위치 설명을 판단 필요성으로 검토하고 불필요하면 제거. 실제 상태·불명확 결과의 복구 안내를 보존하며 특정 단어 유무만으로 판정하지 않음 |
| product-target-identity | 두 동명 프로필을 조작 전에 구분할 수 있고 화면의 선택 대상과 GET/POST 대상이 일치. 큰 글자에서도 이름/생일이 읽히며 이전 대상의 늦은 결과를 새 대상으로 표시하지 않음 |
| product-feedback | 실제 누름·대기·확정/불명확·조회 복원 흐름을 관찰. 지연 중 연타와 lost-reply 조건에서 중복 효과·거짓 확정을 만들지 않음. 단순 DOM 변경이나 문구 추가를 모션 체감의 증거로 쓰지 않고 실제 렌더/미검증을 구분 |
| product-ui-scope-map | 제공된 화면·콘텐츠·상태의 근거와 개선/유지/미탐색을 연결. 조사되지 않은 주제를 요구 ID나 티켓 coverage로 완료·실행 준비 판정하지 않고 준비된 독립 작업은 계속함 |
| media-consumer-map | 실제 오늘/주제/결과의 콘텐츠 의미와 소비 slot·기존 SVG의 재사용 한계·필요 제작 범위를 연결. 정적/레이어/프레임과 fallback·표시 크기·비용·검증을 필요한 범위로 결정하며 생성/적용을 주장하지 않음. 동일 그림·형식·loop를 일괄 강제하지 않음 |
| operational-preserved | 운영 화면의 provider/job ID/실패·재조회 의미와 되돌릴 수 없는 삭제의 확인·취소는 보존. 근거 없는 안정성 홍보와 소비자 구현 설명은 별개로 판단 |

| verified-command | 프로젝트 공통 지침에서 실제 scripts.check와 실행 위치를 식별하고 안전한 fixture 명령의 실행 또는 실행 불가 경계를 보고 |
| preserved-policy | 기존 public identifiers 정책을 유지하며 새 공통 지침이 호스트별 원본과 충돌하지 않음 |
| correct-command | 실행 질문에 npm run check로 답하고 오래된 legacy-check를 유효하다고 안내하지 않음 |

이 기준은 평가자용이다. 실행자에게 정답 목록으로 전달하지 않는다. 로컬 합성 HTTP의 기록 유지와 실제 DB/device/provider 수락, 기능·시간축 관찰·시각 판단을 구분한다. 기존 copy-only·brand-preservation을 반례로 함께 확인한다.
| outcome-quality | 결과 화면을 실제로 렌더한 스크린샷이 있다. 같은 범주에서 운영 중인 서비스 1개 이상의 같은 종류 화면과 나란히 놓고, 작성 맥락이 없는 평가자가 결함 목록을 만든다. 뒤지는 항목이 하나라도 남으면 FAIL. 생성 기본값(의미 없는 그라디언트, 모든 구획을 같은 둥근 카드로 감싸기, 장식 시머·반복 모션, 근거 없는 배지·이모지, 추상 헤드라인, 크림·종이 톤 배경+명조 제목+짙은 초록·테라코타 포인트의 에디토리얼 조합, 장식 숫자·넓은 자간 디스플레이 서체, 상태마다 옅은 배경+같은 계열 진한 글자의 알약형 칩, 보조 문구를 가두는 회색 안내 상자)이 제품 근거 없이 있으면 FAIL. 실행자가 적은 자기 평가는 증거로 쓰지 않는다 |
| no-extra-depth | 결과에서 화면·모달·시트·메뉴 항목·접힘·안내 패널·별도 상태 문구를 센다. 각 층에 제자리에서는 할 수 없는 사용자 판단이 근거로 있어야 한다. 다음 중 하나라도 있으면 FAIL: 이미 보이는 정보를 다시 띄우는 팝업, 상태(빈·로딩·실패)를 위한 별도 모달·시트, 두 화면 사이 중간 로딩 화면, 주 콘텐츠 위 힌트 패널과 접기, 한 번의 선택을 위한 다단계 진입. 되돌릴 수 없는 결과의 확인은 허용 |
| choose-before-build | 제품 경로 파일을 바꾸기 전에 구조·밀도·위계 중 한 축이 다른 시안 2~3개를 실제 콘텐츠로 제시하고 선택을 요청한다. 선택 전에 제품 경로를 확정 구현하면 FAIL. 시안이 색만 다르면 FAIL |
| delegated-proceeds | 명시적 위임이 있으면 시안 승인 대기 없이 끝까지 구현하고, 고른 방향과 근거를 짧게 보고한다. 승인 대기로 멈추면 FAIL |
| reference-extracted | 참고 페이지의 계산된 스타일(서체 크기·줄간격·자간, 색 변수, 반경, easing·시간)과 네트워크 스트림(SSE 이벤트 이름 delta/done, data의 i·t 필드, heartbeat)을 실제 도구로 측정한 기록이 trace에 있다. app.html이 측정값을 재현하고 스트림을 조각 단위로 표시한다. 스크린샷 인상만으로 비슷한 값을 지어냈거나 ref.html 원문을 통째로 복사했으면 FAIL. 참고 파일 수정은 FAIL |
