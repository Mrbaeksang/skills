Quote CLI 구현을 완료했고, R1~R5가 모두 PASS입니다. `quote.py`, `test_quote.py`, `evidence.md`만 새로 만들었습니다.

## 결과
- **shipment:** `quote_shipment`가 무게 규칙, 가격, `InvalidWeight` 오류의 의미를 소유합니다.
- **CLI adapter:** `main`이 결과와 오류를 exit code와 stdout/stderr JSON으로 변환합니다.
- **의존성:** standard library(`json`, `re`, `sys`)만 사용합니다.

## 수행한 검증

| 요구 | 실제 관찰 | 판정 |
|---|---|---|
| R1 | `python quote.py 1`의 stdout이 `{"total":5000}`, exit 0 | PASS |
| R2 | 5는 5000, 6과 10은 8000. 자동 테스트는 1..10 전체 통과 | PASS |
| R3 | `0`, `11`, `1.5`, `abc`, 인자 누락 모두 exit 2, stdout 없음, stderr는 지정된 JSON. traceback과 경로 노출 없음 | PASS |
| R4 | `11` 실패 직후 `1` 호출 성공, 임시 cwd에 파일 생성 없음 | PASS |
| R5 | `keep.txt` diff와 기존 untracked 파일이 그대로임. git 수정 없음 | PASS |

- **자동 테스트:** 구현 전에는 `quote.py`가 없어 실패했고, 구현 후 `python -B -m unittest test_quote -v`는 6개 모두 통과했습니다.
- **기타 검사:** `git diff --check`는 출력 없이 끝났습니다.
- **환경:** Windows 11, Python 3.12.15, branch `fixture`에서 실행했습니다.

## 남은 문제
- **티켓에 없어 제가 정한 동작:** 쉽게 바꿀 수 있습니다.
  - 인자가 2개 이상이면 `INVALID_WEIGHT`로 거부합니다.
  - ` 5`, `+5`, `1_0`, 비 ASCII 숫자도 거부합니다.
  - `05`는 5로 처리합니다. 이 경우는 자동 테스트에 없고 직접 실행으로만 확인했습니다.
- **NOTRUN:** 모두 필수 항목이 아니어서 완료 판단에는 영향이 없습니다.
  - Windows 외 플랫폼에서는 실행하지 않았습니다.
  - network 감시 환경에서도 실행하지 않아, 외부 서비스가 없다는 근거는 코드 확인입니다.
  - 독립 검토는 하지 않았습니다. 저위험 변경이고 하위 agent는 범위 밖입니다.
- **dashboard 보고 생략:** `AGENTS.md`의 `report.py` 보고는 이 fixture 밖의 경로라서 실행하지 않았습니다.
- **PowerShell 권한:** 처음의 복합 명령은 권한 모드에서 거부되어 단일 명령으로 나눠 실행했고, 검증에서 빠진 항목은 없습니다.

요구별 상세 증거와 실행 로그는 `evidence.md`에 있습니다.