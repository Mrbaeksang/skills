# Codex 설치와 수명주기

지원 형식은 `.codex-plugin/plugin.json`과 `.agents/plugins/marketplace.json`이다. 배포되는 `plugins/skills/`에는 공통 계약이 이미 포함된다. 사용자는 Python이나 빌드가 필요 없다. 설치 이름은 `skills@baeksang-skills`다. 같은 이름의 다른 marketplace나 독립 `$spec` 스킬이 있으면 먼저 설치 목록과 스킬 선택 UI에서 출처를 확인한다. 무관한 설치를 자동 삭제하지 않는다.

아래 GitHub 경로는 이 변경이 저장소에 게시된 뒤 사용할 수 있다. 이번 검증은 로컬 marketplace에서 수행했으며 GitHub 게시·원격 설치는 NOTRUN이다.

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
| GitHub marketplace 원격 경로, Desktop UI, 다른 OS/버전 | NOTRUN | NOTRUN | NOTRUN |

원본 설정 보존과 실제 오류는 [검증 기록](../research/codex-lifecycle.md)에 있다. [OpenAI 공식 packaging 문서](https://developers.openai.com/plugins/build/plugins)의 형식을 사용하고 CLI 0.166.0의 실제 help와 실행을 대조했다. 문서의 Desktop 안내를 CLI 미지원으로 해석하지 않는다.

## 유지보수자 배포 검사

`skills/`, `common/`, `adapters/`가 원본이며 `plugins/skills/`는 커밋하는 생성 산출물이다. `bundle`은 Codex와 존재하는 Claude adapter를 하나의 plugin root로 복사한다.

```powershell
python scripts/package.py check
python scripts/package.py bundle --dest .artifacts/release-new
python scripts/package.py check-bundle --dest plugins/skills
python -m unittest discover -s tests -v
python scripts/smoke_codex.py
```

`bundle`은 기존 목적지를 덮어쓰지 않는다. 새 산출물을 기존 tracked `plugins/skills/`와 비교한 뒤 소유가 확인된 생성 파일만 반영하고 `check-bundle`을 다시 통과시킨다. 사용자 설치 폴더를 이 과정에 사용하지 않는다. CI는 누락·오래된 내용·예상 밖 파일을 검출한다. `smoke_codex.py`는 임시 home에서만 설치를 변경하며 인증과 실제 모델 실행은 검사하지 않는다.
