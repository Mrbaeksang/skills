# Skills

결정된 대화를 명세로 만드는 최소 `spec` 스킬입니다. 공통 원본은 `skills/`, 공통 실행 계약은 `common/`에 있습니다. 패키징 시 각 스킬 내부로 계약을 복사해 단일 스킬 폴더만으로 실행할 수 있게 합니다.

Python 3.12+ 표준 라이브러리만 필요합니다. 저장소 루트에서:

```powershell
python scripts/package.py check
python -m unittest discover -s tests -v
python scripts/package.py install --dest <project>/.agents/skills
```

마지막 명령은 Codex 프로젝트 설치 예입니다. 새 세션에서 `$spec`으로 호출합니다. 대상에 동일한 이름이 있으면 전체 설치를 쓰기 전에 중단합니다. 다른 이름을 가진 스킬·설정은 건드리지 않습니다. 범용 metadata validator가 아니라 이 저장소의 flat scalar frontmatter (`name`, `description`, 선택 `license`, `compatibility`)를 검사합니다.

Claude Code에서는 동일 산출물을 프로젝트 `.claude/skills`에 설치하고 `/spec`으로 호출할 수 있습니다. Windows Claude Code 2.1.317에서 프로젝트 설치→발견→호출→최소 명세 출력을 확인했습니다. 인증은 기존 로그인을 사용했으며 fresh auth-home 검증은 아닙니다. native plugin/marketplace adapter와 안전한 업데이트·제거는 후속 범위이며, 기존 설치를 삭제하거나 덮어쓰는 명령은 제공하지 않습니다. 새 빈 대상으로 빌드해 비교하십시오.

호환성과 공식 출처: [packaging 조사](research/packaging.md). 실제 검증 경계: [spec smoke evidence](research/spec-smoke.md). 행동 회귀 입력과 rubric: [fixtures/spec](fixtures/spec/rubric.md).
