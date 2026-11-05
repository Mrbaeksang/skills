# 회의실 예약 도구 상세 명세

요청대로 답변으로만 작성했고, 파일 저장, 외부 게시, 구현은 하지 않았습니다. 대상 서비스의 경로가 입력에 없어 **기존 코드와 스키마는 확인하지 못했습니다**(O-07). 모듈과 스키마 설계는 실제 코드와 대조해야 하는 제안입니다.

**표기**
- **확정**: 입력 대화에서 결정된 사항(D-xx)
- **제안**: 에이전트의 제안으로, 사용자가 승인하지 않은 사항(P-xx)
- **미정**: 결정되지 않은 사항(O-xx)
- **조건부 AC**: 제안이나 미정 항목에 의존하는 수용 기준으로, 해당 항목이 바뀌면 함께 수정합니다.

## 1. 문제와 범위

**문제:** 같은 회의실의 시간 충돌과 재시도로 인한 중복 예약을 서버에서 막고, 권한과 오류를 일관되게 처리합니다.

**확정 결정**

| ID | 결정 |
|---|---|
| D-01 | 기존 Python 표준 라이브러리 HTTP 서비스와 SQLite를 유지하는 단일 프로세스 도구 |
| D-02 | 인증 adapter가 `user_id`, `role`(member/admin)을 제공하며, 로그인 구현은 범위 밖 |
| D-03 | 회원은 본인 예약을 생성·취소 |
| D-04 | 관리자는 모든 예약을 취소 가능 |
| D-05 | `room_id`, UTC start/end, `owner_id` 보관 |
| D-06 | start < end |
| D-07 | 같은 방의 active 예약은 겹칠 수 없음 |
| D-08 | cancelled는 재활성화하지 않음 |
| D-09 | 취소 재요청은 성공 no-op |
| D-10 | 존재하지 않는 예약은 404 |
| D-11 | 타인 예약 취소는 403이며 상태 유지 |
| D-12 | 충돌 생성은 409이며 기존 예약 보존 |
| D-13 | 예약 도메인이 Overlap/Forbidden/CannotTransition의 의미를 소유 |
| D-14 | 중앙 HTTP handler가 `code`/`message`/`trace_id`로 변환하고, 내부 SQL과 stack을 숨기며, 한 번 로깅 |
| D-15 | 저장소 장애는 503 retryable |
| D-16 | 요청 idempotency key로 재시도 중복 생성을 방지하며, key와 예약을 같은 transaction에 저장 |
| D-17 | 같은 key·같은 payload는 기존 결과, 같은 key·다른 payload는 409 |
| D-18 | 결제, 알림, microservices는 범위 밖 |
| D-19 | 성능 SLO와 보관 기간은 미정 |
| D-20 | API path와 ID 형식은 되돌릴 수 있는 제안으로 작성 가능 |

**비목표:** 로그인과 계정 관리, 결제, 알림, 서비스 분리(D-02, D-18), 그리고 입력에 없는 예약 수정, 반복 예약, 회의실 관리.

**Actors**

| Actor | 생성 | 본인 예약 취소 | 타인 예약 취소 |
|---|---|---|---|
| member | 허용, owner는 본인 | 허용 | 403 |
| admin | **미정**(O-03) | 허용 | 허용 |
| 인증 없음 | 거절(P-10) | 거절(P-10) | 거절(P-10) |

## 2. 도메인

**상태 전이**

| 전이 | 결과 | 근거 |
|---|---|---|
| (없음) → active | 생성 | D-03, D-07 |
| active → cancelled | 취소 | D-03, D-04 |
| cancelled → cancelled | 성공 no-op, 행 변경 없음 | D-09 |
| cancelled → active | `CannotTransition` | D-08, D-13 |

**불변식**
- start < end이다.
- `[start, end)` 구간이 겹치는 active 예약은 같은 방에 공존할 수 없다. 반열림 구간은 P-04의 제안이다.
- cancelled 예약은 겹침 판정에서 제외된다. 해당 시간대를 다시 예약하면 새 행이 생기고, 기존 행은 cancelled로 남는다.
- `room_id`, `start`, `end`, `owner_id`는 생성 후 변경 API가 없다.

**겹침 조건:** `existing.start < new.end AND new.start < existing.end AND existing.status = 'active'`

**소유 경계**

