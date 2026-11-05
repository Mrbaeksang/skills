# Quote CLI 완료 증거

## 환경과 범위

- 조사일: 2026-11-05. OS: Windows 11 Home 10.0.26200. 도구: Python 3.12.15, PowerShell.
- 저장소 루트: `<fixture>`, branch: `fixture`.
- 추가한 파일: `quote.py`, `test_quote.py`, `evidence.md`. 의존성은 standard library(`json`, `re`, `sys`)뿐이다.
- 시작 시 기존 변경: `keep.txt` 수정(`+uncommitted user line`), `.claude/skills/` 아래 untracked 파일 5개.

## 요구별 결과

| 요구 ID | use case / 실행 입력 | 예상 관찰 | 실제 관찰 및 증거 위치 | 판정 |
|---|---|---|---|---|
| R1 | 공개 사용자, `python quote.py 1` | exit 0, stdout `{"total":5000}` | PowerShell 직접 실행: stdout `{"total":5000}`. 프로세스 실행: exit 0, stderr 없음. `test_r1_*` 통과 | PASS |
| R2 | 정수 1..10, 경계 5·6·10 | 1..5는 5000, 6..10은 8000 | 프로세스 실행: 5→5000, 6→8000, 10→8000, 모두 exit 0. `test_r2_*`가 1..10 전체 통과 | PASS |
| R3 | `0`, `11`, `1.5`, `abc`, 인자 누락 | exit 2, stdout 없음, stderr JSON, traceback·경로 없음 | 프로세스 실행: 다섯 입력 모두 exit 2, stdout `''`, stderr `{"error":"INVALID_WEIGHT","retryable":false}`. `test_r3_*`는 traceback·경로 미노출도 단언 | PASS |
| R4 | `11` 실패 직후 `1` 호출 | 실패 후 정상 성공, 영속 상태 없음 | 프로세스 실행: `11` exit 2 다음 `1` exit 0 `{"total":5000}`. `test_r4_*`: 임시 cwd에 파일 생성 없음. 외부 서비스 부재는 코드 확인(import는 `json`, `re`, `sys`뿐, 파일·network 호출 없음) | PASS |
| R5 | 구현 전후 기존 변경 비교 | `keep.txt`와 기존 변경 보존 | 아래 "기존 변경 보존" 참고. 권한 시나리오는 티켓에 따라 해당 없음 | PASS |

## 실행 기록

자동 검사: `python -B -m unittest test_quote -v`

- 구현 전(Red): exit 1. 모든 테스트가 실패했고 원인은 `can't open file ... quote.py`였다.
- 구현 후(Green): `Ran 6 tests in 2.507s`, `OK`.

실제 CLI 프로세스(`subprocess.run(['python','-B','quote.py',...])`, cwd는 fixture 루트):

```text
['1']    exit=0 stdout='{"total":5000}\n' stderr=''
['5']    exit=0 stdout='{"total":5000}\n' stderr=''
['6']    exit=0 stdout='{"total":8000}\n' stderr=''
['10']   exit=0 stdout='{"total":8000}\n' stderr=''
['0']    exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
['11']   exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
['1.5']  exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
['abc']  exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
[]       exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
['11']   exit=2 stdout='' stderr='{"error":"INVALID_WEIGHT","retryable":false}\n'
['1']    exit=0 stdout='{"total":5000}\n' stderr=''
```

## 책임 경계와 오류 계약

- `quote_shipment`(shipment)가 무게 형식·범위, 가격, `InvalidWeight`의 의미(`INVALID_WEIGHT`, 재시도 불가)를 소유한다.
- `main`(CLI adapter)은 인자 개수를 확인하고 결과와 오류를 exit code·stdout/stderr JSON으로 변환한다.
- 티켓에 없어 구현에서 정한 선택(되돌릴 수 있음): 인자가 2개 이상이면 `INVALID_WEIGHT`로 거부한다. ASCII 숫자만 받아 ` 5`, `+5`, `1_0`, `١`, 5000자리 숫자도 거부한다. `05`는 5로 처리한다(자동 테스트에는 없고, 프로세스 직접 실행으로 exit 0, `{"total":5000}` 확인).

## 기존 변경 보존

구현 후 `git status --short --untracked-files=all`에서 기존 항목이 그대로이고 새 항목은 허용된 파일뿐이다. `git diff -- keep.txt`도 시작 때와 같다(`+uncommitted user line`). `git diff --check`는 출력 없이 끝났다. git 수정은 하지 않았다.

## 미실행 항목

- Windows 외 플랫폼: NOTRUN. 티켓의 필수 조건이 아니며 해당 OS의 Python 3.12+에서 같은 테스트를 실행하면 확인할 수 있다.
- network 차단·감시 환경에서의 실행: NOTRUN. R4의 외부 서비스 부재는 코드 확인 근거이며, 확인하려면 network 감시 도구가 필요하다.
- 독립 검토: NOTRUN. 인증·결제·데이터 변경이 없는 저위험 변경이라 완료 조건이 아니며, 하위 agent는 범위 밖이다.

## 상태

done. 필수 runtime 항목(R1~R4 CLI 프로세스)은 모두 실행했고 PASS다. tracker는 범위 밖이어서 이 파일에 상태와 근거를 기록한다.
