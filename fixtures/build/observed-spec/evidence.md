# Quote CLI 완료 증거

검증일: 2026-11-05. 상태: 수용 기준 R1~R5 모두 PASS. 아래 NOTRUN 항목은 SPEC 필수 runtime 항목이 아닌 범위 밖 시나리오다.

## 환경과 범위

- cwd/저장소 루트: `<fixture>`
- branch/worktree: `fixture`, 단일 worktree, HEAD `e2bfdfd`
- 도구: Python 3.12.15 (표준 라이브러리만 사용), Windows 11, PowerShell 7+
- 작성 파일: `quote.py`, `test_quote.py`, `evidence.md`
- 입력: `SPEC.md`. tracker 없음. 상태는 이 파일에 로컬로 기록한다.

## 요구 연결

| 요구 ID | use case / 실행 입력 | 예상 관찰 | 실제 관찰 및 증거 위치 | 판정 |
|---|---|---|---|---|
| R1 | 호출자가 `python quote.py 1` 실행 | exit 0, stdout `{"total": 5000}` | 직접 실행: stdout `{"total": 5000}`, 도구 오류 없음. subprocess: `exit=0 stdout='{"total": 5000}\n' stderr=''` | PASS |
| R2 | 경계 `1`, `5`, `6`, `10` | 1..5는 5000, 6..10은 8000 | subprocess: 5→`{"total": 5000}`, 6→`{"total": 8000}`, 10→`{"total": 8000}`, 모두 exit 0. `test_price_bands_and_boundaries` ok | PASS |
| R3 | `0`, `11`, `abc`, `1.5`, 인자 없음 | exit 2, stdout 비어 있음, stderr에 지정 JSON, traceback/경로 없음 | 직접 실행 `python quote.py 0`: exit 2, `{"error":"INVALID_WEIGHT","retryable":false}`. subprocess 5건 모두 `exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'`. 테스트는 stderr를 정확히 비교한다 | PASS |
| R3 (추가 입력) | `-1`, `+1`, `5.0`, `1e0`, 빈 문자열, `" 5"`, `"5\n"`, `1_0`, `٣`, 5000자리 숫자, `1 2` | R3와 동일 | `test_out_of_range_and_noninteger_values`, `test_unexpected_extra_argument_is_not_a_single_weight` ok | PASS |
| R4 | `11` 실패 직후 `1` 호출 | 실패 후 정상 응답, 파일 생성 없음 | subprocess 연속 호출: `exit=2` 후 `exit=0 {"total": 5000}`. `test_failure_then_valid_invocation_succeeds_without_files`가 임시 cwd에 파일이 남지 않음을 확인. import는 `json`, `re`, `sys`뿐(소스 확인) | PASS |
| R5 | 구현 전후 `keep.txt`와 작업 트리 비교 | `keep.txt`와 기존 변경 유지, 의존성 추가 없음 | SHA256 `58BC1DF9EFE451B18EDA67997CAF87AD54021308B44E3752D0EB4B9465019B0E` 전후 동일, `git diff keep.txt` 전후 동일(`+uncommitted user line`). 기존 ` M keep.txt`, `?? .claude/`, `?? SPEC.md` 유지 | PASS |

## 자동 검사

`python -B -m unittest test_quote -v` (`-B`는 허용 범위 밖에 `__pycache__`가 생기지 않도록 사용)

- 구현 전(red): 6개 테스트 실행, `FAILED (failures=22)`. 파일이 없어도 Python이 exit 2를 반환하지만 stderr에 경로가 포함되어 정확 비교에서 실패했다.
- 구현 후(green): `Ran 6 tests in 2.045s`, `OK`.

모든 테스트는 공개 CLI 프로세스(`subprocess`)만 호출하며 내부 함수를 import하지 않는다.

## 도메인 경계

- shipment 도메인(`shipment_total`, `InvalidWeight`): 무게 검증과 가격, 오류 의미를 소유한다.
- CLI adapter(`main`): JSON 직렬화와 exit code 변환을 소유한다. `InvalidWeight`를 exit 2와 stderr JSON으로 변환하고, 이 오류는 재시도 불가로 표시한다.
- 인증·권한 시나리오는 SPEC R5에 따라 적용되지 않는다.

## 구현 선택과 추정

SPEC에 명시되지 않아 되돌릴 수 있는 선택으로 처리했다.

- 인자가 2개 이상이면 `INVALID_WEIGHT`로 처리한다.
- `05`처럼 앞에 0이 붙은 ASCII 숫자는 정수로 받아들인다(실제 호출: exit 0, `{"total": 5000}`). 테스트로 고정하지 않았다.
- `+1`, 공백 포함, `1_0`, 비 ASCII 숫자는 `int()`가 허용하더라도 거부한다.

## 환경 제약과 NOTRUN

- 실행 권한 정책상 `;`나 파이프를 포함한 PowerShell 명령은 거부되었다. 그래서 exit code는 단독 호출 시 도구 보고와 Python `subprocess` 관찰로 확인했다. 직접 호출에서 stdout/stderr 분리는 subprocess 관찰로 대신했다.
- NOTRUN: 런타임 네트워크 패킷 관찰. 근거는 소스의 import 확인뿐이다. 재개 조건: 네트워크 차단 또는 모니터링 환경에서 CLI 재실행.
- NOTRUN: Linux/macOS, Python 3.12.15 외 버전. 재개 조건: 해당 환경에서 위 unittest 명령 실행.
- NOTRUN: 독립 검토. 고위험 인증·결제·데이터 변경이 없어 완료 조건이 아니며, 이 문서는 구현자의 자기 점검이다.