| 모듈(제안 명칭) | 책임 | 금지 |
|---|---|---|
| `reservation.domain` | 불변식, 권한·전이 판단, `Overlap`/`Forbidden`/`CannotTransition` 정의 | HTTP status, SQL, 로깅 |
| `reservation.application` | transaction 경계, idempotency 처리 순서, NotFound와 key 충돌 발생 | 응답 직렬화 |
| `reservation.store` | SQLite 접근, 저장소 오류를 `StorageUnavailable`로 변환 | 정책 판단 |
| `auth adapter` | 요청에서 `Principal(user_id, role)` 제공 | 예약 권한 판단 |
| `http.error_handler` | 예외 → 외부 응답 변환, `trace_id`, 단일 로깅 | 도메인 정책 결정 |

## 3. 요구사항

모두 확정 결정에서 나온 요구입니다. 세부 선택은 연결된 AC에 조건부로 표시했습니다.

| ID | 요구 | 근거 | AC |
|---|---|---|---|
| R-01 | 인증된 사용자가 본인 소유 예약을 생성한다. owner는 adapter의 `user_id`에서 정한다. | D-02, D-03, D-05 | AC-01, 30, 31, 33 |
| R-02 | UTC 시각과 start < end를 검증한다. | D-05, D-06 | AC-02, 03 |
| R-03 | 같은 방 active 예약의 겹침을 동시 요청에서도 막는다. | D-07, D-12 | AC-04~07 |
| R-04 | 소유자와 관리자만 취소할 수 있고, 없는 예약과 타인 예약 취소는 거절한다. | D-03, D-04, D-10, D-11 | AC-08, 09, 11~13 |
| R-05 | 재활성화는 없고, 취소 재요청은 no-op이다. | D-08, D-09 | AC-10, 14, 26 |
| R-06 | 도메인 오류의 의미를 도메인이 소유한다. | D-13 | AC-14, 15 |
| R-07 | 오류를 중앙에서 변환하고, 내부 정보를 숨기며, 한 번 로깅한다. | D-14 | AC-16~18 |
| R-08 | 저장소 장애를 503 retryable로 응답한다. | D-15 | AC-19, 32 |
| R-09 | key와 예약을 원자적으로 저장해 재시도 중복 생성을 막는다. | D-16 | AC-20~22, 25, 27~29, 34 |
| R-10 | 같은 key의 재요청을 payload 비교로 처리한다. | D-17 | AC-23, 24, 26 |
| R-11 | 표준 라이브러리, SQLite, 단일 프로세스 구조를 유지한다. | D-01 | AC-35 |

## 4. 제안 설계

| ID | 제안 | 이유와 대안 |
|---|---|---|
| P-01 | `POST /reservations`, `POST /reservations/{id}/cancel` | 취소는 행 삭제가 아니므로 `DELETE`를 쓰지 않음 |
| P-02 | ID는 `res_` + `uuid4().hex`이고, 형식이 다른 ID는 404 | 표준 라이브러리로 생성 가능 |
| P-03 | 시각은 `YYYY-MM-DDTHH:MM:SSZ`만 허용하고, `+09:00` 등은 400 | 고정 폭 문자열이라 SQLite에서 사전순 비교 가능. 대안은 offset을 받아 UTC로 정규화 |
| P-04 | 반열림 구간이며, `end == 다음 start`는 허용 | 연속 회의를 허용 |
| P-05 | `Idempotency-Key` header는 생성 시 필수이고, 1~128자 printable ASCII이며, 없으면 400 | 선택 사항이면 재시도 보호가 빠지는 경로가 생김 |
| P-06 | key 범위는 `(owner_id, key)` | 전역 범위면 다른 사용자의 key 존재가 노출됨 |
| P-07 | 첫 생성은 201, 재생은 200이며, 본문은 같은 예약의 **현재 상태** | 스냅샷 저장이 필요 없고 취소 사실을 숨기지 않음. 대안은 최초 응답 스냅샷 재생 |
| P-08 | 실패한 요청은 key를 소비하지 않음 | 예약과 key를 같은 transaction에 저장하는 결정과 정합적. 단, 실패 후 같은 key를 다른 payload로 보내면 새 요청으로 처리됨 |
| P-09 | 취소는 첫 요청과 no-op 모두 200이며, 본문은 예약 표현 | 클라이언트 처리를 단순화 |
| P-10 | 검증 실패 400, 인증 없음 또는 알 수 없는 role 401, 예상 외 오류 500(retryable 아님) | 입력에 없는 경로의 fail-closed 처리 |
| P-11 | 아래 오류 code 이름, 그리고 오류 본문에 `retryable` boolean 추가 | 확정된 3개 필드에 더하는 제안 |
| P-12 | 권한 확인을 no-op 판단보다 먼저 수행하므로, 타인의 cancelled 예약 취소는 403 | 다른 사용자가 상태를 알아내지 못함 |
| P-13 | `CannotTransition`은 409로 매핑 | 현재 공개 API로는 도달하지 않으며, 방어와 향후 경로를 위한 매핑 |
| P-14 | 아래 스키마, `BEGIN IMMEDIATE`, 요청별 connection | 조회와 쓰기 사이의 경쟁을 차단 |
| P-15 | 로그 필드와 레벨은 6장 참조 | 운영 추적용 |
| P-16 | 본문의 알 수 없는 필드는 400이며, `owner_id` 입력도 거절 | 소유자 위조를 차단 |

