# Claude Code 설치와 수명주기

Claude marketplace는 `.claude-plugin/marketplace.json`, plugin manifest는 조립된 `plugins/skills/.claude-plugin/plugin.json`이다. 공통 계약과 조건부 참조는 설치본 안에 포함된다. 설치 이름은 `skills@baeksang-skills`, 호출은 `/skills:spec`이다. `/spec` project skill과 plugin namespace를 혼동하지 않는다. 같은 이름의 다른 marketplace 설치가 있으면 목록에서 출처를 먼저 확인한다.

GitHub 원격 경로에서 설치와 포함된 7개 스킬·공통 참조를 확인했다. 모델 실행 검증과 설치 검증은 구분한다.

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


개발·패키지 검사는 [개발 안내](development.md)를 따른다. [원격 설치 결과](../research/simple-install.md), [기존 실제 호출과 lifecycle 기록](../research/claude-lifecycle.md).
