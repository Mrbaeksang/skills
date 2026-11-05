---
name: review
description: 명세와 고정된 diff의 요구 위반·문서화된 규칙 위반·회귀 위험을 검토한다. 변경 리뷰와 인증·결제·데이터 변경의 독립 검토에 사용하며 전체 코드베이스 개선은 improve에서 다룬다.
---

# Review

코드 품질 후보에는 [clean](references/workflows/clean.md), 테스트의 경계·기대값 문제에는 [test](references/workflows/test.md)를 검토-only로 적용한다. 도메인 계약 또는 구조 해석이 불명확할 때만 [domain](references/workflows/domain.md)·[architecture](references/workflows/architecture.md), UI·문구에는 [품질 기준](references/workflows/polish/ui-copy.md)을 읽는다. 공개 실행 증거를 확인해야 하면 [verify](references/workflows/verify.md)의 해당 경계만 검증한다. 전문 절차를 읽었다는 이유로 수정 권한이나 독립 검토 완료를 주장하지 않는다.

먼저 [공통 실행 계약](references/execution-contract.md)을 읽는다. 명세와 diff만으로 직접 시작하며 다른 스킬 호출은 선행 조건이 아니다. 기본 산출물은 findings와 검토 한계다. 수정·외부 게시·상태 전환은 요청된 권한 범위에서만 한다.

1. **범위 고정.** 실제 저장소/worktree와 기존 변경을 확인하고 요청된 base/head를 불변 commit ID로 해석한다. 명세·이슈·적용 지침의 버전 또는 내용을 함께 고정한다. merge-base를 쓰는지 두 commit의 tree를 비교하는지 명시한다. 미커밋 변경은 별도 snapshot/hash로 구분하고 검토 중 움직인 HEAD를 원래 범위에 섞지 않는다. 저장소 없이 제공된 diff라면 원본 이름·hash와 제공된 context의 한계를 기록한다. 완료 조건은 변경 파일 목록과 검토 계약이 확정된 상태다.
2. **독립성 확보.** 인증·결제·데이터 변경이면 [독립 검토와 완료 gate](references/independent-review.md)를 읽고 실행자와 구분된 검토 주체/세션을 확보한다. 일반 검토도 자기 점검인지 독립 검토인지 실제 수행 방식을 밝힌다.
3. **근거 수집.** 각 변경 파일과 필요한 caller·계약·테스트를 읽고 정상·실패·권한·경계·회귀 흐름을 추적한다. 변경이 도입한 문제와 기존 결함을 구분한다. 허용된 재현은 실제 결과를 기록하고 실행하지 않았다면 source reasoning으로 표시한다. 일부만 읽었다면 미탐색 파일과 이유를 남긴다.
4. **후보 반증.** 후보마다 실제 도달 경로, 영향받는 입력과 사용자, 이미 있는 guard/테스트, 반례를 확인한다. documented rule 위반은 적용 문서와 정확한 조항을 인용한다. 요구 위반은 요구 ID/계약과 연결한다. heuristic은 추정 위험으로 분리하며 취향·추상화 선호·일반 best practice를 프로젝트 규칙이라고 부르지 않는다. 근거가 부족한 후보는 확정 finding에서 제외하고 필요한 확인만 남긴다.
5. **결론 기록.** finding마다 우선순위, 분류, head 기준 파일/줄, 재현 또는 source 근거, 사용자 영향, 필요한 수정 방향을 짧게 적는다. 긴급 장애/노출은 P0, 주요 기능·권한·데이터 무결성 손상은 P1, 제한적인 결함은 P2, 낮은 영향은 P3로 영향에 맞춰 정한다. 같은 원인의 중복은 합친다. findings가 없으면 없다고 보고하되 안전 보증으로 확대하지 않는다. 검토한 base/head·명세, 실제 검사, 미검증 및 미탐색 범위, 독립성, 미해결 finding과 완료 판단을 함께 남긴다.
