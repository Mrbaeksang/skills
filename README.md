# Skills

요구사항을 구체화하고, 상세 명세와 티켓을 만들고, 구현과 검증까지 이어가는 7개 스킬입니다. DDD modular monolith, use case 중심 테스트, 짧은 보고를 기본으로 합니다.

## 설치

사용하는 에이전트에 맞춰 하나를 선택하세요. 플러그인과 npx를 같은 에이전트에 중복 설치할 필요는 없습니다. Python이나 직접 빌드는 필요하지 않습니다.

### Claude Code

터미널에서:

```sh
claude plugin marketplace add Mrbaeksang/skills
claude plugin install skills@baeksang-skills
```

새 세션에서 `/skills:shape`로 시작하세요. [업데이트·제거](docs/claude.md)

### Codex

```sh
codex plugin marketplace add Mrbaeksang/skills
codex plugin add skills@baeksang-skills
```

새 세션에서 설치된 스킬을 선택해 `$shape`로 시작하세요. [업데이트·제거](docs/codex.md)

### 다른 에이전트 또는 편집 가능한 스킬 파일

Node.js와 npm이 있는 환경에서:

```sh
npx skills@latest add Mrbaeksang/skills
```

안내에 따라 스킬과 에이전트를 선택합니다. 모든 프로젝트에서 사용하려면 `-g`를 추가하세요. `npx skills@latest update`로 업데이트할 수 있습니다. 설치 도구는 [Vercel Skills CLI](https://github.com/vercel-labs/skills)를 사용합니다.

## 업데이트

기존 설치 방식에 맞춰 실행하고 새 세션을 시작하세요. 재설치·파일 복사·빌드는 필요 없습니다.

**Claude Code**

```sh
claude plugin marketplace update baeksang-skills
claude plugin update skills@baeksang-skills
```

매번 실행하지 않으려면 `/plugin` → Marketplaces → `baeksang-skills` → Enable auto-update를 켜세요. 제3자 marketplace의 자동 업데이트는 기본으로 꺼져 있습니다. [공식 업데이트 안내](https://code.claude.com/docs/en/discover-plugins#keep-plugins-updated)

**Codex CLI**

```sh
codex plugin marketplace upgrade baeksang-skills
codex plugin add skills@baeksang-skills
```

**npx로 설치한 경우**

```sh
npx skills@latest update
```

이 명령은 Skills CLI가 관리하는 다른 스킬도 업데이트할 수 있습니다. Native plugin 업데이트와는 별개입니다. [변경 내역](CHANGELOG.md) · [릴리스](https://github.com/Mrbaeksang/skills/releases)

## 사용할 스킬

| 스킬 | 하는 일 |
|---|---|
| `shape` | 질문을 묶어 요구사항을 확인하고, 기술 선택지·trade-off·도메인 경계 정리 |
| `spec` | 결정된 내용을 정상·실패 흐름과 검증 기준이 있는 상세 명세로 작성 |
| `ticket` | 명세를 실행 가능한 티켓으로 나누고 의존성과 상태 라벨 관리 |
| `build` | 명세나 티켓을 받아 구현하고 실제 검증 결과까지 보고 |
| `diagnose` | 문제를 재현하고 가설을 검증해 근본 원인 수정 |
| `improve` | 코드베이스 구조·의존성·병목 조사, 근거 있는 개선 제안·실행 |
| `review` | 명세와 고정된 변경 범위를 독립적으로 검토 |

`shape → spec → ticket → build`로 이어 쓰거나 필요한 스킬만 직접 호출하세요. 작은 수정에도 전체 절차를 강제하지 않습니다. 작업 공간은 필요할 때 격리하고, 병합·변경 상태를 확인한 뒤 자신이 만든 worktree와 branch만 정리합니다.

각 스킬은 과잉 설계·불필요한 코드·상투적인 문구를 기본으로 점검합니다. 화면 작업에서만 UI·문구 상세 기준을 읽으며 별도 명령이나 추가 도구는 필요하지 않습니다. 설치만으로 스킬을 사용하지 않는 일반 대화까지 적용되지는 않습니다.

## 지원과 검증

Windows에서 Claude Code·Codex의 GitHub 원격 플러그인 설치와 포함 파일을 확인했습니다. Claude의 실제 스킬 호출도 검증했습니다. Codex 모델 실행과 일부 브라우저 검증은 해당 테스트 환경의 도구 정책 제한으로 미완료입니다. 설치 성공과 모든 환경의 실행 성공은 구분합니다.

[설치 검증 기록](research/simple-install.md) · [전체 검증 기록](research/release-receipt.md) · [개발·기여 안내](docs/development.md)

## 라이선스

[MIT](LICENSE). 외부 자료의 출처와 개별 라이선스 고지는 해당 스킬에 포함되어 있습니다.
