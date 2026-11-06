# Skills

대화부터 구현·검증까지 이어가는 8개 작업 스킬과 필요할 때 사용하는 9개 전문 스킬입니다. DDD modular monolith, use case 중심 테스트, 짧은 보고를 기본으로 합니다.

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
| `talk` | 아이디어·고민을 가볍게 대화하며 목표·결정·열린 질문 정리 |
| `shape` | 질문을 묶어 요구사항을 확인하고, 기술 선택지·trade-off·도메인 경계 정리 |
| `spec` | 결정된 내용을 정상·실패 흐름과 검증 기준이 있는 상세 명세로 작성 |
| `ticket` | 명세를 실행 가능한 티켓으로 나누고 의존성과 상태 라벨 관리 |
| `build` | 명세나 티켓을 받아 구현하고 실제 검증 결과까지 보고 |
| `diagnose` | 문제를 재현하고 가설을 검증해 근본 원인 수정 |
| `improve` | 코드베이스 구조·의존성·병목 조사, 근거 있는 개선 제안·실행 |
| `review` | 명세와 고정된 변경 범위를 독립적으로 검토 |

가벼운 구체화는 `$talk`, 개발 설계는 `$shape`, 구현은 `$build`로 시작하세요. `talk → shape → spec → ticket → build`를 매번 전부 거칠 필요는 없습니다. Claude Code에서는 `/skills:talk`처럼 호출합니다. 작업 공간은 필요할 때 격리하고, 병합·변경 상태를 확인한 뒤 자신이 만든 worktree와 branch만 정리합니다.

### 필요한 전문 작업만 연결

| 스킬 | 맡는 일 |
|---|---|
| `domain` | 용어·불변식·상태 전이·데이터 소유권 모델링 |
| `research` | 공식 근거·기술 선택지·버전과 호환 조건 조사 |
| `architecture` | 모듈 경계·공통 책임·의존 방향·변경 파급 설계 |
| `test` | use case 중심 테스트 설계·구현·실행 |
| `verify` | 실제 API·CLI·UI 실행과 완료 증거 확인 |
| `clean` | 동작을 보존하는 코드 정리·과잉 추상화와 AI식 코드 점검 |
| `polish` | 기존 브랜드·사용자 과제에 맞춰 UI·문구를 정리하고 상투적 AI식 장식을 맥락에 따라 개선 |
| `optimize` | 성능·메모리·CSS·프론트 병목 측정과 개선 |
| `upgrade` | 의존성 호환 판단·버전 변경·코드 이행·검증 |

```text
talk     → research / domain
shape    → research / domain / architecture
spec     → 결정 합성, 부족한 domain / research만 보완
ticket   → 명세의 결정을 재사용해 작업 분해
build    → 필요한 설계·조사 / test / clean / verify
           ├─ UI·문구 정리: polish → verify
           ├─ 성능 개선: optimize → 측정 / test
           └─ 버전 이행: upgrade → research / test / verify
diagnose → 가설·실험 / 필요한 research·측정 / test / verify
improve  → 분야 선별 → 해당 전문 절차 → 실행 가능한 개선
review   → 고정 diff·명세 → 필요한 전문 기준을 검토-only로 사용
```

화살표는 조건부 참조이며 고정 실행 순서가 아닙니다. 각 전문 스킬도 직접 호출할 수 있습니다. 같은 절차를 공유하므로 기존 답과 검증을 반복하지 않고, 별도 에이전트를 자동 생성하지 않습니다. 스킬 하나만 설치해도 필요한 참조가 함께 포함됩니다. 실제 스킬 호출 기능이 없는 호스트에서는 포함된 전문 절차를 읽어 실행합니다.

각 스킬은 과잉 설계·불필요한 코드·상투적인 문구를 기본으로 점검합니다. 화면 작업에서만 UI·문구 상세 기준을 읽으며 별도 명령이나 추가 도구는 필요하지 않습니다. 설치만으로 스킬을 사용하지 않는 일반 대화까지 적용되지는 않습니다.

리뷰에서는 검증 기준을 약화한 변경과 공개 계약의 소비자를, 실제 검증에서는 필요한 상태·중복·복구 흐름을 조건부로 확인합니다. 테스트의 유지 가치는 test/improve에서 다룹니다. 호출 명령은 늘어나지 않습니다. 스킬 자체의 선택·행동 평가는 [유지보수 도구](evals/README.md)로 분리하며 일반 설치에 포함하지 않습니다.

## 지원과 검증

기존 릴리스는 Windows에서 Claude Code·Codex 원격 설치·업데이트를 확인했고 Claude의 일부 실제 호출 증거가 있습니다. 새 전문 스킬 조합의 참조·패키징 검사와 실제 모델 행동 검증은 별개입니다. Codex 모델 실행과 일부 브라우저 검증은 기존 환경의 도구 정책 제한으로 미완료입니다. 설치 성공을 모든 환경의 실행 성공으로 확대하지 않습니다.

[설치 검증 기록](research/simple-install.md) · [전체 검증 기록](research/release-receipt.md) · [개발·기여 안내](docs/development.md)

## 라이선스

[MIT](LICENSE). 외부 자료의 출처와 개별 라이선스 고지는 해당 스킬에 포함되어 있습니다.
