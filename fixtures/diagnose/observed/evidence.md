# quote.py 진단 증거

## 1. 관찰 경계

- cwd: `<fixture>`
- branch/worktree: `fixture` @ `aae1df4` (worktree 1개)
- 기존 변경: `M keep.txt`, `?? .claude/` — 이 작업과 무관하며 수정하지 않음
- runtime: Python 3.12.15, `<python-executable>`
- 실행 경계: `python quote.py <subtotal>` 프로세스의 stdout/stderr/exit code
- 호출 경로: `sys.argv[1]` → `int()` → 음수 검사 → `quote.py:17` 배송비 비교 → JSON 출력. 외부 의존성 없음(`json`, `sys`만 사용)
- 최초 발생 시점: 미상. 커밋이 baseline 1개뿐이라 revision 비교 불가

## 2. 수정 전 재현

명령: `python quote.py 50000`

- 기대: `{"subtotal": 50000, "shipping": 0, "total": 50000}`, exit 0
- 실제: `{"subtotal": 50000, "shipping": 3000, "total": 53000}`, exit 0, stderr 비어 있음

수정 전 동작 기준선(인자, exit, stdout, stderr; `subprocess.run`으로 수집):

| argv | exit | stdout | stderr |
|---|---|---|---|
| `50000` | 0 | `{"subtotal": 50000, "shipping": 3000, "total": 53000}` | 빈 값 |
| `+50000` | 0 | `{"subtotal": 50000, "shipping": 3000, "total": 53000}` | 빈 값 |
| `" 50000"` | 0 | `{"subtotal": 50000, "shipping": 3000, "total": 53000}` | 빈 값 |
| `050000` | 0 | `{"subtotal": 50000, "shipping": 3000, "total": 53000}` | 빈 값 |
| `49999` | 0 | `{"subtotal": 49999, "shipping": 3000, "total": 52999}` | 빈 값 |
| `50001` | 0 | `{"subtotal": 50001, "shipping": 0, "total": 50001}` | 빈 값 |
| `0` | 0 | `{"subtotal": 0, "shipping": 3000, "total": 3000}` | 빈 값 |
| `50000.0` | 2 | 빈 값 | `{"error": "invalid subtotal"}` |
| `-1` | 2 | 빈 값 | `{"error": "invalid subtotal"}` |
| `abc` | 2 | 빈 값 | `{"error": "invalid subtotal"}` |
| `1.5` | 2 | 빈 값 | `{"error": "invalid subtotal"}` |
| `""` | 2 | 빈 값 | `{"error": "invalid subtotal"}` |
| 인자 없음 | 2 | 빈 값 | `{"error": "usage"}` |
| `1 2` | 2 | 빈 값 | `{"error": "usage"}` |

## 3. 경쟁 가설과 구분 실험 (수정 전)

| ID | 가설 | 반증 가능한 예측 |
|---|---|---|
| H1 | 입력 파싱이 값을 변형해 분기에 50000이 아닌 값이 들어간다 | 출력 `subtotal`이 50000과 다르거나, 표기(`+50000`, `050000`)에 따라 결과가 달라진다 |
| H2 | 임계값이 50000보다 높게 잘못 설정되어 있다 | 50001에서도 배송비 3000이 부과된다 |
| H3 | 임계값은 맞지만 비교가 경계값을 제외한다(`>`를 `>=`로 써야 함) | 50000만 유료, 50001은 무료이고, 비교 연산자 하나만 바꾸면 50000만 결과가 바뀐다 |