### API

**생성 요청**

```http
POST /reservations
Idempotency-Key: 8f1c-retry-001
Content-Type: application/json

{"room_id":"room-a","start":"2026-11-10T01:00:00Z","end":"2026-11-10T02:00:00Z"}
```

**성공 응답(생성, 재생, 취소 공통 형태)**

```json
{"id":"res_…","room_id":"room-a","start":"2026-11-10T01:00:00Z","end":"2026-11-10T02:00:00Z","owner_id":"u-1","status":"active"}
```

**오류 응답**

```json
{"code":"RESERVATION_OVERLAP","message":"The room is already reserved for this time.","trace_id":"…","retryable":false}
```

| 발생 위치 | 조건 | HTTP | code(제안) | retryable |
|---|---|---|---|---|
| domain `Overlap` | 겹침 | **409 확정** | `RESERVATION_OVERLAP` | false |
| domain `Forbidden` | 타인 예약 취소 | **403 확정** | `FORBIDDEN` | false |
| domain `CannotTransition` | 허용되지 않는 전이 | 409 제안 | `CANNOT_TRANSITION` | false |
| application | 예약 없음 | **404 확정** | `RESERVATION_NOT_FOUND` | false |
| application | 같은 key, 다른 payload | **409 확정** | `IDEMPOTENCY_KEY_CONFLICT` | false |
| store | 저장소 장애 | **503 확정** | `STORAGE_UNAVAILABLE` | **true 확정**(표현 방식은 제안) |
| http | 입력 오류 | 400 제안 | `VALIDATION_ERROR` | false |
| auth | 인증 없음 또는 잘못된 role | 401 제안 | `UNAUTHENTICATED` | false |
| http | 예상 외 오류 | 500 제안 | `INTERNAL_ERROR` | false |

### 저장 스키마(제안)

```sql
CREATE TABLE reservations (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  start_utc TEXT NOT NULL,
  end_utc TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active','cancelled')),
  created_at TEXT NOT NULL,
  cancelled_at TEXT,
  cancelled_by TEXT,
  CHECK (start_utc < end_utc)
);
CREATE INDEX ix_reservations_room_active
  ON reservations(room_id, start_utc) WHERE status = 'active';

CREATE TABLE idempotency_keys (
  owner_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  reservation_id TEXT NOT NULL REFERENCES reservations(id),
  created_at TEXT NOT NULL,
  PRIMARY KEY (owner_id, idempotency_key)
);
```

- `room_id`, `start`, `end`는 생성 후 변하지 않으므로, payload 비교는 별도 해시 없이 연결된 예약 행과 직접 비교합니다.
- `created_at`, `cancelled_at`, `cancelled_by`는 입력에 없는 감사용 제안입니다.
- 인덱스는 SLO 달성을 뜻하지 않습니다.
- 스키마가 불변식의 마지막 방어선이고, 겹침 방지는 `BEGIN IMMEDIATE`에 의존합니다. 대안인 SQLite trigger는 애플리케이션을 우회한 쓰기까지 막지만, 규칙이 도메인 밖에 중복되므로 채택하지 않았습니다.

## 5. Use case

### UC-1 예약 생성

1. 인증 → 입력·start < end 검증(실패 시 transaction 시작 전 거절)
2. `BEGIN IMMEDIATE`
3. `(owner_id, key)` 조회
   - 있고 payload 같음: 기존 예약 반환, **겹침 검사 생략**
   - 있고 payload 다름: `IDEMPOTENCY_KEY_CONFLICT`
