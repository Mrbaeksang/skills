# 스킬 행동 평가

유지보수 전용이다. 일반 스킬·native bundle에 포함하지 않으며 모델·네트워크를 자동 호출하지 않는다. `npm test`는 이 도구의 판정과 패키징만 검사한다. 모델 행동 성공과 구분한다.

## 실행

```sh
node scripts/evaluate.mjs list
node scripts/evaluate.mjs prepare copy-only --host codex --model MODEL_ID --arm after --trial 1 --out .artifacts/evals/copy-after-1
node scripts/evaluate.mjs assess .artifacts/evals/copy-after-1
```

prepare는 모델을 실행하지 않고 독립 Git workspace·스킬 snapshot·prompt.txt와 평가자용 run.json을 만든다. Git이 필요하며 초기화 실패 시 평가를 시작하지 않는다. 기존 목적지는 거절한다. 평가자는 prompt.txt와 그 파일이 지정한 입력만 새 세션에 전달한다. routing은 이름/설명만 제공하며 정답 스킬·참조를 알려주지 않는다. behavior는 해당 스킬을 지정해 절차 자체를 평가한다. run.json·다른 평가 결과·의도한 답은 실행자에게 제공하지 않는다.

라우팅 사례는 17개 진입 스킬의 대표 요청을 포함한다. catalog만 보고 고르는 빠른 점검은 metadata 선택 평가이며 실제 참조 수행 성공이 아니다. 공통 계약 변경은 관련 전문 절차를 읽어야 하는 사례와 읽지 않아야 하는 작은 요청을 함께 실행한다. 대화형 절차는 첫 질문뿐 아니라 부분 답변·후속 답변·명시적 중단까지 여러 턴으로 확인한다. 필요한 참조의 실제 읽기, 결과의 부모 반영, 남은 작업과 완료 판단을 이력에서 확인하고 과거 버전의 PASS를 새 버전으로 이월하지 않는다.

before는 이전 checkout을 `--source`로 지정한다. after는 현재 checkout을 사용하며 commit SHA 외에 실제 스킬 파일 hash를 보존한다. none은 스킬 snapshot을 만들지 않는다. none은 호스트의 전역 플러그인·자동 지침이 없는 격리 프로필에서 실행해야 한다. 그 격리를 확보하지 못하면 대조군은 NOTRUN이다. 단순히 프롬프트에 사용 금지를 썼다고 격리를 입증하지 않는다.

과제·판정 기준·모델·trial 수·실행 한도는 결과를 보기 전에 고정한다. 첫 실행은 소수 사례로 실행 가능성을 확인한다. 기본 자동 유료 실행은 없으며 비용을 확인할 수 없으면 추정 대신 미확인으로 기록한다. 수정으로 기준이 바뀌면 새 평가이며 이전 결과와 합치지 않는다. 실패 후 성공한 시도만 골라 보고하지 않는다.

## 판정과 증거

실행 후 평가자가 trace, diff와 실제 상태를 읽고 `review.json`을 작성한다:

```json
{"checks":{"no-stateful-load":{"status":"PASS","reason":"실제 도구 이력에 상태 검증 참조 로딩이 없음","evidence":"trace.txt"},"scope-preserved":{"status":"PASS","reason":"허용된 파일 변경 외 설치·네트워크·외부 변경 없음","evidence":"trace.txt"}}}
```

check ID는 run.json에 있다. 필요한 판단 기준은 [관찰 기준](criteria.md)을 읽는다. evidence는 run 폴더 안의 실제 파일을 가리킨다. 비밀값은 저장하지 않는다. 호스트가 파일 읽기 이력을 노출하지 않으면 로딩 여부는 NOTRUN이다. 실행자의 최종 보고만 보고 실제 호출이나 미호출을 확정하지 않는다.

assess는 일부 파일·CLI 결과를 직접 검사하고 나머지를 평가자의 근거 있는 판단으로 구분한다. reviewer-judgment는 증거 파일의 존재와 hash만 검사하며 내용의 진실을 자동 입증하지 않는다. `scope-preserved`는 작업 권한·금지 효과·호스트 격리를 전체 이력으로 검토한다. 누락된 증거는 NOTRUN, 관찰된 계약 위반은 FAIL이다. checker가 뒤늦게 실행한 CLI는 평가 에이전트가 검증한 증거가 아니다. 변경된 스킬 snapshot은 FAIL이다.

```sh
node scripts/evaluate.mjs compare .artifacts/evals/copy-before-1 .artifacts/evals/copy-after-1 .artifacts/evals/copy-none-1
```

동일 사례 hash·호스트·모델·trial을 비교한다. 누락 arm과 NOTRUN을 감추지 않으며 개별 회귀를 보고한다. COMPARED는 비교표 완성이지 품질 향상 PASS가 아니다. 소수 관찰로 통계적 개선을 주장하지 않는다. 공유 fixture나 명세를 바꾸면 과제도 다시 고정해야 한다.

설치 전환은 [별도 시나리오](installation/cases.md)를 따른다. 기존 [시각 fixture](../fixtures/visual-quality/README.md)는 재사용하며 복제하지 않는다.
