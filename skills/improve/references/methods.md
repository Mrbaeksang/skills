# 방법론 근거와 이식성

확인일: 2026-11-05. 아래는 원문을 읽고 절차를 비교한 결과다. 외부 skill 코드/문구를 복사한 배포물이 아니며 독자 작성한 workflow다. 다른 방법론에 기능이 없다는 전역 주장을 하지 않는다.

| 원문 | 확인한 절차와 전제 | 이 skill의 적용 판단 |
|---|---|---|
| [Matt Pocock codebase-design](https://github.com/mattpocock/skills/blob/main/skills/engineering/codebase-design/SKILL.md) | 작은 interface 뒤의 deep module, caller leverage, 변경 locality, public seam의 testability를 평가하는 설계 vocabulary | 도메인 계약·변경 파급·테스트 경계 평가에 사용. 해당 파일은 설계 원칙 reference이며 전역 파일 inventory나 측정 harness를 실행하는 절차는 아니다 |
| [pstack investigation](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/investigation.md) | read-only 조사, how/why routing, 근거 있는 설명/추천 | 분석 권한 보존을 채택하되 다른 skill 설치를 요구하지 않고 module/use-case 추적 절차를 내장 |
| [pstack perf-issue](https://github.com/cursor/plugins/blob/main/pstack/skills/poteto-mode/playbooks/perf-issue.md) | control skill의 baseline trace, benchmark-checklist, how, 경계를 넘으면 architect, 모델 설정에 따른 subagent 구현, post trace와 artifact 비교 | trace 기반 가설과 전후 비교 적용. control skill·다른 모델·PR 게시를 portable skill의 필수 조건으로 삼지 않음 |
| [pstack benchmark-checklist](https://github.com/cursor/plugins/blob/main/pstack/skills/benchmark-checklist/SKILL.md) | 측정 코드 읽기, 별도 profile, correctness/errors, 5회 이상 교차 측정, median/range, end-to-end 관련성. uptime/nproc 등 도구 예시 | 실제 OS/runtime 도구로 대체하고 설치 없는 fallback 제공. Windows에서 Unix 도구가 있다고 가정하지 않음 |
| [Python profiling](https://docs.python.org/3.12/library/profile.html) | cProfile/pstats는 호출 수·시간 profile 제공. profiler는 benchmarking 도구가 아니며 overhead가 있음 | hotspot attribution 실행과 profiler 없는 비교 실행을 분리 |
| [Git log](https://git-scm.com/docs/git-log) | 기간/path 제한과 numstat으로 이력 조사 가능 | 기간·제외 정책을 밝힌 churn 후보 수집. 이력이 없는 fixture에서 수치를 만들지 않음 |

[pstack README](https://github.com/cursor/plugins/blob/main/pstack/README.md)는 Cursor와 Claude adapter, 별도 plugin에서 제공되는 control 도구를 설명한다. 이 비교는 해당 파일들에 한정되며 전체 pstack 실행 평가나 품질 우열 실험이 아니다. 위 링크의 main은 변할 수 있으므로 재비교할 때 현재 원문을 다시 확인한다.
