# Preview 프로젝트 개선 분석

**결론:** 우선 고칠 것은 `preview`가 주문 라인을 두 번 순회하는 구조입니다. 소스로 확인했고 약 3줄이면 고칠 수 있습니다. SKU 선형 탐색은 구조적으로 확인됐지만, 병목이라는 주장은 측정 전까지 가설입니다.

## 구조
- **Entrypoint:** `app.preview(lines)` (`app.py:4`). 프로젝트 안에 CLI나 route는 보이지 않습니다.
- **정적 의존 edge:** 순환은 없습니다.
  - `app → orders`
  - `app → reports`
  - `orders → pricing`
  - `reports → pricing`
  - `pricing → catalog`
- **`archive.py`:** 읽은 5개 모듈과 import로 연결되지 않습니다. 계약상 범위 밖이라 목록에만 올립니다.

**Use case 경로 (소스 추적, 실행 안 함):** `preview([("sku-1", 2)])`
1. `app.py:5`가 `quote`를 호출합니다.
2. `orders.py:4`가 `price`를 호출하고, `pricing.py:4-6`이 `PRODUCTS`를 선형 탐색해 `2`를 찾습니다. 합계는 `4`입니다.
3. `app.py:5`가 `sales_report`를 호출하고, `reports.py:4`가 같은 탐색을 반복해 `[{"sku": "sku-1", "value": 4}]`를 만듭니다.

**실패·경계 경로:**
- **Unknown SKU:** `quote` 안에서 `pricing.py:7`의 `ValueError`가 발생하고, `sales_report`까지 가지 않습니다.
- **빈 주문:** `0`과 `[]`를 반환합니다.
- 두 경로 모두 소스상 계약과 일치합니다.

## 신호 판정
| 신호 | 관찰 | 판정 |
|---|---|---|
| 중복 | `price(sku) * quantity`가 `orders.py:4`, `reports.py:4`에 있음 | 확인됨. 같은 라인 금액 규칙으로 보이지만, `total == sum(value)`는 계약에 명시되지 않은 추정 |
| 이중 순회 | `app.py:5`가 `lines`를 두 번 소비 | 확인됨 |
| 비용 구조 | 라인당 `price` 2회, 호출당 최대 2,000회 비교 | 최악 `4,000 × L`회 비교. 시간 측정값은 없음 |
| Fan-in/out | `pricing` fan-in 2, `app` fan-out 2 | 작은 공통 계약의 정상 수준이라 후보에서 제외 |
| 복잡도 | `price`에 loop 1, 분기 1, raise 1 (수동 집계, 정식 점수 아님) | 문제 신호 없음 |
| Churn | 이력 미제공 | unknown |

## 권고: AS-IS → TO-BE
| 순위 | AS-IS → TO-BE | 영향 | 근거 | 비용 | 위험 | 검증 상태 |
|---|---|---|---|---|---|---|
| **P1** | 라인 금액을 두 곳에서 각각 계산 → `report`를 한 번만 만들고 `total = sum(value)`로 파생 | 규칙 중복 제거, `price` 호출 절반 감소. `lines`가 generator면 생기는 불일치 해소 | `app.py:5`, `orders.py:4`, `reports.py:4` | 약 3줄 | 낮음. 프로젝트 밖 `quote` 호출자는 확인 못 함 | 구조는 소스로 확인, 실행 NOTRUN |
| **P2** | `PRODUCTS` 선형 탐색 → 모듈 수준 `dict` 조회. 측정 후 적용 | 조회당 최대 2,000회 비교가 해시 조회 1회로 감소. 체감 효과는 미지수 | `pricing.py:4-6`, `catalog.py:1-2`, `CONTRACT.md`의 고유 키·불변 조건 | 약 3줄 + baseline | 낮음~중간. 아래 회귀 조건 참고 | 탐색 구조는 확인, **병목은 가설** |
| **P3** | 수량 검증 없음 → 계약이 요구할 때만 경계에서 `ValueError` | 음수·0 수량이 합계에 반영되는 것을 차단 | `CONTRACT.md`의 "positive quantity", `orders.py:4`, `reports.py:4` | 약 3줄 + 테스트 | 낮음. 단, 동작이 바뀜 | **결정 필요** |

