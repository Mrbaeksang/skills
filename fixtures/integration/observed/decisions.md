# Delivery Quote CLI 결정 기록

산출 스킬: `shape`. 소비자: `SPEC.md`. 재인터뷰 없이 사용자의 확정 요구를 기록했다.

## 확인한 자료

- 사용자 요청의 확정 요구(이 문서의 유일한 제품 요구 출처).
- 작업 폴더 `.artifacts/integration13`: `keep.txt`(요구와 무관, 보존 대상), `.claude/`. 제품 코드, manifest, 용어집, ADR, 기존 명세 없음.
- 실행 환경: `python --version` = Python 3.12.15.

## 범위

- 범위: 공개 stateless delivery quote CLI 한 개. `python quote.py <weight>` 호출로 배송 금액을 계산한다.
- 비목표: 성능 SLO, 인증, 저장, 외부 서비스(사용자가 해당 없음으로 확정). tracker 게시, 배포.
- Actor: CLI를 실행하는 공개 호출자. 권한 구분 없음.
- 산출 파일 제한: 제품 `quote.py`, `test_quote.py` / 문서 `decisions.md`, `SPEC.md`, `tickets.md`, `evidence.md`. 기존 파일 보존.

## 확정 결정 (출처: 사용자 요구)

| ID | 결정 | 이유/영향 |
|---|---|---|
| D-1 | `shipment`가 weight 검증과 가격을 소유한다. | 도메인 불변식의 단일 소유. 영향: R-2, R-3, R-4 |
| D-2 | CLI adapter가 JSON 및 exit code 변환을 소유한다. | 외부 계약을 도메인에서 분리. 영향: R-1, R-5 |
| D-3 | 정수 weight 1..5 → 5000, 6..10 → 8000. | 가격 규칙. 영향: R-2 |
| D-4 | 성공: exit 0, stdout JSON `{"total":<금액>}`. `python quote.py 1` → `{"total":5000}`. | 공개 성공 계약. 영향: R-1 |
| D-5 | 0, 11, 비정수, 인수 누락 → exit 2, stdout 비어 있음, stderr JSON `{"error":"INVALID_WEIGHT","retryable":false}`, traceback 없음. | 공개 실패 계약. 영향: R-3, R-4, R-5 |
| D-6 | 실패 다음 유효 실행은 성공한다. | stateless 복구. 영향: R-6 |
| D-7 | 테스트는 Python process의 공개 행동으로 검증한다. | 내부 함수가 아닌 process 경계를 검증. 영향: 전 요구 |
| D-8 | Python 3.12 표준 라이브러리로 고정한다. 기술 최신성 조사는 하지 않는다. | 사용자 고정. 후보 비교 생략(대안 없음). |
| D-9 | 작은 한 모듈로 충분하다. `shipment`와 CLI adapter는 `quote.py` 안의 함수/오류 경계로 구분한다. | 제품 파일 제한상 별도 파일 불가, CQRS/repository/microservices 불필요. |

## 에이전트 제안 (사용자 승인 사실과 구분)

요구가 직접 규정하지 않은 입력 해석이다. 되돌릴 수 있으므로 멈추지 않고 아래 조건으로 진행한다.

| ID | 제안 | 선택 이유 | 선택을 바꾸는 조건 |
|---|---|---|---|
| A-1 | 정수 인식은 정규형 ASCII 10진수 `[1-9][0-9]*`의 전체 일치만 허용한다. `int()`가 받는 `" 1"`, `"+1"`, `"01"`, `"1_0"`, 비ASCII 숫자는 INVALID_WEIGHT로 거절한다. | 공개 계약을 가장 좁게 유지. 가격 입력의 모호성 제거. | 호출자가 관대한 파싱을 요구하면 완화 |
| A-2 | 인수 2개 이상은 INVALID_WEIGHT로 처리한다. | weight가 하나로 정해지지 않으므로 오류 계약 재사용. 별도 오류 코드 신설 회피. | 사용자가 별도 동작 지정 시 변경 |
| A-3 | 성공 시 stderr는 비어 있다. JSON은 compact로 출력하되 이는 구현 선택이며 직렬화 원문은 계약이 아니다. (build 단계 갱신: 원문 일치 제안 철회. 사용자 요구가 공백/직렬화 형식을 규정하지 않았고 `build` 규칙이 이 경우 문자열 전체 일치 테스트를 금지함) | 파싱 값, 채널, exit code가 공개 계약의 핵심. | 사용자가 원문 형식을 계약으로 지정하면 원문 검증 추가 |

