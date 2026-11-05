# 개발과 검증

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