4. 겹침 검사 → 겹치면 `Overlap`, rollback
5. 예약과 key를 INSERT → `COMMIT`
6. 응답

| 실패 지점 | 결과 | 복구 |
|---|---|---|
| 5단계 완료 전 저장소 장애 | 503, 예약과 key 모두 없음 | 같은 key로 재시도하면 1회 생성 |
| commit 성공 후 응답 유실 | 클라이언트는 결과를 모름 | 같은 key로 재시도하면 기존 결과 |
| commit 결과 불명 | 503 | 같은 key 재시도로 어느 쪽이든 예약은 최대 1개 |

**변경되지 않아야 할 데이터:** 어떤 실패에서도 기존 예약은 변경되지 않습니다.

### UC-2 예약 취소

1. 인증
2. `BEGIN IMMEDIATE`
3. 예약 조회 → 없으면 404
4. 도메인에서 권한 판단 → 거절 시 403
5. active면 cancelled로 변경, 이미 cancelled면 쓰기 없음
6. `COMMIT` → 200

취소는 자연히 멱등이므로 key가 필요 없습니다. 503 후에는 같은 요청을 재시도합니다.

## 6. 공통 책임

- **인증:** adapter 내부는 범위 밖입니다. 예약 권한 판단은 도메인이 합니다.
- **오류 변환:** handler는 예외 타입 → status·code·retryable 매핑 표만 소유합니다.
- **표준 라이브러리 주의:** `BaseHTTPRequestHandler.send_error`는 JSON 오류 형식을 따르지 않으므로, 모든 라우팅과 본문 파싱을 중앙 handler 안에서 처리하고 자체 JSON 응답을 씁니다.
- **로깅(확정: 요청당 오류 기록 1회):** 도메인, application, store는 오류를 로깅하지 않고 전파합니다. 기본 접근 로그를 유지하면 오류 기록으로 세지 않으며, 내부 상세를 넣지 않습니다.
- **로그 필드(P-15):** `trace_id`, `code`, status, method, route 패턴, `user_id`, 예외 타입을 남깁니다. 4xx는 INFO이고, 5xx는 ERROR에 stack을 포함합니다. 요청 본문과 key 원문은 남기지 않습니다.
- **trace_id:** 서버가 요청마다 `uuid4`로 생성합니다(제안).
- **저장소 오류 분류(제안):** `sqlite3.OperationalError`와 그 외 저장소 수준 `DatabaseError`는 503입니다. `ProgrammingError`와 예상 밖 `IntegrityError`는 코드 결함으로 보고 500입니다. `OperationalError`에는 "no such table" 같은 구성 오류도 포함되어 503으로 응답될 수 있는 한계가 있습니다.
- **Retry:** 서버는 SQLite busy timeout 외에 자체 재시도를 하지 않습니다. 재시도는 클라이언트가 같은 key로 수행합니다(제안). timeout은 설정값으로 두며 SLO가 아닙니다.

## 7. 운영 조건과 기술 선택

| 영역 | 내용 |
|---|---|
| 성능 | **미정**. 수치 목표나 부하 AC를 두지 않음(O-01) |
| 보관 | **미정**. 결정 전까지 cancelled 예약과 key를 삭제하지 않으며, 재생 보장은 key가 남아 있는 동안 유효(O-02) |
| 규모 | 단일 프로세스(확정). 다중 프로세스·다중 호스트 동작은 범위 밖 |
| 정보 노출 | 404와 403의 구분으로 예약 ID의 존재가 드러남. 확정 동작의 결과이며, ID를 추측하기 어렵게 해 완화(P-02) |
| 복구 | 백업·복원 요구는 입력에 없어 이 명세에서 제외 |
| 기술 | 기존 스택 유지(확정). 새 의존성과 공통 기반 선행 작업 없음. 대상 서비스의 Python 버전은 미확인 |

## 8. 수용 기준

- 모두 실제 HTTP 서버, 임시 SQLite 파일, 스텁 인증 adapter를 사용한 통합 검증입니다(도메인 표시 항목은 단위 검증).
- "행 불변"은 요청 전후 SQLite 행을 직접 읽어 비교합니다. 조회 API가 미정이기 때문입니다(O-04).
- **확정** 표시는 status, 데이터 결과 등 확정된 동작에 대한 판정이며, 요청 경로와 ID 형식(P-01, P-02) 및 code 이름(P-11)은 교체할 수 있습니다.

