# Delivery Quote CLI 티켓 (로컬 초안)

입력: `SPEC.md`. 산출 스킬: `ticket`. tracker 게시 요청이 없어 게시하지 않았다. URL, 라벨, tracker 상태 없음. 기존 open/closed 이슈는 조회 대상이 없다. 아래 상태는 이 초안의 snapshot이며 구현 완료를 뜻하지 않는다.

공통 제약(양 티켓): Python 3.12 표준 라이브러리만(D-8). 제품 파일은 `quote.py`, `test_quote.py`만. 테스트는 실제 `python quote.py ...` process의 exit code, stdout, stderr를 관찰한다(D-7). 권한 구분, 저장, 인증, 외부 서비스, 성능 SLO는 해당 없음. weight 단위/통화(U-1)는 동작에 영향이 없어 계약에 넣지 않는다.

## T-1 유효 weight의 배송 금액 조회

- 상태: ready / 선행: 없음
- 배경·목표: 호출자가 유효 weight로 금액 JSON을 받는다.
- 범위: `shipment` 가격 규칙, CLI adapter의 성공 변환, 관련 process 테스트. 제외: 오류 계약(T-2).
- 요구: R-1, R-2, R-7(가격/성공 변환 부분). 결정: D-1, D-2, D-3, D-4, D-7, D-8, D-9. 제안: A-3(조건부).
- 입력/출력: `python quote.py <1..10>` → exit 0, stdout `{"total":<금액>}`. 1..5 → 5000, 6..10 → 8000.
- 오류/권한: 이 티켓에서 도입 없음. 권한 해당 없음.
- 불변식: stateless. 가격 규칙은 `shipment`에만 있다. `shipment`는 JSON과 exit code를 사용하지 않는다.
- 소유: `shipment`(가격), CLI adapter(JSON/exit). 둘 다 `quote.py` 내부.
- 산출물: T-2가 재사용할 `shipment` 진입점과 adapter.

| 시나리오 | 수용 기준 | 검증 환경 |
|---|---|---|
| 정상 `1` | AC-1a; 조건부 A-3: AC-1c | `test_quote.py` process 실행 |
| 경계 `5`, `6`, `10` | AC-2a, AC-2b, AC-2c | `test_quote.py` process 실행 |
| 책임 경계(가격 쪽) | AC-7 | `quote.py` 코드 확인 |

## T-2 잘못된 weight 거절과 실패 후 복구

- 상태: blocked by T-1 (T-1 완료 시 ready) / 선행: T-1
- 선행 사유: 실제 의존이다. AC-6은 T-1의 성공 경로가 있어야 관찰할 수 있고, 검증 진입점이 T-1 산출물이다.
- 배경·목표: 잘못된 입력에 기계 판독 가능한 오류를 traceback 없이 반환하고, 다음 유효 실행이 성공한다.
- 범위: `shipment` weight 검증과 `InvalidWeight`, adapter의 오류 변환, 관련 process 테스트. 제외: 새 오류 코드, 로깅.
- 요구: R-3, R-4, R-5, R-6, R-7(검증/오류 변환 부분). 결정: D-1, D-2, D-5, D-6, D-7, D-8, D-9. 제안: A-1, A-2, A-3(조건부).
- 입력/출력: 0, 11, 비정수, 인수 누락 → exit 2, stdout 빈 값, stderr `{"error":"INVALID_WEIGHT","retryable":false}`, traceback 없음.
- 불변식: 유효 범위 밖 weight에는 가격이 없다. 실패는 이후 실행에 영향을 주지 않는다. `INVALID_WEIGHT` 의미는 `shipment`, 외부 형식은 adapter 소유.
- 소유: `shipment`(검증, 오류 의미), CLI adapter(JSON/exit). 둘 다 `quote.py` 내부.
- 조건부: A-1, A-2는 에이전트 제안이다. 사용자가 다르게 지정하면 AC-4c, AC-4d와 구현을 변경한다. AC-5b는 build 단계에서 철회되었다(`SPEC.md` 참조).

| 시나리오 | 수용 기준 | 검증 환경 |
|---|---|---|
| 범위 밖 `0`, `11` | AC-3a, AC-3b, AC-5a | `test_quote.py` process 실행 |
| 비정수 `abc`, `1.5`, 빈 문자열 | AC-4a, AC-5a | `test_quote.py` process 실행 |
| 인수 누락 | AC-4b, AC-5a | `test_quote.py` process 실행 |
| 비정규 정수 표기 | AC-4c (조건부 A-1) | `test_quote.py` process 실행 |
| 인수 2개 | AC-4d (조건부 A-2) | `test_quote.py` process 실행 |
| 복구: `0` 후 `1` | AC-6 | `test_quote.py` process 실행 |
| 책임 경계(검증 쪽) | AC-7 | `quote.py` 코드 확인 |

## Coverage

| 요구 | 수용 기준 | 티켓 | 공동 소유 구분 |
|---|---|---|---|
| R-1 | AC-1a, AC-1c (AC-1b 철회) | T-1 | |
| R-2 | AC-2a, AC-2b, AC-2c | T-1 | |
| R-3 | AC-3a, AC-3b | T-2 | |
| R-4 | AC-4a, AC-4b, AC-4c, AC-4d | T-2 | |
| R-5 | AC-5a (AC-5b 철회) | T-2 | |
| R-6 | AC-6 | T-2 | T-1 성공 경로 소비 |
| R-7 | AC-7 | T-1, T-2 | T-1 가격/성공 변환, T-2 검증/오류 변환 |

결정 coverage: D-1..D-9 모두 위 티켓에 연결됨. A-1..A-3 조건부 연결. U-1 비차단.

## 의존 그래프와 frontier

```text
T-1 → T-2
```

점검: 없는 선행 노드 없음, 자기 의존 없음, 순환 없음, 중복 구현 없음.

작성 시점 snapshot: frontier T-1, blocked T-2(T-1 미완료).

build 단계 갱신 snapshot(근거: `evidence.md`):

- active: T-1, T-2. 코드와 테스트는 작성했으나 runtime 검증이 NOTRUN이므로 둘 다 done이 아니다.
- blocked: 검증 실행. 원인: 이 세션에서 `PowerShell` 권한 거절. 재개 조건: `evidence.md`의 명령을 실행할 권한.
- 미결정으로 실행 불가능한 부분: 없음

## 확인과 NOTRUN

- 실행: `SPEC.md` 읽기, coverage와 그래프의 수동 대조.
- NOTRUN: tracker 게시/readback(요청 없음), 제품 검증(구현 전).
