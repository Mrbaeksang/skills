# 장비 대여 서비스 결정 기록: 예약 충돌과 반납 지연

**전체 설계는 아직 확정이 아닙니다.** U-02, U-03, U-05~U-07이 제품 동작이나 migration에 영향을 주므로 spec에서 조건이나 차단 사항으로 남겨야 합니다.

- **추천:** Express 5.1.0, PostgreSQL 17, 단일 VM을 유지합니다. 겹침 방지는 PostgreSQL exclusion constraint로 강제합니다.
- **연체 처리:** 별도 상태나 batch 없이 `dueAt`에서 계산합니다.
- **공식 자료:** 이 세션에는 웹 조회 도구가 없어 하나도 조회하지 못했습니다. PostgreSQL·Express·Fastify에 관한 내용은 모두 기억에 근거한 미검증 사항이며, 지원 상태나 최신 버전은 단정하지 않습니다.

## 1. 확인 범위

- **읽은 자료:** `fixture-context.md`, shape 스킬과 그 참조 문서
- **없는 자료:** `package.json`, `modules/reservations/service.js`, `modules/loans/service.js`, `http/error-handler.js`는 cwd에 없습니다. 코드 관련 사실은 모두 fixture의 발췌 기준입니다.
- **제공되지 않은 자료:** lockfile, DB schema, 인증 코드, 배포 설정, 용어집, ADR

## 2. 범위와 비목표

- **범위:** 예약 충돌, 연체 표시, 반납 정정, 모듈 경계, 오류 책임
- **비목표:** 결제, 벌금, 자동 이용 정지, 클라우드 이전, 프레임워크 교체, 실제 변경·배포·tracker 게시
- **Actor:** Employee, Operator, Maintainer(2명)

## 3. 확정 결정 (출처: `fixture-context.md`)

| ID | 결정 | 영향 |
|---|---|---|
| D-01 | 사내 직원 전용, 80명, 동시 예약 시도 최대 8건 | 동시성 검증 기준 |
| D-02 | Maintainer 2명, 기존 Linux VM 1대, 운영 예산 불변, 클라우드 이전 없음 | 기술 선택 |
| D-03 | Node.js 22, Express 5.1.0, PostgreSQL 17, 단일 프로세스 | 기준 stack |
| D-04 | 예약 1건은 장비 1개와 half-open 구간 1개 | 예약 모델 |
| D-05 | 확정 예약은 같은 장비에서 절대 겹치지 않음 | 핵심 불변식 |
| D-06 | 취소된 예약은 슬롯을 비움 | 제약 범위 |
| D-07 | due date를 넘으면 연체. 결제, 벌금, 자동 정지 없음 | 대출 |
| D-08 | Operator는 잘못된 반납을 audit trail과 함께 정정 가능 | 대출, 감사 |
| D-09 | Employee는 자기 대출만 조회 | 권한 |
| D-10 | 복구 목표 1 영업일, 야간 암호화 백업 승인 | 운영 |
| D-11 | 응답시간 목표는 측정값이 없으므로 미정으로 유지 | U-01 |
| D-12 | Reservation은 약속된 미래 구간, Loan은 실제 보관 | 용어 |
| D-13 | `ReservationConflict`는 reservations, `InvalidReturn`은 loans 소유 | 오류 |

**현재 코드에서 드러난 문제**
- **예약 경합:** `SELECT` 후 별도 `INSERT`를 합니다. 발췌에 잠금이 보이지 않아 경합으로 D-05가 깨질 수 있습니다(추정). 단일 프로세스여도 비동기 요청이 서로 다른 DB 연결에서 교차하므로 막아 주지 못합니다.
- **오류 처리:** 모든 오류를 500과 `error.message`로 응답합니다. 충돌을 구분하지 못하고 내부 정보도 노출될 수 있습니다.
- **모듈 경계:** controller가 두 모듈의 테이블을 직접 읽습니다.
- **버전 범위:** `engines`는 `>=22`인데 결정된 runtime은 22입니다. 제약이 결정보다 넓습니다.

## 4. 에이전트 추천 (승인된 결정 아님)