| AC | 입력 | 관찰 결과 | 상태 |
|---|---|---|---|
| AC-01 | member의 유효한 생성 요청 | 2xx(201은 제안). `owner_id`가 adapter의 `user_id`이고 active. 예약 1행, key 1행 | 조건부 P-05, P-09 |
| AC-02 | start = end, start > end | 거절, 행 추가 없음(400은 제안) | 확정 + P-10 |
| AC-03 | `+09:00`, 잘못된 날짜, 비정규 형식 | 400, 행 추가 없음 | 조건부 P-03 |
| AC-04 | 부분 겹침, 포함, 피포함, 동일 구간 | 409, 기존 행 불변, 새 행 없음 | 확정 |
| AC-05 | 다른 방의 같은 시간 / 같은 방의 맞닿은 구간 | 전자 성공(확정) / 후자 성공(P-04) | 일부 조건부 |
| AC-06 | 취소된 구간에 새 예약 | 성공, 새 ID, 기존 행은 cancelled 유지 | 확정 |
| AC-07 | 같은 구간을 서로 다른 key로 동시 요청(테스트 파라미터 N, 충분한 timeout) | 성공 1건, 나머지 409, active 1행 | 확정 |
| AC-08 | 소유자가 취소 | 성공, cancelled | 확정(200은 P-09) |
| AC-09 | admin이 타인 예약 취소 | 성공, cancelled, `owner_id` 불변 | 확정(200은 P-09) |
| AC-10 | cancelled 예약을 소유자·admin이 재취소, 동시 취소 | 모두 성공, 재취소 시 행 불변 | 확정 |
| AC-11 | 없는 ID 취소 | 404, `code`/`message`/`trace_id`, 행 변경 없음 | 확정 |
| AC-12 | 타인 member가 active 예약 취소 | 403, 행 불변 | 확정 |
| AC-13 | 타인 member가 cancelled 예약 취소 | 403, 행 불변 | 조건부 P-12 |
| AC-14 | 도메인 단위: cancelled → active 시도 | `CannotTransition`. 공개 경로로 cancelled 행이 active가 되는 흐름 없음(AC-06, 10, 26으로 확인) | 확정 |
| AC-15 | 도메인 단위: HTTP와 SQLite 없이 겹침, 타인 취소, 금지 전이 실행 | `Overlap`/`Forbidden`/`CannotTransition`이 발생하며 HTTP status를 담지 않음 | 확정 |
| AC-16 | 400, 401, 403, 404, 409, 500, 503 각각 유발 | 모두 JSON이고 비어 있지 않은 `code`, `message`, `trace_id` 포함 | 확정(400, 401, 500은 P-10) |
| AC-17 | SQL 문과 경로를 담은 예외 주입 | 응답에 SQL, `Traceback`, 파일 경로 없음 | 확정 |
| AC-18 | AC-16의 각 오류 | 응답의 `trace_id`를 가진 오류 로그가 정확히 1건 | 확정(필드와 레벨은 P-15) |
| AC-19 | 다른 connection이 DB를 잠근 상태에서 생성(짧은 timeout) | 503, retryable 표시, 행 추가 없음 | 확정(표현은 P-11) |
| AC-20 | AC-19 후 잠금 해제, 같은 key 재시도 | 성공, 예약 1행 | 확정 |
| AC-21 | commit 후 응답 유실을 모사하고 같은 key로 재시도 | 같은 ID, 예약 1행 | 확정 |
| AC-22 | 예약 INSERT와 commit 사이에 장애 주입 | 503, 예약과 key 모두 0행 | 확정 |
| AC-23 | 같은 key, 같은 payload 재요청 | 같은 ID, 행 추가 없음(200은 제안) | 확정 + P-07 |
| AC-24 | 같은 key에 `room_id`, `start`, `end`를 각각 변경 | 409, 원래 예약 불변, 행 추가 없음 | 확정 |
| AC-25 | 같은 key, 같은 payload 동시 요청 | 모두 성공, 같은 ID, 예약 1행 | 확정 |
| AC-26 | 생성 → 취소 → 같은 key 재요청 | 같은 ID, 재활성화 없음, 행 추가 없음(본문 `cancelled`는 제안) | 확정 + P-07 |
| AC-27 | key 없는 생성 | 400, 행 추가 없음 | 조건부 P-05 |
| AC-28 | 다른 사용자가 같은 key 사용 | 독립 처리, 각자 예약 생성 | 조건부 P-06 |
| AC-29 | key K가 409로 실패 → 기존 예약 취소 → K 재시도 | 성공 | 조건부 P-08 |
| AC-30 | 인증 없음, 알 수 없는 role | 401, 행 변화 없음 | 조건부 P-10 |
| AC-31 | 본문에 타인 `owner_id` 포함 | 400, 행 추가 없음 | 조건부 P-16 |
| AC-32 | DB 잠금 중 취소 후 해제하고 재시도 | 503, 상태 유지 → 재시도 성공 | 확정 |
| AC-33 | admin이 생성 | O-03 결정에 따름 | 미정 |
| AC-34 | 프로세스 재시작 후 같은 key 재요청 | 같은 ID, 행 추가 없음 | 확정 |
| AC-35 | 추가 패키지가 없는 환경에서 단일 프로세스로 위 흐름 실행 | 정상 동작 | 확정 |

