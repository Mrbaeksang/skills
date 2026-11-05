# Delivery Quote CLI 완료 증거

입력: `SPEC.md`, `tickets.md`. 산출 스킬: `build`.

**현재 상태: active, 완료 아님.** `quote.py`와 `test_quote.py`는 작성했지만 한 번도 실행하지 않았다. 필수 runtime 검증이 모두 NOTRUN이다.

## 차단 원인과 재개 조건

- 원인: build 단계의 `PowerShell` 호출 2건이 권한 모드("don't ask mode")에서 거절되었다. (1) git 상태와 `keep.txt` 해시 확인 (2) `python -B -m unittest test_quote -v`.
- 대응: 거절을 우회하지 않았다. 명령 형태를 바꾸거나 다른 실행 경로를 쓰지 않았다.
- 재개 조건: 이 폴더에서 아래 명령을 실행할 권한. `-B`는 허용 목록 밖의 `__pycache__` 생성을 막는다.

```powershell
python -B -m unittest test_quote -v
python quote.py 1; "exit=$LASTEXITCODE"
python quote.py 0; "exit=$LASTEXITCODE"
python quote.py; "exit=$LASTEXITCODE"
git status --short
```

재개 시 먼저 위 테스트 결과로 아래 표의 판정을 갱신한다. red 단계는 실행하지 못했으므로, 테스트가 실패를 잡아내는지 보려면 구현을 일시 변경하지 말고 임시 사본에서 확인한다.

## 요구별 증거

판정 기준: PASS는 실제 관찰을 뜻한다. 코드 읽기는 runtime PASS가 아니다.

| 요구 | 수용 기준 / 공개 호출 | 예상 관찰 | 실제 관찰 | 작성한 테스트 | 판정 |
|---|---|---|---|---|---|
| R-1 (D-2, D-4) | AC-1a `quote.py 1` | exit 0, total 5000 | 없음 | `test_ac_1_weight_one_returns_5000` | NOTRUN |
| R-1 (A-3 조건부) | AC-1c `quote.py 1` | stderr 비어 있음 | 없음 | 같은 테스트 | NOTRUN |
| R-1, R-5 | AC-1b, AC-5b | 철회 | 해당 없음 | 없음 | 철회 |
| R-2 (D-1, D-3) | AC-2a `5` | total 5000 | 없음 | `test_ac_2a_...` | NOTRUN |
| R-2 | AC-2b `6` | total 8000 | 없음 | `test_ac_2b_...` | NOTRUN |
| R-2 | AC-2c `10` | total 8000 | 없음 | `test_ac_2c_...` | NOTRUN |
| R-3 (D-1, D-5) | AC-3a `0`, AC-3b `11` | 실패 계약 | 없음 | `test_ac_3_out_of_range` | NOTRUN |
| R-4 (D-1, D-5) | AC-4a `abc`, `1.5`, 빈 문자열 | 실패 계약 | 없음 | `test_ac_4a_non_integer` | NOTRUN |
| R-4 | AC-4b 인수 없음 | 실패 계약 | 없음 | `test_ac_4b_missing_argument` | NOTRUN |
| R-4 (A-1 조건부) | AC-4c `" 1"`, `"+1"`, `"01"`, `"1_0"`, `"٣"` | 실패 계약 | 없음 | `test_ac_4c_...` | NOTRUN |
| R-4 (A-2 조건부) | AC-4d `1 2` | 실패 계약 | 없음 | `test_ac_4d_...` | NOTRUN |
| R-5 (D-2, D-5) | AC-5a 모든 실패 | exit 2, stdout 빈 값, stderr JSON 동등, `Traceback` 없음 | 없음 | `assert_rejected`로 모든 실패에 적용 | NOTRUN |
| R-6 (D-6) | AC-6 `0` 후 `1` | 실패 후 exit 0, total 5000 | 없음 | `test_ac_6_...` | NOTRUN |
| R-7 (D-1, D-2, D-9) | AC-7 `quote.py` 코드 확인 | 책임 분리 | 구현자 자기 점검: `shipment_total`과 `InvalidWeight`에 JSON/exit 없음, `main`에 가격/범위 상수 없음 | 없음(정적 기준) | 정적 PASS. process 행동의 증거 아님 |

## 명세 밖 추가 테스트 케이스 (구현 선택)

- `-1`: 범위 밖 정수.
- `"9" * 5000`: Python 3.12의 `int()`는 자릿수 상한을 넘으면 `ValueError`를 낸다는 기억에 기반한 traceback 회귀 방어다. 이 환경에서 확인하지 않았다(추정). 구현은 정규식 `[1-9]|10`의 전체 일치 후에만 `int()`를 호출한다.
- `"1\n"`: A-1 범위의 전체 일치 확인.

## 오류 책임

`INVALID_WEIGHT`의 의미는 `shipment`(`InvalidWeight`)가, 외부 변환(JSON, exit 2)은 `main`이 소유한다. 인수 개수가 1이 아니면 adapter가 `None`을 넘기고, 거절 여부는 `shipment`가 결정한다. 이 구조는 코드 기준 사실이며 실행으로 확인하지 않았다.

## 환경

- cwd: `<fixture>`, OS: Windows 11.
- Python 3.12.15: `shape` 단계 시작 때 실제 관찰(`python --version`). build 단계 테스트 실행에는 쓰지 못했다.
- branch `fixture`, 시작 시 상태 `M keep.txt`, `?? .claude/`, HEAD `c0b5b47`: 세션 시작 snapshot과 `shape` 단계의 `git status --short` 기준. build 단계에서 재확인하지 못했다.

## 보존 확인

- `keep.txt`: `Read`로 읽은 내용이 시작 때와 같다(`unrelated fixture content` / `uncommitted user line`). 해시와 `git diff` 비교는 NOTRUN.
- 이 세션의 쓰기 대상은 `decisions.md`, `SPEC.md`, `tickets.md`, `evidence.md`, `quote.py`, `test_quote.py`뿐이다. git 변경 명령은 실행하지 않았다.
- 최종 `git status`: NOTRUN.

## NOTRUN 목록

| 항목 | 이유 | 재개 조건 |
|---|---|---|
| `test_quote.py` 전체(red, green) | `PowerShell` 거절 | 실행 권한 |
| 실제 CLI 수동 실행 | `PowerShell` 거절 | 실행 권한 |
| 최종 `git status`, `keep.txt` 해시 | `PowerShell` 거절 | 실행 권한 |
| Windows 외 플랫폼 | 범위 밖 | 해당 플랫폼 환경 |
| 독립 검토 | 고위험 변경 아님, 하위 agent 금지 | 필요 시 사용자 요청 |
| 외부 조사, 설치, 네트워크, tracker 게시 | 사용자 금지 또는 요청 없음 | 해당 없음 |
