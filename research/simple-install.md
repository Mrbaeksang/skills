# 직접 설치 검증

확인일: 2026-11-05.

초기 README는 유지보수용 Python 설치 명령을 일반 사용자에게 먼저 제시했다. native plugin은 완성된 배포본을 사용했지만, 일반 Skills CLI가 찾는 원본에는 생성 시에만 추가되는 공통 참고 파일이 빠져 있었다. 일반 설치는 기존 plugin/Skills CLI에 맡기고 유지보수는 Node.js로 통일한다. 공통 원본의 복사본을 직접 설치되는 스킬에도 포함하고 drift를 검사한다.

## 확인한 외부 설치 방식

- [Matt Pocock README](https://github.com/mattpocock/skills): 에이전트별 plugin 및 npx 설치 안내.
- [Vercel Skills CLI](https://github.com/vercel-labs/skills): 다운로드·탐색·설치를 담당하는 별도 도구.
- [OpenAI plugin 문서](https://developers.openai.com/plugins/build/plugins): owner/repo marketplace 경로 지원.

## GitHub 원격 native 설치

Claude Code 2.1.317과 Codex CLI 0.166.0에서 임시 설정 디렉터리를 child process에만 지정하고 `Mrbaeksang/skills` marketplace 추가 → 설치 → cache 조회 → 7개 스킬 및 공통 참조 3종 확인 → plugin 제거 → marketplace 제거를 수행했다. 모두 PASS. 기존 사용자 설정을 설치 대상으로 사용하지 않았고 인증 파일을 복사하지 않았다.

원격 native 검증은 c78a194 기반 공개 main 배포본에 대해 수행했다. 모델 요청·스킬 행동 검증은 수행하지 않았으며 기존 UI/Codex runtime 차단 기록은 그대로 유효하다.