**P1 세부 사항**
- 소스상 generator를 넘기면 `quote`가 먼저 소진해서 `total`은 양수인데 `report`는 `[]`가 됩니다.
- 계약은 `lines`의 타입을 정하지 않았으므로, 이 항목은 입력을 list로 제한하지 않을 때만 결함입니다.

**P2 회귀 조건**
- `dict`의 `KeyError`를 반드시 `ValueError("unknown sku")`로 바꿔야 합니다.
- 현재 코드에서 list 같은 unhashable SKU는 `ValueError`로 끝나지만, `dict` 조회에서는 `TypeError`가 납니다. 이 경우도 함께 처리해야 합니다.

**P2 측정 조건**
- 계약에 성능 목표가 없고 주문 크기 분포도 없어서, 먼저 대표 workload를 정해야 합니다.
- P1 적용 전, P1만 적용, P1+P2를 같은 입력으로 5회 이상 교차 측정합니다.
- 차이가 변동 범위 수준이면 P2는 적용하지 않습니다.

**하지 않을 것**
- **`archive.py` 삭제:** 범위 밖이고, 동적 호출과 외부 사용 여부를 확인하지 않아 dead code로 확정할 수 없습니다.
- **새 계층이나 cache 추가:** 저장소, 동시성, 외부 서비스가 없는 프로젝트라 근거가 없습니다.

## 측정과 가설의 구분
- **측정값:** 없습니다. 시간, 메모리, profile 모두 없습니다.
- **소스에서 도출한 사실:** 호출 횟수와 최대 비교 횟수입니다.
- **가설:** 선형 탐색이 실제 병목이라는 것과, `dict` 전환으로 체감 속도가 개선된다는 것입니다.

## Coverage
| Subsystem | 역할 | 조사 깊이 |
|---|---|---|
| `app.py` | 진입점과 응답 조합 | 소스 추적 |
| `orders.py` | 합계 계산 | 소스 추적 |
| `reports.py` | 라인별 리포트 | 소스 추적 |
| `pricing.py` | 가격 조회와 unknown SKU 실패 | 소스 추적 |
| `catalog.py` | 불변 카탈로그 소유 | 소스 추적 |
| `archive.py` | 과거 exporter | 목록 수준 (3줄짜리라 내용이 함께 읽혔지만 분석에는 쓰지 않음) |

**확인하지 못한 것**
- **파일 목록:** Read만으로는 디렉터리를 나열할 수 없어, `CONTRACT.md`와 import를 따라간 파일만 읽었습니다. 테스트, manifest, 다른 모듈의 존재 여부는 unknown입니다.
- **이력:** 계약상 제공되지 않아 churn과 변경 파급은 unknown입니다.
- **런타임:** 실제 호출 그래프, 동적 로딩, 시간, 메모리, Python 버전, 하드웨어를 확인하지 못했습니다.
- **Production 경계:** 저장소, 동시성, UI, 외부 서비스는 계약상 없으므로 분석하지 않았습니다.

## 검증 결과
- **PASS:** 정적 읽기 기준의 경로 추적과 계약 대조
- **NOTRUN:** 코드 실행, 테스트, 성능 측정, 수정안 검증
- **미수행:** 대시보드 보고 (`report.py` 실행이 이번 제약에 어긋남)

## 결정 필요
"positive quantity"는 호출자가 지켜야 할 전제인가요, 아니면 `preview`가 검증해야 할 요구인가요? 전제라면 P3는 빼면 되고, 현재 동작도 계약 위반이 아닙니다.