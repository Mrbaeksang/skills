---
name: polish
description: 사용자 과제와 요청 범위를 기준으로 UI·문구를 개선한다. 부분 정리와 요청된 구조·시각 재설계를 구분하고 실제 화면에서 다듬는다. 수정 없는 검토는 review, 지정 문자열만 치환하는 구현은 build로 구분한다.
---

# Polish

먼저 [공통 실행 계약](references/execution-contract.md)을 읽는다. 코드를 수정하거나 작업 공간을 통합·정리하면 [작업 공간 수명주기](references/workspace-lifecycle.md)를 적용한다. 코드를 바꾸기 전에 [UI 품질 기준](references/workflows/ui-quality-bar.md)을 읽고 적용한다. 새 화면·재설계는 완성 후 맥락 없는 검토자와의 나란히 비교를 최대 3회 반복하고, 뒤지는 항목이 남으면 미완료로 보고한다. 명시적 위임이 없으면 시안을 보여 주고 선택을 받은 뒤 구현하며, 층은 제자리에서 할 수 없는 판단이 있을 때만 더한다. [polish 전문 절차](references/workflows/polish.md)를 실행한다. 입력과 기존 결정을 재사용하고 요청된 결과만 반환한다. 다른 스킬 설치는 필요하지 않다.
