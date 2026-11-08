# 조건부 검증과 평가

2026-11-06 대화 명세 QA-R01~QA-R11의 구현 범위다. 기존 17개 스킬과 DDD/use case 중심 원칙을 유지한다. 새 사용자 명령·vendor runtime·상시 에이전트 파이프라인은 만들지 않는다.

| 요구 | 구현 원본 | 검증 |
|---|---|---|
| QA-R01 조건부 참조 | 각 진입점 및 workflows | evals/routing, standalone closure |
| QA-R02 조회 내용 판정 | workflows/research.md | research-errors |
| QA-R03 관찰에서 다음 실험 | verify/exploration.md | state-recovery, state-repair |
| QA-R04 상태·복구 | verify/stateful.md | state-recovery, state-repair, missing-service |
| QA-R05 검증 기준 약화 | review/gate-integrity.md | state-review, justified-gate |
| QA-R06 소비자 영향 | review/consumers.md | state-review |
| QA-R07 테스트 유지 가치 | test/value.md, improve 라우팅 | test-value |
| QA-R08 선택·실행 평가 분리 | evals, scripts/evaluate.mjs | 도구 테스트 + 실제 세션을 별도 판정 |
| QA-R09 설치·전환 | evals/installation/cases.md | 격리 native 및 npx 설치, 새 세션 호출 별도 |
| QA-R10 단독 설치·이식성 | 기존 package.mjs의 closure | package tests, smoke:install |
| QA-R11 지침 증식 억제 | docs/development.md | 기존 규칙·변경 사례·크기 차이 검토 |

## 차용과 제외

외부 구현을 복사하거나 설치하지 않고 다음 원리를 우리 권한·보고·설치 계약에 맞춰 새로 작성했다. 원문 업데이트는 자동 실행 지침이 아니며 갱신 때 적용 가능성을 재검토한다.

- Google Skills `c2cf4ba74c0e47f0e7a81d29e053e740998a0ae2`: [조건별 발견](https://github.com/google/skills/blob/c2cf4ba74c0e47f0e7a81d29e053e740998a0ae2/skills/developers/finding-google-skills/SKILL.md), [조회 오류 판정](https://github.com/google/skills/blob/c2cf4ba74c0e47f0e7a81d29e053e740998a0ae2/skills/developers/retrieving-developer-knowledge/SKILL.md). Google 전용 MCP·인증·단계별 승인·전체 카탈로그는 제외.
- gstack `eaf1701da2d68b5c03136ff530aa228013eedb7c`: [기능 QA](https://github.com/garrytan/gstack/blob/eaf1701da2d68b5c03136ff530aa228013eedb7c/qa/sections/system-functional.md), [리뷰](https://github.com/garrytan/gstack/blob/eaf1701da2d68b5c03136ff530aa228013eedb7c/review/checklist.md), [테스트 가치](https://github.com/garrytan/gstack/blob/eaf1701da2d68b5c03136ff530aa228013eedb7c/test-audit/SKILL.md.tmpl), [스킬 유지보수](https://github.com/garrytan/gstack/blob/eaf1701da2d68b5c03136ff530aa228013eedb7c/write-skill/SKILL.md.tmpl). 자체 브라우저·Bun·자동 수정 리뷰·자동 범위 확대·각 실험의 의무 JSON 보고는 제외.

## 완료 구분

2026-11-07 조건부 연결 보강은 [Matt Pocock의 직접 합성](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md), [gstack의 목적별 라우터](https://github.com/garrytan/gstack/blob/main/SKILL.md), [Superpowers의 세션 진입 훅](https://github.com/obra/superpowers/blob/main/hooks/hooks.json), [Agent Skills의 절차·기본값 지침](https://agentskills.io/skill-creation/best-practices)을 비교했다. 이 링크의 main은 변경 가능하다. 첫 행동에 읽기 조건을 배치하고 결과를 부모에 반영하는 원리만 적용했다. 모든 요청의 강제 호출, 세션 훅·telemetry·특정 호스트 런타임은 추가하지 않았다. 새 behavior 사례 `shape-specialist-results`, `shape-new-answer`, `shape-existing-decision`은 필요한 로딩·조건 변화·불필요한 로딩을 구별한다. 후속 답변을 입력한 단일 실행 사례는 실제 다중 턴 성공 증거가 아니다.

소스·패키징 통과, 모델 행동 검증, 배포/설치는 서로 다른 완료 상태다. 평가 결과가 없는 사례를 구현했다고만 해서 PASS로 표시하지 않는다. 모델·호스트를 관찰하지 못하면 미확인으로 기록한다. source SHA 외에 실제 파일 hash가 dirty snapshot을 구별한다. 사용자 설정을 직접 수정하는 자동 전환 도구는 이번 범위가 아니다.

## 디자인 조건부 참조 평가

디자인은 사용자 과제 → 표현 선택 → 필요한 전문 절차 → 원래 작업에 반영하는 흐름으로 연결한다. [Jakub Krehel의 layout 절차](https://github.com/jakubkrehel/skills/blob/157da62016338e8693dcff93d47154a9e36f2157/skills/better-layout/SKILL.md)와 같은 revision의 typography·interface·variant를 조사했다. 구체적 선택과 실제 콘텐츠 비교 원리만 반영하고, 고정 미감·수치·전체 참조 일괄 로딩은 채택하지 않았다.

2026-11-08 `gpt-6.1-sol`/`low` collaboration 세션에서 이전/이후 동일 입력 3쌍(디자인 2턴, 기술 조사, 작은 문구 변경), 추가 3사례(브랜드 유지, 대안 비교, 운영 조건 변경)를 실행했다. 실제 도구 trace에서 참조 읽기와 공식 자료 조회를 확인했다. 별도 metadata 선택 시험은 17개 진입점을 포함한 18요청 모두 예상 경로와 일치했다. 이전 버전도 조사와 작은 작업의 범위 제한은 작동했다. 이번 변경의 관찰 결과는 디자인 전문 절차 연결이며, 미적 품질 향상이나 모든 요청의 자동 호출 보장은 아니다.

단일 회차이며 무스킬 대조군은 없다. 본문 시험은 지정 진입점에서 시작했으므로 native 자동 발견과 구별한다. Windows CLI pilot은 읽기 정책 거부로 제외했다. 브랜드 사례는 browser DOM의 360px overflow를 확인했으나 화면 캡처 실패로 시각 검증은 NOTRUN이다. 로컬 증거는 ignored `.artifacts/evals/design-rnd/`의 입력·trace·hash·결과이며, 개인 세션 trace를 배포물에 포함하지 않는다. 이후 모호한 UI 지침 한 문장을 명료화했으며 그 문장 수정 이후 모델 재실행은 별도 미검증이다.