## 용어·불변식·상태

- `weight`: 양의 정수 배송 무게. 유효 범위 1..10. 단위는 요구에 명시되지 않았다(U-1).
- `total`: 정수 금액. 통화는 요구에 명시되지 않았다(U-1).
- 불변식: `shipment`를 통과한 값만 가격을 갖는다. 유효 범위 밖 weight에는 가격이 없다.
- 상태 전이 없음: 실행마다 독립적이며 저장 상태가 없다.

## 모듈 계약

| 경계 | 호출자 | 입력 | 결과 | 실패 |
|---|---|---|---|---|
| `shipment` (`quote.py` 내부) | CLI adapter | 명령행 문자열 또는 없음 | 정수 total | 도메인 오류 `InvalidWeight` |
| CLI adapter (`quote.py` 내부) | OS process | `sys.argv` | stdout JSON, exit 0 | stderr JSON, exit 2 |

트랜잭션과 데이터 소유 없음(저장 해당 없음).

## 오류 책임

| 대표 오류 | 소유 | 분류 | 외부 계약 | 재시도 | 검증 시나리오 |
|---|---|---|---|---|---|
| `INVALID_WEIGHT` | `shipment`가 의미를 소유, adapter가 변환 | 호출자 입력 오류 | exit 2, stdout 빈 값, stderr JSON, traceback 없음 | `retryable:false` (같은 입력 재시도 무의미). 중복 방지 해당 없음(부수효과 없음) | S-3, S-4, S-5 |

## 누락 점검

사용자/권한, 데이터량/보존, 응답시간, 동시성, 운영 비용/담당자, 배포, 보안, 백업·복구: stateless 로컬 CLI이고 사용자가 성능 SLO·인증·저장·외부 서비스를 해당 없음으로 확정했으므로 추가 결정이 없다.

## 미정

| ID | 미정 | 영향 | 선행 | 필요한 답 |
|---|---|---|---|---|
| U-1 | weight 단위와 total 통화. | 현재 공개 동작에 영향 없음. 문서 표현에만 영향. 차단 아님. | 없음 | 사용자가 필요 시 지정 |

제품 동작을 바꾸는 미정은 없다. 단 A-1, A-2, A-3은 승인된 결정이 아니라 에이전트 제안이다.

## spec 전달 사항

요구 후보:

- R-1 성공 JSON/exit (D-2, D-4)
- R-2 가격 경계 1, 5, 6, 10 (D-1, D-3)
- R-3 범위 밖 0, 11 (D-1, D-5)
- R-4 비정수, 인수 누락 (D-1, D-5)
- R-5 실패 출력 계약: stdout 빈 값, stderr JSON, traceback 없음 (D-2, D-5)
- R-6 실패 후 유효 실행 성공 (D-6)

수용 시나리오 후보: S-1 `1`→5000 / S-2 경계 5, 6, 10 / S-3 0, 11 / S-4 비정수 / S-5 인수 누락 / S-6 실패 후 성공.

공통 기반 의존성: 없음.

## 확인과 NOTRUN

- 실행: 폴더 목록, `git status --short`, `keep.txt` 내용, `python --version`.
- NOTRUN: 외부 기술 조사(사용자 지시로 불필요), 제품 코드 실행(이 단계 범위 밖).
