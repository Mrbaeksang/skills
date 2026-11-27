---
name: build
description: 명세·티켓·충분한 요청을 구현하고 실제 동작을 검증한다. 일반 앱·웹사이트의 지정 문구 치환도 포함한다. 발표 슬라이드 편집은 present가 담당한다. 기존 UI의 디자인·문구를 새로 다듬는 작업은 polish로 구분한다.
---

# Build

[공통 실행 계약](references/execution-contract.md)과 코드 변경 시 [작업 공간 수명주기](references/workspace-lifecycle.md)를 적용한다. 직접 입력이 충분하면 shape·spec·ticket을 다시 거치지 않는다.

**새 화면이나 새 사용자 흐름**(기존 흐름의 구조 변경 포함)이면 코드를 쓰기 전에 [UI 품질 기준](references/workflows/ui-quality-bar.md)을 읽는다. 사용자가 결정을 명시적으로 맡기지 않았다면, 실제 콘텐츠로 만든 시안 2~3개를 보여 주고 선택을 받은 뒤 제품 파일을 만든다. 층(모달·시트·탭·접기·안내 패널)은 제자리에서 할 수 없는 판단이 있을 때만 더한다.

**대상과 새 문구가 모두 지정된 단순 치환**은 현재 작업본과 기존 변경을 확인하고 해당 문구가 쓰이는 위치를 찾는다. 한 곳에서만 쓰면 지정한 값만 바꾸고 diff와 그 위치의 실제 표시를 확인한 뒤 끝낸다. 실행할 수 없는 표시는 미확인으로 남긴다. 공유 번역 키·컴포넌트라면 소비 범위를 먼저 확인하고 요청한 화면에만 적용할 방법을 고른다. 문구 선택을 위임받았거나 동작·데이터 계약도 바뀌면 아래 절차에서 해당 조건을 따른다.

1. **현재 상태.** cwd·branch/worktree·지침·tracked/untracked 변경·도구를 확인한다. tracker 입력이면 본문·수용 기준·선행 의존성을 읽고 [상태 계약](references/tracker-state.md)을 적용한다. 입력이 대화·shape에서 정한 여러 단계의 결정인데 tracker에 없고 프로젝트가 요구사항을 tracker에 두면, 구현 전에 결정 전체와 단계를 저장하거나 저장 여부를 확인하고 이번 작업이 그중 어느 단계인지 정한다. 중요 범위·권한 불명확성만 질문하고 기존 변경을 보존한다.
2. **완료 기준.** 사용자 행동·상태 전이·환경 의존 요구는 [행동 시나리오](references/workflows/scenarios.md)를 읽고 원본 시나리오와 검증 환경을 이어받는다. 없으면 필요한 범위만 보완한다. 구현 전에 자동 테스트 경계와 실제 환경 검증의 실행 가능성을 확인한다. 이미 결정된 내용은 재사용하며 빠진 제품 결정과 자율 판단할 구현 선택을 구분한다. 개선 항목에 근거 위치·보존할 계약·변경 범위·수용 기준이 있으면 바로 구현 입력으로 쓴다.
3. **기존 구현 확인.** [재사용·연결 탐색](references/workflows/architecture/integration.md)으로 관련 handler·config·client·component의 실제 경로와 소비자를 찾는다. 아래 표에서 다음 변경에 필요한 절차를 선택해 본문을 읽고 수행한 뒤 구현한다. 구현 중 새 규칙·외부 API·실패가 드러나면 그 변경 전에 다시 선택한다. 기술별 전문성이 부족하면 공통 계약의 설치된 전문 스킬 탐색을 적용한다.
4. **동작 단위 구현.** 한 use case씩 기존 구조 안에서 구현한다. 비자명한 로직·버그·공유 계약 변경의 테스트에는 [test](references/workflows/test.md)를 사용한다. 단순 문구·설정 수정에 형식적인 TDD를 강제하지 않는다. 변경 diff는 [clean](references/workflows/clean.md)으로 점검하되 중복 검증을 만들지 않는다.
5. **실행 확인.** 동작 단위가 준비될 때마다 [verify](references/workflows/verify.md)로 원본 시나리오의 실제 API·CLI·UI 경계와 기존 소비자 회귀를 확인하고 4–5를 반복한다. 코드 작성·테스트·실제 실행 증거를 구분한다. 실행 가능한 검증을 사용자에게 넘기지 않는다.
6. **완료 판정.** 인증·결제·데이터 변경은 독립 검토에 고정 base/head·명세·diff를 전달한다. 같은 출처의 review 또는 독립 검토자를 사용하고 자기 점검으로 대신하지 않는다. 필요한 독립 검토·수용 기준에 미해결 FAIL/NOTRUN이 있으면 done이 아니다. 수정 후 새 head의 영향을 재검증한다. tracker 상태는 상태 계약대로 readback하고 결과·검증·남은 문제를 짧게 보고한다. 여러 단계 결정의 일부를 구현했으면 끝낸 단계와 아직 하지 않은 단계를 함께 말한다.

