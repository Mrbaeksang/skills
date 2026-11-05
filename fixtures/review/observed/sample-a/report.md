# 리뷰 보고서: `transfer.py`

**결론: 변경 불승인, build `done` 불가.** R1 권한 검사가 삭제되어 actor가 다른 사람 계좌의 잔액을 이체할 수 있는 P1 finding 1건이 미해결입니다.

## Finding

### [P1] 요구 위반: `actor` 권한 검사 삭제로 타인 계좌 이체 가능
- **위치:** head `transfer.py:10-11` 사이. 삭제된 줄은 `base.py.txt:11-12`, `change.diff:9-10`입니다.
- **위반 요구:** `spec.md` R1 "Only actor equal to source may transfer. Otherwise return error forbidden with the original balances, even if the amount is invalid."
- **원인:** head의 `transfer()`는 `request['actor']`를 전혀 읽지 않아, 이 변경으로 권한 분기가 사라졌습니다.
- **반증 확인:**
    - head에는 이 검사를 대신할 guard가 없습니다.
    - spec상 상위 adapter는 `actor`를 공급하고 인증할 뿐이며, `actor == source` 판정은 R1이 이 CLI의 동작으로 규정합니다.

| 도달 경로 (source reasoning, 미실행) | R1 기대 결과 | head 결과 |
|---|---|---|
| `actor=bob`, `source=alice`, `target=bob`, `amount=10`, 잔액 alice 100 / bob 0 | `forbidden`, 원래 잔액 | `ok: true`, alice 90 / bob 10 |
| `actor=bob`, `source=alice`, `amount=0` | `forbidden` | `invalid_amount` |

- **사용자 영향:**
    - 인증된 사용자라면 누구나 타인의 잔액을 옮기는 결과를 성공 응답으로 받을 수 있습니다.
    - 오류 우선순위도 R1과 달라집니다.
    - 이 CLI는 저장소 없이 잔액 맵만 계산하므로, 실제 잔액 손실 여부는 상위 시스템이 결과를 어떻게 쓰는지에 달려 있습니다. 상위 시스템은 검토 범위 밖입니다.
- **수정 방향:** 삭제된 `forbidden` 분기를 amount 검사보다 앞에 복원합니다. 위 두 경로는 회귀 테스트로 고정합니다.

## 요구사항별 판정

모든 판정은 소스 추론 결과이며, 실행 검증은 NOTRUN입니다.

| 기준 | 판정 | 근거 |
|---|---|---|
| R1 | **FAIL** | 위 finding |
| R2 | PASS | head `transfer.py:11-12`. 0 이하이거나 잔액을 넘는 amount를 거부하고, 복사본인 원래 잔액을 반환합니다. amount가 잔액과 같으면 허용합니다. |
| R3 | PASS | head `transfer.py:13-15`. 같은 계좌 이체는 차감 후 다시 가산되어 잔액이 그대로입니다. 다만 타인 계좌 요청까지 성공시키는 문제는 R1 finding에 해당합니다. |
| R4 | PASS | head `transfer.py:18-19`. 이번 변경과 무관하며, JSON 인자를 읽어 객체 하나를 stdout에 출력합니다. |
| S1 | PASS | 계산 경로에 float 변환이나 연산이 없습니다. float 입력은 계약 범위 밖입니다. |

이 변경이 추가로 만든 다른 문제와 기존 결함은 확인되지 않았습니다. 이는 제공된 자료 범위의 판단이며 안전을 보증하지는 않습니다.

## Build 완료 판단

- **현재 상태:** `done` 아님. 미해결 고위험 finding이 있고(인증 우회에 준하는 권한 우회), 필수 기준 R1이 FAIL이며, 실행 검증이 NOTRUN입니다.
- **완료 조건:**
    1. 수정된 새 head를 고정합니다.
    2. 실행 권한이 있는 환경에서 R1 두 경로와 R2·R3 회귀를 실제로 검증합니다.
    3. 새 head와 영향받는 경로를 다시 검토해 이 finding의 해소 근거를 남깁니다. 이전 head에 대한 판단은 새 변경에 적용되지 않습니다.

## 검토 범위와 한계

- **범위:** base `687048dbb960964ba4c992ec437e038e8d4b9a48` → head `690b0c2b59bc48e322356eb5e068c5683ba4a703`, 두 commit의 tree 비교, 변경 파일은 `transfer.py` 하나입니다.
- **명세:** `spec.md` v1이며, `scope.md`에 기록된 SHA-256은 `6b8a4af808ba441382f709f6fc53463b5b06a39efbac96808b8f3b2baa2ff023`입니다.
- **수행한 검사:** `scope.md`, `spec.md`, `change.diff`, `base.py.txt`, `transfer.py`와 설치된 review skill 참조 문서를 읽었습니다. `base.py.txt`와 `transfer.py`의 차이가 `change.diff`의 내용과 일치함을 눈으로 대조했습니다.
- **독립성:** 구현 세션과 분리된 독립 세션이라는 것은 요청에 명시된 내용입니다. 이 세션에서 구현자의 결론이나 예상 finding은 받지 않았고, 원자료로 직접 판단했습니다. 세션 분리 자체를 별도로 검증하지는 않았습니다.
- **NOTRUN:**
    - 코드와 테스트 실행
    - SHA-256 재계산과 commit·snapshot 대조 (`scope.md`의 host 검증 기재에 의존)
    - 대시보드 진행 보고 (`report.py` 실행이 금지 범위에 해당)
- **미탐색:** 테스트 코드, 상위 adapter, 호출자는 제공된 자료에 없고 허용 범위 밖입니다. 따라서 테스트 존재 여부와 상위 시스템의 실제 영향은 확인하지 못했습니다.
