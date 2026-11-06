---
name: build
description: 명세·티켓·충분한 요청을 구현하고 실제 동작을 검증한다. 지정된 문구 치환 같은 작은 코드 수정도 포함한다. 기존 UI의 디자인·문구를 새로 다듬는 작업은 polish로 구분한다.
---

# Build

[공통 실행 계약](references/execution-contract.md)과 코드 변경 시 [작업 공간 수명주기](references/workspace-lifecycle.md)를 적용한다. 직접 입력이 충분하면 shape·spec·ticket을 다시 거치지 않는다.

1. **현재 상태.** cwd·branch/worktree·지침·tracked/untracked 변경·도구를 확인한다. tracker 입력이면 본문·수용 기준·선행 의존성을 읽고 [상태 계약](references/tracker-state.md)을 적용한다. 중요 범위·권한 불명확성만 질문하고 기존 변경을 보존한다.
2. **완료 기준.** 각 요구를 use case·실행 경계·정상/실패 결과·검증에 연결한다. 이미 결정된 내용은 재사용하며 빠진 제품 결정과 자율 판단할 구현 선택을 구분한다. 개선 항목에 근거 위치·보존할 계약·변경 범위·수용 기준이 있으면 바로 구현 입력으로 쓴다.
3. **기존 구현 확인.** [재사용·연결 탐색](references/workflows/architecture/integration.md)으로 관련 handler·config·client·component의 실제 경로와 소비자를 찾는다. 아래 표에서 필요한 전문 절차만 실행하고 결과를 구현에 반영한다.
4. **동작 단위 구현.** 한 use case씩 기존 구조 안에서 구현한다. 비자명한 로직·버그·공유 계약 변경의 테스트에는 [test](references/workflows/test.md)를 사용한다. 단순 문구·설정 수정에 형식적인 TDD를 강제하지 않는다. 변경 diff는 [clean](references/workflows/clean.md)으로 점검하되 중복 검증을 만들지 않는다.
5. **실행 확인.** [verify](references/workflows/verify.md)로 수용 기준의 실제 API·CLI·UI 경계와 기존 소비자 회귀를 확인한다. 코드 작성·테스트·실제 실행 증거를 구분한다. 실행 가능한 검증을 사용자에게 넘기지 않는다.
6. **완료 판정.** 인증·결제·데이터 변경은 독립 검토에 고정 base/head·명세·diff를 전달한다. 같은 출처의 review 또는 독립 검토자를 사용하고 자기 점검으로 대신하지 않는다. 필요한 독립 검토·수용 기준에 미해결 FAIL/NOTRUN이 있으면 done이 아니다. 수정 후 새 head의 영향을 재검증한다. tracker 상태는 상태 계약대로 readback하고 결과·검증·남은 문제를 짧게 보고한다.

| 조건 | 전문 절차 | 필요한 결과 |
|---|---|---|
| 도메인 규칙·소유권이 불명확 | [domain](references/workflows/domain.md) | 용어·불변식·공개 계약 |
| 모듈 경계·공통 책임을 바꿔야 함 | [architecture](references/workflows/architecture.md) | 재사용/확장/신규 판단과 소비자 영향 |
| API·기술 호환 사실이 부족 | [research](references/workflows/research.md) | 공식 근거와 버전·제약 |
| 외부 기능·옵션 사용/변경 또는 실행 환경 차이 | [실행 환경 계약](references/workflows/runtime-contract.md) | 실제 조합·실효 설정의 지원 근거와 효과 |
| 의존성 버전을 변경 | [upgrade](references/workflows/upgrade.md) | 코드 이행과 검증 결과 |
| 성능 목표·병목 개선 | [optimize](references/workflows/optimize.md) | baseline·변경·같은 조건의 전후 결과 |
| UI·사용자 문구를 생성/변경 | [UI·문구 기준](references/workflows/polish/ui-copy.md) | 실제 동작과 일치하는 화면·문구 |
| 기존 UI·문구의 완성도 개선 요청 | [polish](references/workflows/polish.md) | 브랜드·동작을 보존한 정리 |

전문 절차가 이미 실행한 동일 검증은 결과를 확인해 재사용하고 이후 변경이 영향을 줄 때만 반복한다. 모든 전문 절차를 선행 필수 단계로 만들지 않는다.