## 9. 미정 항목

어느 항목도 명세 작성을 막지는 않았습니다.

| ID | 미정 사항 | 영향 | 결정 전 처리 | 결정 주체 / 재개 조건 |
|---|---|---|---|---|
| O-01 | 성능 SLO | 인덱스, timeout, 부하 AC | 수치 AC 없음 | 사용자 / 목표 수치 제시 |
| O-02 | 예약·key 보관 기간 | 재생 보장 기간, 저장 용량 | 삭제 미구현 | 사용자 / 기간 결정 |
| O-03 | admin의 생성 가능 여부 | R-01, AC-33 | 제안: admin도 본인 owner로만 생성, 대리 생성 불가 | 사용자 |
| O-04 | 조회 API 필요 여부 | 외부 계약 | 명세에 포함하지 않음 | 사용자 |
| O-05 | `room_id` 유효성(회의실 목록 존재 여부) | 입력 검증, 새 오류 | 비어 있지 않은 opaque 문자열로 처리 | 사용자 / 목록의 소유자 확인 |
| O-06 | 과거 시각 예약, 시작 후 취소, 최대 길이 | R-02, R-04 | 추가 제한 없음 | 사용자 |
| O-07 | 기존 코드, 스키마, 기존 겹침 데이터, Python 버전 | 마이그레이션, 모듈 구조 | 구현 전에 확인 필요 | 구현자 / 서비스 경로 제공 |

## 10. 추적 점검

| 결정 | 반영 위치 |
|---|---|
| D-01 | R-11, AC-35 |
| D-02 | R-01, AC-01, 30 |
| D-03 | R-01, R-04, AC-01, 08, 12 |
| D-04 | R-04, AC-09, 10 |
| D-05 | R-01, R-02, AC-01, 03 |
| D-06 | R-02, AC-02 |
| D-07 | R-03, AC-04~07 |
| D-08 | R-05, AC-06, 14, 26 |
| D-09 | R-05, AC-10 |
| D-10 | R-04, AC-11 |
| D-11 | R-04, AC-12 |
| D-12 | R-03, AC-04 |
| D-13 | R-06, AC-14, 15 |
| D-14 | R-07, AC-16~18 |
| D-15 | R-08, AC-19, 32 |
| D-16 | R-09, AC-20~22, 25, 34 |
| D-17 | R-10, AC-23, 24 |
| D-18 | 1장 비목표 |
| D-19 | 7장, O-01, O-02 |
| D-20 | P-01, P-02 |

## 검증 상태

- **수행:** 입력 결정 20건을 요구, 비목표, 미정 항목에 수동으로 대조했습니다. 스킬의 공통 계약과 명세 계약도 읽었습니다.
- **NOTRUN:** AC-01~35 전체. 제품이 구현되지 않았으므로 명세 완료가 구현 완료를 뜻하지 않습니다.
- **NOTRUN:** 기존 서비스 코드 대조(O-07), SQLite 동작 실측. `BEGIN IMMEDIATE`와 오류 분류는 이번 세션에서 실행해 확인하지 않은 설계 판단입니다.
- **미수행:** 대시보드 `report.py` 보고. 이번 세션에 실행 도구가 없어 보내지 못했습니다.
