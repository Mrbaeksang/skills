# Skills

요구 구체화부터 구현·진단·개선·검토까지 연결하는 7개 Agent Skills입니다. `skills/`가 원본이고 `common/execution-contract.md`가 공통 실행 계약입니다.

**상태: 통합 후보, 전체 acceptance 미완료.** 이 안내는 integration branch의 내용이며 main에 게시된 릴리스라고 주장하지 않습니다. #7 UI 검증과 #11 Codex 실제 실행이 정책에 막혀 #13 전체 통합 acceptance도 blocked입니다. [Release receipt](research/release-receipt.md)에 A01–A20, US1–40과 실제 증거·미실행 경계를 기록합니다.

| 스킬 | 직접 입력과 결과 |
|---|---|
| `shape` | 아이디어·제약 → 질문 묶음, 기술·도메인 결정 |
| `spec` | 결정된 요구 → 상세 명세와 수용 기준 |
| `ticket` | 명세 → 실행 가능한 티켓·의존성·상태 계획 |
| `build` | 명세 또는 티켓 → 구현·실제 검증 증거 |
| `diagnose` | 오류·성능 증상 → 재현·가설·최소 수정 |
| `improve` | 코드와 목표 → 탐색 근거·우선순위·허용된 개선 |
| `review` | 고정된 diff와 명세 → 독립 findings·검토 한계 |

`shape → spec → ticket → build`는 연결 경로이며 필수 의식이 아닙니다. 작은 수정과 직접 호출을 지원합니다. tracker 게시·외부 변경은 요청된 범위에서만 수행합니다.

## 표준 skill 설치

검토할 branch를 checkout한 저장소에서 Python 3.12+ 표준 라이브러리만으로 설치합니다. 아래 두 경로 중 사용하는 호스트에 맞는 하나를 선택합니다.

```powershell
python scripts/package.py check
# Codex project skills
python scripts/package.py install --dest <project>/.agents/skills
# Claude Code project skills
python scripts/package.py install --dest <project>/.claude/skills
```

새 세션에서 Codex는 `$shape`, `$spec` 등, Claude는 `/shape`, `/spec` 등으로 호출합니다. 설치는 대상에 동명 스킬이 있으면 쓰기 전에 중단하며 기존 설치나 사용자 설정을 덮어쓰지 않습니다. 업데이트 비교에는 새 빈 목적지를 사용합니다. 다른 Agent Skills 호스트의 실제 실행은 NOTRUN입니다.

## Native plugin 설치

공통 참조가 조립된 `plugins/skills/`를 사용합니다. raw `skills/`를 marketplace에 연결하면 계약 참조가 누락됩니다. 현재 checkout의 로컬 marketplace를 등록하는 방법:

```powershell
# Claude Code
claude plugin marketplace add <absolute-checkout-path>
claude plugin install skills@baeksang-skills --scope user
# Codex
codex plugin marketplace add <absolute-checkout-path>
codex plugin add skills@baeksang-skills --json
```

등록은 실제 사용자 marketplace 설정을 변경합니다. 기존 동명 등록이 있으면 출처부터 확인합니다. Claude native 호출은 `/skills:shape` 등 namespace를 사용합니다. Codex는 설치 출처를 확인한 스킬을 선택합니다. 원격 `Mrbaeksang/skills` 경로는 이 후보가 게시된 뒤 사용할 수 있으며 이번 원격 설치는 NOTRUN입니다. 업데이트·재설치·제거와 scope 안내: [Claude](docs/claude.md), [Codex](docs/codex.md).

## 확인된 지원 범위

| 환경 | 설치·수명주기 | 발견·호출 및 실제 결과 |
|---|---|---|
| Windows / Claude Code 2.1.317 / project skills / 기존 인증 | 조립 설치 PASS | 7개 개별 호출 증거, 통합 검증 범위는 receipt 참조 |
| 같은 Claude / local native marketplace / 임시 config | 설치·갱신·재설치·제거 PASS | 별도 기존 인증 session plugin에서 spec PASS; fresh-home 인증 NOTRUN |
| Windows / Codex CLI 0.166.0 / local marketplace / 임시 home | 설치·갱신·재설치·제거 PASS | 인증 없는 home에서 실행 NOTRUN |
| 같은 Codex / 기존 인증 / project skills | 설치·spec 발견 PASS | 계약 읽기 정책 거절: 실행 BLOCKED, fallback은 성공 아님 |
| 다른 OS·버전·Agent Skills 호스트·원격 marketplace·Desktop | NOTRUN | NOTRUN |

호스트가 file read, shell, tracker, browser 등 필요한 도구를 제공해야 합니다. 이 패키지는 인증·도구·외부 서비스를 설치하지 않습니다. 정책 거절을 우회하지 않으며 설치 성공과 행동 성공을 구분합니다. [Packaging 조사](research/packaging.md), [Claude lifecycle](research/claude-lifecycle.md), [Codex lifecycle](research/codex-lifecycle.md).

## 유지보수 검증

```powershell
python scripts/package.py check
python -m unittest discover -s tests -v
python scripts/package.py install --dest .artifacts/smoke-new/.agents/skills
python scripts/package.py check-bundle --dest plugins/skills
git diff --check
```

생성물 갱신은 새 목적지에 `bundle`한 뒤 소유한 tracked 생성 파일만 비교·반영합니다. 원본 코드는 MIT이며 외부 자료는 조사 출처와 실제 복사를 구분합니다. [출처 비교](research/2026-11-04-agent-methods.md). 소스 검사·fixture 통과는 전체 제품이나 모든 환경의 완료 증거가 아닙니다.
