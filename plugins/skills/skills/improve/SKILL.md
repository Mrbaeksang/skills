---
name: improve
description: 레포 전체의 공통화·모듈 경계·의존성 업그레이드·CSS·프론트·데이터 병목을 진단해 실행 가능한 개선 항목을 만들고, 허용된 개선은 전후 측정과 회귀 검증까지 수행한다. 특정 버그 재현은 diagnose 범위다.
---

# Improve

레포 전체 진단이면 [분야별 진단](references/repository-audit.md)으로 적용 영역을 먼저 선별한다. 특정 영역 요청이면 그 영역만 조사한다. 아래 전문 절차는 해당 문제 신호가 있을 때만 실행한다.

| 확인한 문제 | 전문 절차 |
|---|---|
| 도메인 용어·소유권 충돌 | [domain](references/workflows/domain.md) |
| 공통화·순환·모듈 경계 | [architecture](references/workflows/architecture.md) |
| 외부 기술 사실·대안 근거 부족 | [research](references/workflows/research.md) |
| 실행 버전·설정 불일치, 무효 옵션·자원 누적 신호 | [실행 환경 계약](references/workflows/runtime-contract.md) |
| 의존성 호환·지원·버전 이행 | [upgrade](references/workflows/upgrade.md) |
| CSS·프론트·데이터·자원 병목 | [optimize](references/workflows/optimize.md) |
| 불필요한 코드·과잉 추상화 | [clean](references/workflows/clean.md) |
| 테스트의 중복·구현 결합·보호 계약 불명확 | [테스트 가치](references/workflows/test/value.md) |
| UI·문구의 위계·일관성 | [polish](references/workflows/polish.md) |

각 후보를 깊게 조사하기 전에 위 표의 해당 절차를 읽고, 문제 근거·보존할 계약·검증 결과를 개선 항목에 합친다. 조사 중 새 원인 신호가 나오면 해당 후보에 대해서만 다시 선택한다. 진단-only 권한과 현재 근거를 전문 절차에도 전달한다. 전체 분야를 전수 실행하지 않는다.

먼저 [공통 실행 계약](references/execution-contract.md)을 읽는다. 코드 수정을 시작하거나 작업 branch/worktree를 통합·정리할 때는 [작업 공간 수명주기](references/workspace-lifecycle.md)를 읽고 생성부터 안전한 정리 영수증까지 적용한다. 분석-only 요청은 읽기와 허용된 관찰로 끝내며 코드·설정·보고서 파일을 임의로 쓰지 않는다. 실행 권한이 있으면 기존 작업을 보존하면서 근거가 있는 최소 개선까지 이어간다.

1. **범위와 상태.** cwd, branch/worktree, 지침, 변경 파일, 도구와 목표를 확인한다. 분석/구현 권한, 대상 subsystem, 사용자 use case, 시간·실행 비용 한도를 기록한다. 이미 정해진 목표는 재질문하지 않는다.
2. **지도와 coverage.** [탐색 절차](references/exploration.md)를 읽고 전체 디렉터리·manifest·entrypoint에서 시작한다. 모듈 소유 데이터, 공개 계약, 의존 edge와 주요 use case의 호출/데이터 경로를 근거 위치와 연결한다. 각 subsystem을 목록만 확인/소스 추적/실행 확인/미탐색으로 구분한다. 일부 경로 추적을 전체 코드베이스 검증이라고 부르지 않는다.
3. **후보에서 가설로.** churn, 복잡도, fan-in/out, 순환, 중복을 조사 신호로 사용한다. 후보마다 구체적 도메인 계약, 변경 파급, 테스트 경계나 관찰된 비용으로 검증한다. 숫자가 높다는 사실만으로 결함을 선언하지 않는다. 확인되지 않은 후보는 가설로 남긴다.
4. **개선과 검증.** 분석-only에서는 관찰을 위한 실행도 허용 범위 안에서 수행하고 수정은 제안으로 남긴다. 구현 허용 시 작은 개선은 직접 실행하거나 build에 전달한다. 관련 [test](references/workflows/test.md)와 [verify](references/workflows/verify.md) 결과를 재사용하며 구조 개선은 계약·소유권·소비자 영향, 성능은 같은 workload의 전후 측정으로 판정한다. 고위험 변경은 독립 검토한다.
5. **판정.** 채팅에 우선순위별 `AS-IS → TO-BE | 영향 | 근거 | 비용 | 위험 | 검증 상태`를 간결히 보고한다. 확인한 coverage와 미탐색 영역, PASS/FAIL/NOTRUN을 함께 남긴다. 근거와 목표가 충족되면 중단하며 HTML은 요청된 경우만 만든다. 도구 부족은 가능한 읽기 대체와 재개 조건을 제시하고 실행 성공으로 바꾸지 않는다.

개선 후보는 `문제·근거 위치 / 판정과 다음 행동 / 보존할 계약 / 변경 범위·순서 / 수용 기준·검증 / 우선순위·위험`으로 정리한다. 탐색 절차에서 미확인으로 남긴 후보는 수정 대신 구분 실험으로 넘긴다. 작은 항목은 채팅에서 build에 직접 전달하고 큰 작업만 독립 실행 단위로 나눈다. 다른 세션에 넘길 때는 실제 재사용 경로·기존 테스트 예시·실행 위치와 명령·관찰할 결과·이미 있는 실패·재검토할 가정을 필요한 만큼 연결한다. 실행하지 않은 명령을 검증됐다고 쓰지 않는다. 실행까지 요청받았다면 재인터뷰나 문서 재작성 없이 구현·검증을 이어간다. build를 사용할 수 없으면 같은 계약으로 직접 실행하며 실제 호출하지 않은 스킬을 호출했다고 보고하지 않는다. 분석-only에서는 제안으로 끝낸다. 별도 보고서·티켓 게시를 자동으로 추가하지 않는다.

방법론 선택 근거와 도구 전제는 [출처 비교](references/methods.md)에 있다. upstream 비교나 이식성 판단이 필요하면 읽는다.