| ID | 추천 | 이유 |
|---|---|---|
| P-01 | DB exclusion constraint를 D-05의 최종 강제 수단으로 사용 | 모든 쓰기 경로에 적용되고 추가 인프라가 없음 |
| P-02 | 현재 stack 유지 | 경합과 오류 문제 모두 프레임워크가 원인이 아님 |
| P-03 | 연체는 저장하지 않고 계산: `state = checkedOut AND now >= dueAt` | batch와 불일치가 없고, 반납 정정 시 자동으로 맞음 |
| P-04 | 장비당 활성 Loan은 1건만 허용(partial unique index) | 실제 보관의 물리적 제약을 DB로 보장 |
| P-05 | modular monolith 유지, 모듈 공개 계약만 호출 | 현재 구조 보존. CQRS, event sourcing, repository layer 불필요 |
| P-06 | 도메인 오류와 중앙 handler의 책임 분리 | 5.4 참고 |
| P-07 | 정정과 감사 기록을 한 트랜잭션에서 append-only로 저장 | 정정과 기록의 불일치 방지 |
| P-08 | 예약 생성에 idempotency key를 두지 않음 | 재시도해도 제약이 중복을 막음. 응답 유실 시 `ReservationConflict`가 나므로 내 예약 목록으로 확인 |

### 경합 방지 방식 비교

| 방식 | 장점 | 단점 | 판단 |
|---|---|---|---|
| Exclusion constraint | 우회 경로까지 차단, half-open 구간에 잘 맞음 | `btree_gist` 필요, 기존 겹침 정리 필요 | **추천** |
| 장비 행 잠금 또는 advisory lock | 구현이 단순함 | 모든 쓰기 경로가 규칙을 지켜야 함 | 탈락 |
| `SERIALIZABLE` | 범용적 | 모든 경로에 적용과 재시도 필요 | 탈락 |
| 프로세스 내 mutex | 의존성 없음 | DB 직접 수정이나 프로세스 증가 시 무력화 | 탈락 |
| 시간 슬롯 + unique index | 제약이 단순함 | 임의 구간을 표현하려면 구간 분할 필요 | 탈락 |

```sql
-- 예시. 실제 schema 미확인이라 컬럼명과 타입은 가정, 실행하지 않음
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE reservations
  ADD CONSTRAINT reservations_valid_interval CHECK (starts_at < ends_at),
  ADD CONSTRAINT reservations_no_overlap
    EXCLUDE USING gist (item_id WITH =, tstzrange(starts_at, ends_at, '[)') WITH &&)
    WHERE (status = 'confirmed');
```

구현 시 확인할 점입니다(모두 기억 기반, 미검증).
- **빈 구간:** 다른 구간과 겹치지 않는 것으로 처리되므로 `CHECK`가 반드시 필요합니다.
- **오류 코드:** 겹침은 SQLSTATE `23P01`입니다. 동시 삽입에서는 deadlock `40P01`도 날 수 있어, 횟수를 제한해 재시도합니다.
- **기존 데이터:** 겹침이 있으면 제약 추가가 실패합니다. 사전 점검이 필요하고(U-02), 추가 중에는 강한 잠금이 걸립니다.
- **버전:** `WITHOUT OVERLAPS`는 PostgreSQL 18 기능으로 기억하므로 17 기준 설계에서는 쓰지 않습니다.

## 5. 도메인 설계

### 5.1 불변식과 상태 전이

**불변식**
- `starts_at < ends_at`
- 같은 장비의 확정 예약은 구간이 겹치지 않음
- 끝과 시작이 맞닿은 구간 `[a,b)`, `[b,c)`는 충돌이 아님
- 장비당 `checkedOut` Loan은 최대 1건
- 반납 정정에는 항상 감사 기록이 남음

**Reservation**
- `없음 → confirmed → cancelled`
- `cancelled`는 종료 상태이고, 다시 쓰려면 새 예약을 만듭니다.
- 대출이 시작되면 `checked_out_at`만 기록하고 `confirmed`를 유지해 슬롯을 계속 점유합니다. 이후 취소는 거부합니다.

**Loan**
- `없음 → checkedOut → returned`
- `returned → checkedOut`은 Operator 정정으로만 가능합니다.
- `overdue`는 저장 상태가 아닌 계산값입니다. 경계 시각은 half-open과 맞춰 `now = dueAt`부터 연체로 봅니다(추천).
- 늦은 반납 이력은 `returnedAt > dueAt`로 계산합니다.

### 5.2 대표 사례

