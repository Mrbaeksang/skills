# 개발과 검증

## 릴리스와 업데이트

배포 내용(`skills/`, `common/`, `adapters/`, `plugins/skills/`, marketplace)을 바꾸면 두 `adapters/*/plugin.json`의 version을 함께 올리고 CHANGELOG.md를 갱신합니다. 기능 추가는 minor, 호환되는 수정은 patch를 올립니다. 문서·제작 도구만 바꾸는 경우 버전 증가는 필요 없습니다.

`npm run sync` 후 `npm run check:release -- <변경 전 commit>`과 아래 검증을 수행합니다. CI는 PR의 base 또는 push 이전 commit과 비교해 배포 내용이 바뀌었는데 버전이 같거나 낮으면 실패합니다. 생성된 배포본도 함께 커밋합니다. 공개 권한이 있는 릴리스는 검증된 변경을 main에 반영하고 같은 commit에 `v<version>` tag와 GitHub Release를 만듭니다. tag와 Release만 만들고 main을 갱신하지 않으면 기본 marketplace 사용자는 새 파일을 받지 못합니다.

일반 사용자는 README의 업데이트 경로를 사용합니다. Claude의 자동 업데이트는 사용자가 marketplace별로 켜며, 플러그인은 사용자 설정을 임의로 바꾸지 않습니다. Codex CLI는 marketplace upgrade 후 plugin add로 갱신합니다. 둘 다 새 세션에서 확인합니다.

사용자는 README의 plugin 또는 npx 설치를 사용합니다. 이 문서는 스킬을 수정하는 유지보수자용입니다.

Node.js 22.20+를 사용합니다. 유지보수 도구는 Node 표준 라이브러리만 사용하며 별도 npm dependency 설치가 필요하지 않습니다.

```sh
npm run sync
npm run check
npm test
npm run smoke:install
```

`skills/`와 `common/`을 수정한 뒤 sync합니다. 공통 지침은 `common/`이 원본이고 각 스킬의 동일 이름 참고 파일은 생성된 복사본입니다. 직접 복사하는 설치 도구에서도 참조가 빠지지 않도록 복사본을 커밋합니다. `plugins/skills/`는 native plugin 배포본입니다. check는 원본과 배포본의 불일치, 누락된 참조 등을 검사합니다.

sync 결과를 diff로 검토하고 필요한 변경만 커밋합니다. 사용자 설치 경로를 생성물 목적지로 사용하지 않습니다. 과거 Python fixture와 연구 기록은 당시 실행 증거이며 현재 제작 도구의 의존성이 아닙니다.

smoke:install은 격리된 임시 프로젝트에 실제 Skills CLI로 설치하고 포함 파일을 확인합니다. 모델 실행이나 browser 검증 성공을 의미하지 않습니다.