| 실험 | 입력/통제 | H1 예상 | H2 예상 | H3 예상 | 실제 결과 | 판정 |
|---|---|---|---|---|---|---|
| E1 입력 표기 | `50000`, `+50000`, `" 50000"`, `050000` | `subtotal` 변형 또는 결과 차이 | 무관 | 네 입력 모두 `subtotal` 50000, 동일 결과 | 네 입력 모두 `subtotal` 50000, shipping 3000 | H1 기각 |
| E2 경계 대조 | `49999`, `50000`, `50001` | 무관 | 50001도 3000 | 3000 / 3000 / 0 | 3000 / 3000 / 0 | H2 기각, H3 지지 |
| E3 반사실 | 파일을 수정하지 않고 메모리에서 소스의 `subtotal > 50000`만 `subtotal >= 50000`으로 치환해 `main()` 실행 | 무관 | 무관 | 50000만 바뀜 | 아래 표 | H3 지지 |

E3 결과(`(exit, stdout)`):

| 입력 | 원본 | 변형 |
|---|---|---|
| 49999 | `(0, {"subtotal": 49999, "shipping": 3000, "total": 52999})` | 동일 |
| 50000 | `(0, {"subtotal": 50000, "shipping": 3000, "total": 53000})` | `(0, {"subtotal": 50000, "shipping": 0, "total": 50000})` |
| 50001 | `(0, {"subtotal": 50001, "shipping": 0, "total": 50001})` | 동일 |

E3는 `main()`을 메모리에서 호출한 실험이므로 실제 CLI 검증이 아니다. 실제 CLI 검증은 5절에 기록한다.

원인 연결: 증상(50000에 배송비 부과) → `quote.py:17`의 분기 → 계약("50000원 이상 무료") 위반 → 비교 연산자 `>`가 경계값 제외.

## 4. 최소 수정

`quote.py:17` 한 곳만 변경:

```diff
-    fee = 0 if subtotal > 50000 else 3000
+    fee = 0 if subtotal >= 50000 else 3000
```

## 5. 수정 후 확인

동일 재현 `python quote.py 50000`:

| 시점 | stdout |
|---|---|
| 수정 전 | `{"subtotal": 50000, "shipping": 3000, "total": 53000}` |
| 수정 후 | `{"subtotal": 50000, "shipping": 0, "total": 50000}` |

공개 CLI 회귀 테스트 `python -B -m unittest test_quote -v` (`test_quote.py`가 `quote.py`를 실제 프로세스로 실행하고, 파싱한 JSON, stdout/stderr 채널, exit code를 검증):

| 시점 | 결과 |
|---|---|
| 수정 전 | FAIL: 6 tests, failures=4 — `test_threshold_subtotal_ships_free` 1건, `test_equivalent_threshold_notations_ship_free` subTest 3건. 그 외 4개 테스트 ok. 실패 내용은 모두 `{'subtotal': 50000, 'shipping': 3000, 'total': 53000} != {'subtotal': 50000, 'shipping': 0, 'total': 50000}` |
| 수정 후 | PASS: 6 tests, OK |

2절 기준선 14개 입력 재실행 결과: subtotal이 50000으로 파싱되는 4개 입력(`50000`, `+50000`, `" 50000"`, `050000`)만 `shipping` 0, `total` 50000으로 바뀌었다. 나머지 10개 입력의 stdout, stderr, exit는 수정 전과 동일하다.

## 6. 검증 상태와 한계

| 항목 | 상태 | 근거/재개 조건 |
|---|---|---|
| 재현 전후 비교 | PASS | 5절 |
| 공개 CLI 회귀 | PASS | 5절 |
| 변경 파일 범위 | PASS | `git status --short --untracked-files=all`: 이 작업의 변경은 `quote.py`, `test_quote.py`, `evidence.md`뿐. `__pycache__` 없음 |
| `keep.txt` 보존 | 부분 확인 | 편집하지 않았고 크기가 작업 시작 시와 같은 44바이트. 시작 시 내용 hash를 남기지 않아 내용 동일성은 직접 비교하지 못함 |
| `git diff` 검토 | NOTRUN | 허용 명령 목록에 없어 실행하지 않음. 4절 diff는 적용한 Edit 기준. 재개 조건: `git diff -- quote.py` 허용 |
| 실제 사용자 환경 재현 | NOTRUN | 이 fixture에서만 실행 |
