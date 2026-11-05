# Codex 설치와 수명주기

지원 형식은 `.codex-plugin/plugin.json`과 `.agents/plugins/marketplace.json`이다. 배포되는 `plugins/skills/`에는 공통 계약이 이미 포함된다. 사용자는 Python이나 빌드가 필요 없다. 설치 이름은 `skills@baeksang-skills`다. 같은 이름의 다른 marketplace나 독립 `$spec` 스킬이 있으면 먼저 설치 목록과 스킬 선택 UI에서 출처를 확인한다. 무관한 설치를 자동 삭제하지 않는다.

GitHub 원격 marketplace 설치와 7개 스킬·공통 참조 포함을 확인했다. 실제 모델 실행은 기존 정책 차단 기록과 구분한다.

```powershell
codex plugin marketplace add Mrbaeksang/skills
codex plugin add skills@baeksang-skills --json
codex plugin list --marketplace baeksang-skills --json
```

새 세션에서 설치된 `spec`을 선택하고 `$spec`과 확정 요구를 입력한다. 도구에서 동명 스킬 출처를 구분하지 못하면 실행을 멈추고 충돌을 해소한다. 스킬 파일과 공통 계약을 실제로 읽었는지 확인해야 하며 이름 발견만으로 실행 성공을 판단하지 않는다.

업데이트는 Git marketplace snapshot을 먼저 갱신하고 설치를 다시 수행한다. 릴리스는 manifest version을 올린다. 로컬 marketplace는 원본 파일 변경 후 `plugin add`로 갱신한다.

```powershell
codex plugin marketplace upgrade baeksang-skills --json
codex plugin add skills@baeksang-skills --json
codex plugin list --marketplace baeksang-skills --json
```

재설치는 아래 remove 후 add, 제거는 remove만 실행한다. marketplace 등록까지 제거하려면 마지막 명령도 실행한다. 다른 플러그인의 marketplace를 제거하지 않는다.

```powershell
codex plugin remove skills@baeksang-skills --json
codex plugin add skills@baeksang-skills --json
# 완전 제거 시:
codex plugin remove skills@baeksang-skills --json
codex plugin marketplace remove baeksang-skills --json
```

설치에는 Git/local filesystem, 실행에는 스킬·참조·과제 파일 읽기와 과제별 도구가 필요하다. tracker/browser 기능은 호스트가 제공해야 한다. 없는 기능은 BLOCKED/NOTRUN으로 보고한다. 플랫폼 정책을 해제하거나 인증을 복사하는 방식으로 우회하지 않는다.

| 환경 | 설치·발견 | 업데이트·재설치·제거 | 실제 spec 실행 |
|---|---|---|---|
| Windows, Codex CLI 0.166.0, 임시 CODEX_HOME, local marketplace | PASS, 캐시 참조 검증 | PASS | 인증 없음: NOTRUN |
| Windows, Codex CLI 0.166.0, 기존 인증, workspace-write, 설치 캐시에서 복사한 project skills | 발견 PASS | 해당 없음 | BLOCKED: PowerShell 읽기 정책 거절 |
| GitHub marketplace 원격 경로 / Windows CLI | PASS | 설치·제거 PASS, 원격 업데이트 NOTRUN | NOTRUN |
| Desktop UI, 다른 OS/버전 | NOTRUN | NOTRUN | NOTRUN |

원본 설정 보존과 실제 오류는 [검증 기록](../research/codex-lifecycle.md)에 있다. [OpenAI 공식 packaging 문서](https://developers.openai.com/plugins/build/plugins)의 형식을 사용하고 CLI 0.166.0의 실제 help와 실행을 대조했다. 문서의 Desktop 안내를 CLI 미지원으로 해석하지 않는다.

개발·패키지 검사는 [개발 안내](development.md)를 따른다. [원격 설치 결과](../research/simple-install.md).