| 사례 | 기대 동작 |
|---|---|
| 8건이 같은 슬롯을 동시에 요청 | 1건 성공, 7건 `ReservationConflict` |
| `[10:00,11:00)`과 `[11:00,12:00)` | 둘 다 성공 |
| 취소 후 같은 슬롯 재예약 | 성공 |
| 이미 반납된 대출을 다시 반납 | `InvalidReturn` |
| 잘못된 반납을 되돌림 | `checkedOut` 복귀, 기한이 지났으면 곧바로 연체, 감사 기록 저장 |
| 되돌리려는 장비에 이미 다른 활성 Loan이 있음 | `InvalidReturn`, 변경 없음 |
| 다른 직원의 대출 조회 | 존재 여부를 숨기도록 404 |

### 5.3 모듈 계약

의존 방향은 `loans → reservations` 한 방향입니다. controller는 테이블을 직접 읽지 않고 공개 함수만 호출합니다.

| 모듈 | 계약 | 호출자와 권한 | 실패·트랜잭션 |
|---|---|---|---|
| reservations (`reservations` 소유) | `create(actor, itemId, interval)` | Employee (U-07) | `ReservationConflict`, 입력 오류. 단건 트랜잭션, 제한적 재시도 |
| | `cancel(actor, id)` | 소유자, Operator (U-07) | 대출 시작 후 거부. 이미 취소됐으면 같은 결과 반환 |
| | `listOwn(actor)`, `availability(itemId, range)` | Employee | `availability`는 예약자 정보 제외 (U-09) |
| | `markCheckedOut(tx, id)` | loans 전용 | 행을 잠그고 취소·중복 대출 여부 검증. 호출자 트랜잭션에 참여 |
| loans (`loans`, `loan_audit` 소유) | `checkOut(actor, ...)` | U-05, U-07 | `markCheckedOut`과 같은 트랜잭션. 활성 Loan 중복 거부 |
| | `returnLoan(actor, id, returnedAt)` | U-07 | 조건부 update가 0건이면 `InvalidReturn` |
| | `correctReturn(operator, id, correction, reason)` | Operator 전용 | 상태 변경과 감사 기록을 한 트랜잭션으로 처리 |
| | `listOwn(actor)`, `listOverdue(operator)` | 본인, Operator | 소유권 필터를 모듈 안에서 적용 |

감사 기록에는 대상, 수행자, 시각, 사유, 변경 전후 값을 담습니다.

### 5.4 오류 책임

- **도메인 모듈:** 오류의 의미를 정합니다. SQLSTATE를 도메인 오류로 바꾸는 일도 reservations와 loans가 맡습니다.
- **중앙 handler:** 분류를 HTTP 응답으로 변환하고, 안전한 공개 메시지와 로그, request ID를 관리합니다. 도메인 정책은 넣지 않습니다.
- **로그 전용:** `error.message`, stack, PostgreSQL `detail`은 응답에 넣지 않습니다. `detail`에는 충돌한 값이 담길 수 있습니다.

| 오류 | 소유 | 응답(추천) | 재시도 | 검증 |
|---|---|---|---|---|
| `ReservationConflict` | reservations | 409, 상대 정보 없음 | 다른 구간으로 재요청 | 8건 동시 요청 |
| `InvalidReturn` | loans | 409 | 상태 재조회 후 판단 | 이중 반납, 활성 Loan 충돌 정정 |
| 입력 오류 | 해당 모듈 | 400 | 수정 후 재요청 | 역전·빈 구간 |
| 권한 없음 | 인증 기반, 해당 모듈 | 401/403, 타인 자원은 404 | 불가 | 타인 대출 조회 |
| deadlock 재시도 소진 | reservations | 503 | 가능 | fault injection |
| 미분류 오류 | 중앙 handler | 500, 일반 메시지 + request ID | 불명 | 내부 메시지 미노출 확인 |

**공통 기반:** 인증과 actor 전달, request ID와 구조화 로그, 오류 기반 타입, 트랜잭션 helper, schema migration 방식이 필요합니다. 재시도는 소비자가 reservations뿐이므로 공통화하지 않습니다.

## 6. 기술 비교

| 후보 | 공식 근거·확인일 | 이점 | 비용·제약 | 판단 |
|---|---|---|---|---|
| **유지:** Express 5.1.0, PG 17, 기존 VM | 조회 불가 (2026-11-05) | D-02, D-03 충족, 재학습 없음, 추가 비용 없음 | 오류 handler와 경계를 직접 정리해야 함 | **추천** |
| Fastify, 같은 VM과 PG | 조회 불가 | 스키마 검증과 오류 hook이 내장되어 있음(기억) | route·middleware·테스트 재작성, 2인 재학습. 경합은 해결 못 함 | 비추천, 비교용 |
| 배포 플랫폼 변경 | 조회 불가 | 관리형 서비스나 자동 복구 가능성 | 클라우드형은 D-02 위반, 예산 증가 가능. 같은 VM의 container화는 이번 문제와 무관 | 제약 밖, 비교용 |