| 조건 | 전문 절차 | 필요한 결과 |
|---|---|---|
| 도메인 규칙·소유권이 불명확 | [domain](references/workflows/domain.md) | 용어·불변식·공개 계약 |
| 모듈 경계·공통 책임을 바꿔야 함 | [architecture](references/workflows/architecture.md) | 재사용/확장/신규 판단과 소비자 영향 |
| 웹 UI·CSS·브라우저 API의 구현 방식이나 지원 범위를 판단 | [웹 플랫폼 근거](references/workflows/web-platform.md) | 관련 가이드·대상 환경·채택 근거 |
| API·기술 호환 사실이 부족 | [research](references/workflows/research.md) | 공식 근거와 버전·제약 |
| 외부 기능·옵션 사용/변경 또는 실행 환경 차이 | [실행 환경 계약](references/workflows/runtime-contract.md) | 실제 조합·실효 설정의 지원 근거와 효과 |
| 의존성 버전을 변경 | [upgrade](references/workflows/upgrade.md) | 코드 이행과 검증 결과 |
| 성능 목표·병목 개선 | [optimize](references/workflows/optimize.md) | baseline·변경·같은 조건의 전후 결과 |
| 새 화면·새 흐름 또는 구조·표현을 재설계 | [UI 품질 기준](references/workflows/ui-quality-bar.md), [디자인](references/workflows/design.md) | 비교 기준 서비스, 구현 전 시안 선택, 층 근거와 대표 장면; 지정 문구 치환은 제외 |
| 기능 구현 중을 포함해 UI·사용자 문구를 생성/변경 | [UI·문구 기준](references/workflows/polish/ui-copy.md) | 문구의 필요성·실제 대상·상태별 표현과 관찰 결과 |
| 기존 UI·문구의 완성도 개선 요청 | [polish](references/workflows/polish.md) | 브랜드·동작을 보존한 정리 |

인계된 개선 항목은 수정·구분 실험·제외·보류 중 판정과 근거부터 확인한다. 미확인 가설이면 필요한 실험을 먼저 하고 수정 요구로 승격하지 않는다. 여러 단계의 실행 계획은 [작업 기록](references/agent-records.md)에 따라 기존 원본에서 진행과 관찰을 갱신한다. 다른 세션의 계획은 재사용할 실제 경로·테스트 예시와 실행 위치·명령·기대 관찰·기존 실패를 확인한다. 가정이 깨지면 영향받는 단계만 재계획하고, 중대한 제품 결정·권한 밖 변경만 질문한다. 사소한 코드 이동이나 명령 경로 수정 때문에 전체 작업을 중단하지 않는다.

전문 절차가 이미 실행한 동일 검증은 결과를 확인해 재사용하고 이후 변경이 영향을 줄 때만 반복한다. 모든 전문 절차를 선행 필수 단계로 만들지 않는다.
