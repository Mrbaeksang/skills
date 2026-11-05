# Agent 개발 방식 비교

확인일: 2026-11-04. 공식 저장소의 현재 README와 공식 사양을 읽은 조사다. 설치, 초기화, 실행 성능 검증은 하지 않았다. 아래 적용 판단은 문서에 근거한 해석이며 제품 간 우열을 입증하는 실험 결과가 아니다.

## 핵심 구분

| 대상 | 공식 문서에서 확인한 중심 | 적용 판단 |
|---|---|---|
| Matt Pocock skills | 작고 수정 가능한 조합형 skills. `grill-with-docs`, `to-spec`, `to-tickets` 등 사용자가 선택하는 orchestration과 재사용 규율을 구분한다. | 기존 작업 방식을 유지하면서 필요한 단계만 도입하기 좋다. [공식 README](https://github.com/mattpocock/skills) |
| pstack | poteto가 관리하는 Cursor plugin. `/poteto-mode`가 작업에 맞는 playbook을 선택하고 다른 skills를 호출한다. investigation, bug fix, perf, runtime forensics, PR/stack 운영 등을 포함한다. | 재현·측정·검증과 복수 모델 활용이 필요한 엔지니어링 실행에 가깝다. 실제 harness 지원을 확인해야 한다. [공식 README](https://github.com/cursor/plugins/blob/main/pstack/README.md) |
| obra/superpowers | 자동으로 발동하는 skills를 포함한 개발 방법론. 요구 이해, 설계, 구현 계획, TDD, subagent 실행·검토를 연결한다. | 개별 도구보다 일관된 개발 절차를 기본값으로 만들 때 적합하다. 기존 orchestration과 중복되는 단계는 먼저 확인해야 한다. [공식 README](https://github.com/obra/superpowers) |
| GitHub Spec Kit | specification을 plan, tasks, 구현과 convergence로 이어가는 도구. 현재 README는 bug fixing과 idea assessment를 별도 진입점으로 제공하고 extensions/presets/workflows도 구분한다. | 명세와 실행 산출물의 추적이 중요한 작업에 적합하다. 모든 작업에 전체 SDD 순서를 강제하는 도구로만 설명하면 현재 문서를 놓친다. [공식 README](https://github.com/github/spec-kit) |
| Agent Skills | `SKILL.md`, YAML metadata, 선택적 scripts/references/assets의 형식과 점진적 로딩 규약. | 개발 방법론이 아니라 재사용 지식을 포장하는 규격이다. 같은 형식이라고 실행 도구·권한·harness 호환까지 보장되지는 않는다. [공식 사양](https://agentskills.io/specification) |

## pstack 식별과 호환 범위

이 조사에서 pstack은 실제 `cursor/plugins/pstack`을 가리킨다. gstack으로 대체해서 비교하지 않았다. 공식 README는 Cursor 설치와 Claude Code adapter를 설명하며, Claude Code에서 Cursor 전용 기능은 한 줄 설명과 함께 건너뛴다고 명시한다. Codex에서 같은 기능이 그대로 실행된다는 검증은 이번 조사에 없다. [pstack README](https://github.com/cursor/plugins/blob/main/pstack/README.md)

## 간결한 AGENTS.md 운영

Matt Pocock의 `writing-for-agents`는 상시 로딩 문서의 비용과 필요할 때 읽는 참조 문서의 비용을 구분한다. 문서 전체를 무작정 줄이기보다 모든 작업에 필요한 규칙은 본문에 남기고, 특정 분기에만 필요한 내용은 읽는 조건과 경로가 명확한 pointer 뒤로 옮기는 방식이다. 실행 단계에는 완료 조건이 있어야 한다. [공식 skill](https://github.com/mattpocock/skills/blob/main/skills/productivity/writing-for-agents/SKILL.md)

이 원칙을 적용하면 AGENTS.md에는 공통 작업 경계, 실제 검증 명령, 완료 보고 기준과 문서 진입 조건을 남기고, 긴 절차는 개별 skill/reference에 두는 구성이 합리적이다. 이는 조사자의 적용 제안이며 AGENTS.md의 보편적 강제 규격은 아니다.

Agent Skills 사양도 metadata → 활성화된 SKILL.md → 필요한 resources 순서의 로딩을 설명하고, 본문 500줄 미만과 상세 참조의 분리를 권장한다. 이 수치는 권장치이며 임의의 AGENTS.md 길이 제한으로 옮기면 안 된다. `allowed-tools`는 실험적 필드이고 구현별 지원이 다를 수 있다. [공식 사양](https://agentskills.io/specification)

## 운영 제안

1. 공통 권한·환경·완료 기준은 AGENTS.md에서 관리한다.
2. 프로젝트의 주된 orchestration은 하나를 선택하고 다른 패키지에서는 필요한 규율만 호출한다. 여러 전체 절차의 동시 자동 발동은 이 조사에서 검증하지 않았다.
3. 작은 수정에는 필요한 skill만, 요구·설계 합의가 필요한 변경에는 spec/tickets 흐름, 측정 가능한 성능 문제에는 재현·baseline·측정 흐름을 선택한다.
4. 설치된 skill과 upstream 최신 README의 이름·동작은 다를 수 있다. 실제 사용 시 로컬 SKILL.md와 사용 가능한 도구를 다시 확인한다.

위 제안은 비교 문서에서 도출한 운영 판단이다. 설치 명령 실행, 모델별 품질/비용 비교, plugin 동시 사용 테스트는 수행하지 않았다.