| 전환 비용 | 유지 + P-01 | Fastify | 플랫폼 변경 |
|---|---|---|---|
| 코드·API | 오류·경계 정리 | 추가로 HTTP 계층 재작성 | 설정 위주 |
| 데이터 migration | 제약 추가, 기존 겹침 정리 | 동일 | DB도 옮기면 이전 필요 |
| 테스트·교육 | 동시성 테스트 추가 | HTTP 테스트 재작성, 재학습 | 운영 절차 재교육 |
| 배포·rollback | 사전 백업, 제약 삭제로 복귀 | 전체 앱 교체와 복귀 | 인프라 복귀까지 필요 |

금액과 성능 차이는 미측정입니다. 응답시간 목표도 없으므로 성능은 Fastify 전환 근거가 되지 않습니다.

**추천이 바뀌는 조건**
- **Fastify:** 측정된 응답시간 목표를 Express가 충족하지 못하고 원인이 프레임워크로 확인되거나, Express 5 지원에 문제가 있는 경우
- **플랫폼 변경:** D-02가 바뀌거나, 기존 VM으로 D-10을 충족할 수 없는 경우
- **exclusion constraint 재검토:** `btree_gist`를 설치할 수 없는 경우. 이때는 차선으로 장비 행 잠금을 쓰고 모든 쓰기 경로를 강제합니다.

**공식 자료 재조사 항목** (아래 주소는 기억에 의존했고 접속하지 않았습니다)

| 확인할 내용 | 위치 |
|---|---|
| Node 22 지원 종료 일정. 2027년 4월 전후로 기억하므로 우선 확인 | https://nodejs.org/en/about/previous-releases |
| Express 5.1.0 이후 보안 패치, async 오류 전달 | https://expressjs.com/en/guide/error-handling.html |
| PG 17 지원 기간과 최신 minor | https://www.postgresql.org/support/versioning/ |
| exclusion constraint, `btree_gist`, SQLSTATE | https://www.postgresql.org/docs/17/ddl-constraints.html, `/docs/17/btree-gist.html`, `/docs/17/errcodes-appendix.html` |
| `pg` 8.16.3 동작 | https://node-postgres.com/ |
| Fastify 현재 버전과 지원 정책 | https://fastify.dev/docs/latest/ |

재개 조건은 웹 조회 도구입니다. 조회 결과가 위 기억과 다르면 P-01과 P-02의 근거를 다시 봐야 합니다.

## 7. 미정 사항

| ID | 미정 | 영향 | 선행 | 조건부 제안과 확인 방법 |
|---|---|---|---|---|
| U-01 | 응답시간 목표 | 성능 요구, Fastify 조건 | 없음 | 수치를 만들지 않음. 측정 후 결정 |
| **U-02** | 기존 겹침 예약 처리 | **제약 적용 차단** | 실제 DB 점검 | 겹침을 조회해 Operator가 건별 해결, 자동 취소 없음 |
| **U-03** | 연체로 장비가 안 돌아왔을 때 다음 예약 처리 | 핵심 실패 흐름 | U-05 | 예약은 유지, 대출 시작은 거부, Operator 목록에 표시. 자동 취소 없음 |
| U-04 | 연체 알림 필요 여부와 채널 | 스케줄러와 발송 기록 필요 여부 | 없음 | 우선 Operator 목록만. 알림이 필요하면 OS timer 등 추가 검토 |
| **U-05** | 예약 없는 대출 허용, `dueAt` 산정, 기한 연장 | Loan 계약 | 없음 | 예약 필수, `dueAt`은 예약 종료 시각, 연장은 이번 범위 제외 |
| **U-06** | 조기 반납과 no-show 시 슬롯 해제 | 가용성 | U-05 | 자동 해제 없음, 필요하면 Operator가 처리 |
| **U-07** | 대출·반납 등록 주체, 예약 취소 권한 | 권한 계약 | U-08 | 대출·반납은 Operator, 취소는 본인과 Operator |
| U-08 | 인증과 Operator 역할의 출처 | 공통 기반 | 코드 확인 | 기존 방식을 조사해 유지, 새 인증 도입 안 함 |
| U-09 | 다른 직원의 예약을 어디까지 볼지 | 조회 API, 개인정보 | 없음 | 점유 구간만 표시, 예약자는 숨김 |
| U-10 | 시간대, 슬롯 단위, 최대 기간, 과거 시작 허용 | 입력 검증 | 없음 | `timestamptz` 저장, 회사 시간대로 표시, 과거 시작 거부. 단위와 최대 기간은 DB에 넣지 않음 |
| U-11 | 백업 저장 위치, 암호화 키 담당자, 복구 담당자 | D-10 달성 가능성 | 없음 | VM과 분리해 저장. 같은 VM에만 두면 VM 장애 시 복구 불가 |
| U-12 | 예약, 대출, 감사 기록 보존 기간 | 저장량, 개인정보 | 사내 정책 | 정책 확인 전까지 삭제 기능 없음 |
| U-13 | 실제 schema, runtime minor, `btree_gist` 사용 가능 여부 | P-01 실행 가능성 | VM 접근 | `pg_available_extensions`와 컬럼 타입 확인 |
| U-14 | 정정 범위: 되돌림만인지, `returnedAt` 수정도 포함인지 | 정정 API | 없음 | 둘 다 허용, 사유 필수 |

