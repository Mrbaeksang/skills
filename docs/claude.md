# Claude Code 설치와 수명주기

Claude marketplace는 `.claude-plugin/marketplace.json`, plugin manifest는 조립된 `plugins/skills/.claude-plugin/plugin.json`이다. 공통 계약과 조건부 참조는 설치본 안에 포함된다. 설치 이름은 `skills@baeksang-skills`, 호출은 `/skills:spec`이다. `/spec` project skill과 plugin namespace를 혼동하지 않는다. 같은 이름의 다른 marketplace 설치가 있으면 목록에서 출처를 먼저 확인한다.

아래 원격 경로는 이 변경이 GitHub에 게시된 뒤 사용할 수 있다. 실제 검증은 로컬 marketplace에서 수행했다. 원격 설치는 NOTRUN이다.

```powershell
claude plugin marketplace add Mrbaeksang/skills
claude plugin install skills@baeksang-skills --scope user
claude plugin list --json
```

새 Claude 세션에서 `/skills:spec`과 확정 요구사항을 입력한다. Native slash command가 SKILL.md를 로드하고 `Read`가 설치된 `references/execution-contract.md`를 읽는다. 도메인 참조는 각 스킬에 적힌 조건에서만 읽는다. tracker, browser, shell 등의 도구는 호스트가 제공하며 이 플러그인이 설치하지 않는다. 도구가 없거나 정책이 거절하면 미실행 경계를 보고한다.

```powershell
# 업데이트: marketplace를 갱신한 뒤 plugin 업데이트, 새 세션 시작
claude plugin marketplace update baeksang-skills
claude plugin update skills@baeksang-skills --scope user
# 재설치
claude plugin uninstall skills@baeksang-skills --scope user
claude plugin install skills@baeksang-skills --scope user
# 제거
claude plugin uninstall skills@baeksang-skills --scope user
```

Marketplace까지 지울 때는 다른 설치가 해당 marketplace를 쓰지 않는지 확인한 후 `claude plugin marketplace remove baeksang-skills`를 실행한다. 사용자 지침, 설정 파일, 다른 플러그인을 지우거나 덮어쓰지 않는다. 실제 설치 scope가 project/local이면 위 명령에도 그 scope를 사용한다. Project scope만으로 user marketplace 등록까지 격리되지는 않는다.

`--plugin-dir <조립된-plugin-root>`는 세션 전용 로딩이다. 설치를 대신했다고 주장하지 않는다. 아래 smoke는 임시 `CLAUDE_CONFIG_DIR`에서 실제 lifecycle을 검사하고, `--invoke`를 명시한 경우에만 별도 기존 인증 세션에서 같은 설치 캐시를 로드한다. 인증 파일을 복사하지 않는다. 임시 설정의 unrelated plugin과 사용자 지침을 유지하며 실제 사용자 settings/CLAUDE.md/plugin 파일 hash를 전후 비교한다. 로그·인증·모든 전역 상태까지 불변이라고 주장하지 않는다.

```powershell
python scripts/package.py check
python scripts/smoke_claude.py
# 실제 모델 요청을 포함하는 선택적 검증
python scripts/smoke_claude.py --invoke
```

유지보수자는 `bundle --dest <새-폴더>`로 생성한 결과를 검토해 `plugins/skills/`에 반영하고 `check-bundle --dest plugins/skills`를 실행한다. 기존 목적지를 자동 덮어쓰지 않는다. MIT는 이 저장소의 원본 내용에 적용되며, 조사한 외부 자료의 license를 대체하지 않는다. [공식 manifest 규격](https://code.claude.com/docs/en/plugins-reference)과 [marketplace 절차](https://code.claude.com/docs/en/plugin-marketplaces)를 2026-11-05 확인했다. 실제 결과와 호환성 범위는 [검증 기록](../research/claude-lifecycle.md)에 있다.
