**회귀 검증은 완료되지 않았습니다.** `shape → spec → ticket → build` 스킬 호출과 파일 인계까지는 실제로 수행했지만, `quote.py`와 `test_quote.py`는 한 번도 실행하지 못했습니다. build 단계에서 `PowerShell`이 거절되어 CLI 동작은 입증되지 않았고, T-1과 T-2는 done이 아닌 active 상태입니다.

## 실제 실행한 것
- **Skill 호출:** 네 스킬을 순서대로 호출했고 모두 로드되었습니다.
- **파일 인계:** `decisions.md` → `SPEC.md` → `tickets.md` → `evidence.md`, `quote.py`, `test_quote.py` 순서로 앞 단계 파일을 읽고 다음 파일을 작성했습니다.
- **shape 단계 명령:** `python --version`(3.12.15)과 `git status --short`는 실행되었습니다.
- **`keep.txt`:** `Read`로 다시 읽은 내용이 처음과 같습니다.
- **쓰기 범위:** 허용된 6개 파일만 작성했고 git을 변경하는 명령은 쓰지 않았습니다.
- **책임 경계(AC-7):** 코드를 직접 읽어 확인한 정적 PASS이며, 구현자의 자기 점검입니다.

## NOTRUN
| 항목 | 원인 |
|---|---|
| `test_quote.py` 전체 (red, green 모두) | `PowerShell` 거절 |
| AC-1a, 1c, 2a~c, 3a~b, 4a~d, 5a, 6의 runtime 검증 | `PowerShell` 거절 |
| 실제 `python quote.py ...` 실행 | `PowerShell` 거절 |
| 최종 `git status`, `keep.txt` 해시 비교 | `PowerShell` 거절 |
| 독립 검토 | 고위험 변경이 아니고 하위 agent 금지 |

거절은 두 번 있었고 명령은 각각 git 상태·해시 확인과 unittest 실행입니다. 그 뒤로는 형태를 바꾸거나 다른 실행 경로를 찾지 않았습니다.

## 요구와 다르게 처리한 점
- **에이전트 제안 (승인 필요):** 요구에 없는 입력 해석이라 조건부 기준으로 구분해 두었습니다.
  - **A-1:** `" 1"`, `"+1"`, `"01"`, `"1_0"`, 비ASCII 숫자를 거절합니다.
  - **A-2:** 인수가 2개 이상이면 거절합니다.
  - **A-3:** 성공 시 stderr가 비어 있어야 합니다.
- **기준 철회:** 내가 제안했던 출력 원문 일치 기준 AC-1b와 AC-5b를 build 단계에서 철회했습니다. 사용자 요구에 없는 형식이고 `build` 규칙에도 어긋나기 때문이며, ID는 그대로 두고 앞 단계 문서도 함께 고쳤습니다.
- **앞 단계 문서 수정:** `decisions.md`의 A-1 문구와 D-9 표현도 spec 단계에서 고쳤습니다.
- **명세 밖 테스트 입력:** `-1`, `"9"*5000`, `"1\n"`을 추가했습니다. `"9"*5000`은 Python 3.12의 `int()` 자릿수 상한에 대한 기억에 근거한 것이고, 이 환경에서 확인하지 않은 추정입니다.
- **미정 사항:** weight 단위와 통화(U-1)가 남아 있지만 동작에는 영향이 없습니다.

## 재개 조건
이 폴더에서 아래 명령을 실행할 권한이 필요합니다. `-B`는 허용 범위 밖인 `__pycache__`가 생기지 않게 합니다. 결과가 나오면 `evidence.md`의 판정을 갱신하면 됩니다.

```powershell
python -B -m unittest test_quote -v
python quote.py 1; "exit=$LASTEXITCODE"
python quote.py 0; "exit=$LASTEXITCODE"
python quote.py; "exit=$LASTEXITCODE"
git status --short
```

산출물은 모두 fixture 폴더(`.artifacts/integration13`)에 있습니다. 판정 근거는 `evidence.md`에 있습니다.