**운영 영역 점검**
- **공개 가입:** 사내 전용이라 해당 없음
- **결제:** D-07로 제외
- **수평 확장:** D-01과 단일 프로세스 기준으로 불필요. 다만 P-01은 프로세스 수와 무관하게 동작합니다.
- **데이터 손실 범위:** 야간 백업만 있으면 최대 약 하루치 변경이 유실될 수 있습니다(추정). 복구 후 실물과 기록을 대조하는 절차를 spec에 넣어야 합니다.

## 8. 후속 spec 요구사항

**요구사항**
1. D-05를 DB 제약으로 강제하고(P-01), 기존 `SELECT` 사전 확인을 충돌 판단 근거에서 제외합니다.
2. migration 절차를 사전 백업, 겹침 점검(U-02), 제약 추가, rollback 순서로 정의합니다.
3. 5.3의 계약으로 controller의 직접 테이블 접근을 제거합니다.
4. 연체를 계산값으로 제공하고, 결제·벌금·자동 정지 경로가 없음을 명시합니다.
5. 반납 정정과 감사 기록을 원자적으로 처리합니다(U-14 반영).
6. 중앙 handler를 5.4 기준으로 교체합니다.
7. Employee 조회 범위를 D-09에 맞춰 제한합니다.
8. 야간 암호화 백업과 복구 절차를 D-10 기준으로 문서화합니다(U-11 반영).
9. 응답시간은 U-01로 남기고 수치를 넣지 않습니다.

**수용 시나리오**
- 실제 PostgreSQL 17에서 같은 슬롯 8건 동시 요청을 반복하면 매번 1건만 확정되고 나머지는 `ReservationConflict`이며, 500과 겹침 데이터가 없음
- 맞닿은 구간은 성공, 역전·빈 구간은 거부, 취소 후 재예약은 성공
- 앱을 거치지 않은 직접 `INSERT`도 겹치면 DB가 거부
- `dueAt` 직전과 당시 시각의 연체 판정, 반납 및 정정 후 연체 재계산
- 이중 반납은 `InvalidReturn`, 감사 기록 저장이 실패하면 정정도 함께 rollback
- 다른 직원 대출 조회는 404, 정정 API는 Employee에게 거부
- 미분류 오류 응답에 내부 메시지 없이 request ID만 포함
- 암호화 백업을 별도 환경에 복구해 제약과 `btree_gist`, 감사 기록이 유지되고, 소요 시간이 1 영업일 이내

## 9. 수행한 확인과 NOTRUN

**수행**
- fixture와 스킬 참조 문서를 읽고 코드 경로 4개의 부재를 확인했습니다.
- 파일 작성, 서비스 변경, tracker 게시는 하지 않았습니다.

**NOTRUN**
- 공식 자료 조회 (도구 없음)
- SQL 실행, 동시성·deadlock 테스트, 백업 복구 훈련 (DB 없음)
- 실제 코드, schema, lockfile, VM 확인 (미제공)
- `report.py` 대시보드 보고 (이 세션에 실행 도구 없음)

**남은 문제:** U-02, U-03, U-05~U-07은 답이 필요합니다. 답이 없으면 spec은 위 제안을 승인된 결정이 아닌 조건부 항목으로 표시해야 합니다.
