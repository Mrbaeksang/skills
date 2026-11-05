공식 자료 확인을 마쳐서 결정 기록을 정리해 드립니다.

# 장비 대여 서비스 Shape 결정 기록

**결론: 현재 stack(Express 5·PostgreSQL 17·단일 VM)을 유지하고, 예약 경합은 PostgreSQL exclusion constraint로 막기를 추천합니다.** Fastify 전환이나 배포 플랫폼 변경으로는 예약 경합과 오류 응답 결함이 해결되지 않습니다.

**전체 설계는 아직 확정이 아닙니다.** 연체 물품의 다음 예약 처리(U-02)와 Loan-Reservation 연결(U-03)이 제품 동작을 바꾸기 때문입니다. 이 둘은 spec에 조건부 요구로 남겨야 합니다.

추가로 확인한 사항은 두 가지입니다.
- **Express:** 고정된 5.1.0은 5.x 최신이 아닙니다. 지원 대상은 메이저 라인의 최신 버전이며, 현재 latest는 5.3.0입니다.
- **Node.js:** Node 22 지원은 2027-04-30에 끝납니다.

## 1. 범위와 전제

- **범위:** 예약 충돌, 반납 지연(연체), 잘못된 반납의 정정, 그에 필요한 모듈 경계와 오류 책임, 관련 복구 조건.
- **비목표:** 결제·벌금·자동 이용 정지, cloud 이전, 실제 서비스·DB 변경, tracker 게시.
- **actors:** 직원, 운영자, 유지보수자 2명.
- **확인한 자료:** `fixture-context.md`와 그 안의 코드 발췌만 봤습니다. 발췌에 없는 실제 schema, lockfile, 인증 구현, 프로세스 관리 방식은 확인하지 못했습니다.

## 2. 확정 결정 (출처: fixture)

| ID | 결정 | 영향 |
|---|---|---|
| D-01 | 사내 직원 전용, 80명, 동시 예약 시도 최대 8건 | 동시성 검증 |
| D-02 | 유지보수자 2명, 기존 Linux VM 1대, 운영 예산 동결, cloud 이전 없음 | 기술 후보 제한 |
| D-03 | 현재 구성은 Node.js 22, Express 5.1.0, `pg` 8.16.3, PostgreSQL 17, 단일 프로세스 | 기준안 |
| D-04 | Reservation 1건은 장비 1개와 half-open 구간 1개 | 데이터 모델 |
| D-05 | Confirmed 예약은 장비별로 겹치면 안 되고, Cancelled는 구간을 해제함 | reservations 불변식 |
| D-06 | 기한을 넘으면 Loan은 overdue이며, 결제·벌금·자동 정지는 없음 | loans |
| D-07 | 운영자는 잘못된 반납을 audit trail과 함께 정정할 수 있음 | loans, 감사 |
| D-08 | 직원은 자기 Loan만 볼 수 있음 | 권한 |
| D-09 | 복구 목표 1영업일, 야간 암호화 백업 승인 | 운영 |
| D-10 | 설계만 수행하며 Fastify·플랫폼 변경은 비교용이고 요청된 migration이 아님 | 범위 |
| D-11 | 용어: Reservation은 약속된 미래 구간, Loan은 실제 보관. `ReservationConflict`는 reservations 소유, `InvalidReturn`은 loans 소유 | 용어·오류 |

## 3. 에이전트 제안 (미승인, 되돌릴 수 있음)

| ID | 제안 | 이유 |
|---|---|---|
| P-01 | Confirmed 비중첩을 exclusion constraint로 강제 | 모든 쓰기 경로에 적용되며 SELECT 후 INSERT 경합을 없앰 |
| P-02 | 예약 생성은 단일 INSERT로 하고 SELECT는 가용성 표시 전용으로 축소 | 판정 기준을 DB 하나로 통일 |
| P-03 | overdue를 저장하지 않고 `checkedOut AND now() >= dueAt`로 계산 | 배치 누락이 없고 반납 정정 시 자동으로 맞음 |
| P-04 | 장비별 활성 Loan 1건을 partial unique index로 강제 | 실제 보관의 물리 제약. fixture에 명시되지 않아 제안으로 둠 |
| P-05 | 도메인 오류 분류와 중앙 handler 도입 | 현재는 모든 오류가 500과 `error.message`로 나감 |
| P-06 | controller의 타 모듈 테이블 직접 접근 제거 | modular monolith 경계 확보 |
| P-07 | 정정과 audit 기록을 같은 transaction으로 처리 | 기록 없는 정정 방지 |
| P-08 | Express를 5.3.x로 올리는 일은 별도 의존성 작업으로 분리 | 동작 변경이 있어 설계 변경과 섞지 않음 |

### 제약 초안 (P-01)

컬럼명과 상태값은 예시입니다. 실제 schema를 받지 못했고 실행도 하지 않았습니다.

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE reservations
  ALTER COLUMN starts_at SET NOT NULL,
  ALTER COLUMN ends_at SET NOT NULL,
  ADD CONSTRAINT reservations_valid_interval CHECK (starts_at < ends_at),
  ADD CONSTRAINT reservations_no_confirmed_overlap
    EXCLUDE USING gist (item_id WITH =, (tstzrange(starts_at, ends_at, '[)')) WITH &&)
    WHERE (status = 'confirmed');
```

- **NOT NULL과 CHECK가 필요한 이유:** NULL 경계는 무한 구간이 되고, 같은 시각을 양끝으로 둔 구간은 비어 있어 충돌 판정을 피해 갑니다.
- **Deadlock 처리:** 같은 구간을 동시에 INSERT하면 두 세션이 서로를 기다리다 한쪽이 `40P01`로 중단될 수 있습니다. 탐지 전 대기 기본값은 1초입니다. 재시도 후에는 대개 `23P01`이 되어 `ReservationConflict`로 응답할 수 있으므로, 제한된 재시도가 필요합니다.
- **기존 데이터:** 경합 코드로 이미 겹친 행이 있으면 제약 추가가 실패합니다. 사전 조회가 필수입니다(U-01).
- **잠금:** 제약 추가에는 `ACCESS EXCLUSIVE` 잠금이 필요하고 `NOT VALID`는 쓸 수 없습니다. 짧은 점검 창을 잡아야 하며 소요 시간은 미측정입니다.
- **배포 순서:** 오류 handler를 먼저 배포합니다. 순서가 바뀌면 충돌이 500으로 노출되고 제약 이름이 담긴 메시지까지 함께 나갑니다.

## 4. 도메인 모델

**불변식**
- I-1: 같은 장비의 Confirmed 예약은 구간이 겹치지 않습니다. 맞닿은 구간(`[10,12)`, `[12,14)`)은 허용합니다.
- I-2 (제안): 장비별 활성 Loan은 최대 1건입니다.
- I-3 (제안): 반납 정정마다 감사 기록이 정확히 1건 남습니다.

**상태 전이**

```text
Reservation: 생성 -> Confirmed -> Cancelled
             Cancelled의 복원은 새 예약으로 처리 (제안)

Loan:        checkOut -> checkedOut -> returned
             returned -> checkedOut   운영자 정정: 반납 취소
             returned -> returned     운영자 정정: 반납 시각 수정

overdue:     상태가 아닌 계산값. 기한 이후 반납 여부도 returned_at > dueAt로 계산
```

### overdue 구현 비교

| 후보 | 장점 | 비용 | 판단 |
|---|---|---|---|
| 조회 시 계산 | 스케줄러가 필요 없고 정정 시 자동으로 맞음 | 알림은 할 수 없음 | **추천** |
| 주기 작업으로 저장 | 알림 발송 시점을 확보 | 누락·재실행·정정 시 재계산 처리 필요 | U-04가 "알림 필요"일 때 알림 기록용으로만 추가 |

### 모듈 계약

| 공개 계약 | 호출자·권한 | 결과·실패 | 트랜잭션 |
|---|---|---|---|
| `reservations.create(actor, itemId, interval)` | 직원 본인 | Reservation 또는 `ReservationConflict` | INSERT 1건 |
| `reservations.cancel(actor, id)` | 본인 또는 운영자 (U-05) | 이미 Cancelled면 같은 결과 반환 | UPDATE 1건 |
| `reservations.availability(itemId, range)` | 로그인 사용자 | 점유 구간만 반환, 예약자 비공개 (U-05) | 읽기 |
| `loans.checkOut(actor, ...)` | U-05 | I-2 위반 시 `InvalidCheckOut` | 단일 client |
| `loans.returnLoan(actor, loanId, ...)` | U-05 | 조건부 UPDATE가 0행이면 `InvalidReturn` | 단일 client |
| `loans.correctReturn(operator, loanId, correction, reason)` | 운영자 | I-2 위반이나 잘못된 시각이면 `InvalidReturn` | 상태 변경과 audit를 함께 |
| `loans.listMine(actor)` | 직원 본인 | overdue 계산값 포함 | 읽기 |
| `loans.listOverdue(operator)` | 운영자 | 다른 직원 정보는 운영자에게만 노출 | 읽기 |

- 각 모듈의 테이블은 소유 모듈만 접근하고, controller는 공개 계약만 호출합니다.
- 장비 테이블의 소유 모듈은 발췌에 없어 U-12로 남깁니다.
- `pg` 공식 문서는 transaction에 `pool.query`를 쓰지 말라고 경고하므로, 여러 문장 transaction은 단일 client로 수행합니다.

### 오류 책임

중앙 handler는 도메인 오류를 HTTP 응답으로 바꾸고, 안전한 메시지와 `requestId`, 서버 로그를 관리합니다. 충돌 판단 같은 도메인 정책은 각 모듈이 소유합니다. HTTP 상태 코드와 응답 형식은 제안입니다.

| 오류 | 소유 | 외부 응답 | 재시도·중복 방지 | 검증 |
|---|---|---|---|---|
| `ReservationConflict` (`23P01`) | reservations | 409, 예약자·DB 상세 비노출 | 같은 요청 재시도 무의미. 응답 유실 후 재시도는 409가 되므로 내 예약을 재조회 | AC-1, AC-3 |
| 구간 입력 오류 | reservations | 400 | 수정 후 재요청 | AC-2 |
| `40P01` | reservations 내부 | 제한된 재시도 후 503 | 단일 INSERT만 재시도 | AC-1 |
| `InvalidReturn` | loans | 409 | 중복 반납은 상태 불변 | AC-6, AC-8 |
| 타인 Loan 접근 | loans | 404 (존재 여부 비노출) | 해당 없음 | AC-9 |
| 운영자 권한 없음 | 인증 기반 + loans | 403 | 해당 없음 | AC-8 |
| 미분류 오류 | 중앙 handler | 500, 일반 메시지 + `requestId` | 로그에만 상세 기록 | AC-10 |

응답이 이미 시작됐다면 Express 문서대로 `next(err)`로 기본 handler에 넘깁니다. Express 5는 async handler의 rejection을 자동 전달하므로 별도 wrapper가 필요 없습니다.

## 5. 기술 비교 (조사일 2026-11-05)

### 경합 방지

| 후보 | 공식 근거 | 이점 | 비용·제약 | 판단 |
|---|---|---|---|---|
| Exclusion constraint + `btree_gist` | S1, S2, S3, S4 | DB가 모든 경로에서 강제, 부분 조건으로 Cancelled 제외, trusted extension | 데이터 정리, 잠금, deadlock 처리 | **추천** |
| SERIALIZABLE + 재시도 | S5 | schema 변경이 적음 | 모든 경로에 규약과 `40001` 재시도 필요, 우회 쓰기를 못 막음 | 제약 도입이 불가능할 때만 |
| 장비 행 잠금 | 기존 지식, 공식 근거 미조회 | 구현이 단순 | 모든 쓰기 경로의 규약에 의존 | 비추천 |
| 프로세스 내 mutex | 근거 불필요 | 코드만 변경 | 프로세스가 늘거나 SQL을 직접 실행하면 깨짐 | 탈락 |
| PostgreSQL 18 `WITHOUT OVERLAPS` | S6 | 선언이 간결 | 메이저 업그레이드 필요, `WHERE`가 없어 Cancelled 행을 제외할 수 없음 | 탈락 |

### 프레임워크

| 후보 | 공식 근거 | 이점 | 비용·제약 | 판단 |
|---|---|---|---|---|
| Express 유지 (5.1.0, 최신 5.3.0) | S7, S8, S9, S10 | 코드·교육 비용 최소, async 오류 전달 지원 | 입력 검증은 별도 구성 | **추천** |
| Fastify 5 (5.12.8) | S11, S12, S13 | JSON Schema 검증과 응답 직렬화 내장, LTS 표에 Node 22 포함 | 아래 전환 비용 참고, LTS 표에 Node 24 미기재 | 현재 비추천 |

Fastify도 기본 500 응답에 원본 오류 메시지를 담으므로 custom handler가 똑같이 필요합니다. 예약 경합은 프레임워크와 무관합니다.

**Fastify 전환 비용 (금액·성능 효과는 미측정)**
- **코드/API:** route, middleware, 오류 처리 재작성, 오류 형식 호환 확인.
- **데이터:** 변경 없음.
- **테스트/교육:** HTTP 테스트 재검증, 유지보수자 2명 학습.
- **배포/rollback:** 이전 빌드로 되돌리면 되지만 전환 기간에 두 구현을 유지해야 할 수 있음.

**선택이 달라지는 조건:** 입력 검증 결함이나 처리량 문제가 측정으로 확인되고, 그것이 범위 안의 우선 과제가 될 때.

### 배포

| 후보 | 공식 근거 | 이점 | 비용·제약 | 판단 |
|---|---|---|---|---|
| 기존 VM·단일 프로세스 유지 | D-02 | 추가 비용과 학습 없음, 이번 설계에 충분 | 프로세스 재시작 구성 미확인. 없다면 systemd `Restart=on-failure` 검토 (S14) | **추천** |
| 같은 VM에서 Docker Compose | S15, S16 | 이미지 재현성, 재시작 정책 | 기본 root daemon의 보안 관리, 배포·백업 절차 변경 | 환경 재현 문제가 실제로 있을 때 |
| Managed PaaS·cloud·Kubernetes | D-02 | 인프라 관리 위임 가능 | cloud 이전 금지·예산 동결 위배 | 제약 밖 탈락 |

P-01은 프로세스 수와 무관하게 유효하므로 나중에 배포 방식을 바꿔도 다시 설계할 필요가 없습니다.

### 버전 지원 상태

| 구성 | 사용 버전 | 확인 내용 | 조치 |
|---|---|---|---|
| Node.js | 22 | Maintenance, 종료 2027-04-30. Node 24는 2028-04-30, Node 26은 2029-04-30 | 종료 전 계획 필요 (U-13) |
| PostgreSQL | 17 (minor 미상) | 지원 종료 2029-11-08, 확인 시점 최신 minor 표기 17.11 | 유지 |
| Express | 5.1.0 | latest 5.3.0, 최신 버전만 지원. 5.3.0 노트에 `qs`, `proxy-addr`, `body-parser` CVE 수정 포함 | P-08 |
| `pg` | 8.16.3 | latest 8.23.1 | 필수 아님 |

- lockfile이 없어 실제로 설치된 하위 의존성이 해당 CVE에 영향을 받는지는 판단하지 못했습니다.
- 5.3.0 노트에는 `Content-Disposition` 표기, 잘못된 `limit` 값 처리, 기본 handler 로그 형식의 변화가 있어 회귀 테스트가 필요합니다.

## 6. 운영과 복구

- **백업:** `pg_dump`는 시작 시점의 일관된 snapshot을 만들고, 배타 잠금이 필요한 작업 외에는 다른 작업을 막지 않습니다.
- **복구 절차 제안:** `template0`에서 DB를 만들고 `psql -X -1`로 전체 성공 또는 전체 롤백 방식으로 복원합니다.
- **복구 훈련:** 1영업일 안에 끝나는지, `btree_gist`와 제약이 복원되는지, 겹침이 0건인지, audit 행이 보존되는지 확인합니다.
- **백업의 한계 (추론):** 야간 백업만 쓰면 최대 약 하루치 변경을 잃을 수 있습니다. 허용 여부는 아직 승인되지 않았습니다(U-09).
- **관련 없는 영역:** 공개 가입과 외부 사용자 보안은 사내 전용(D-01)이라 다루지 않습니다.

## 7. 미정 사항

답이 오기 전까지는 어느 것도 결정이 아닙니다. 추천은 답변 기본값이 아니라 제안입니다.

### 답변 요청 1차 (서로 독립)

| ID | 질문 | 영향 | 추천 | 대안과 바뀌는 조건 |
|---|---|---|---|---|
| U-03 | Loan은 반드시 Reservation에서 시작하는가? `dueAt`은 예약 종료와 같은가? 연장을 허용하는가? | 모듈 계약, U-02, U-06 | 연결은 선택, `dueAt` 기본값은 예약 종료, 연장은 다음 예약과 겹치지 않을 때만 | 예약 없는 대여가 금지라면 연결 필수 |
| U-04 | overdue 알림이 필요한가? | P-03 | 1차는 운영자 목록과 직원 본인 화면만 | 알림이 필요하면 채널과 주기 작업 추가 |
| U-05 | 인증 방식과 운영자 역할의 출처는? 대여·반납 처리자는? 직원에게 타인 예약을 어디까지 보여주는가? | 권한, audit의 actor | 운영자가 처리, 직원에게는 예약자 없는 점유 구간만 | 셀프 대여라면 현장 확인 절차 추가 |
| U-01 | 기존 겹침 데이터는 누가 어떤 기준으로 정리하는가? | 제약 배포 | 발견 시 배포 중단, 운영자가 사유를 기록하며 수동 정리 | 겹침 0건이면 불필요 |
| U-09 | 허용 데이터 손실, 백업 저장 위치, 키 담당자는? | 복구 | 야간 백업 유지, VM 외부 보관 | 하루치 손실이 불가하면 WAL archiving 검토 (S17) |

### 답변 요청 2차 (U-03 이후)

| ID | 질문 | 추천 | 대안과 바뀌는 조건 |
|---|---|---|---|
| U-02 | 연체로 다음 예약 시작 시 장비가 없으면 어떻게 하는가? | 자동 취소 없이 해당 대여를 차단하고 운영자가 조정 | 대체 장비가 있으면 교체 흐름, 자동 취소는 정책이 승인될 때만 |
| U-06 | 시작 후 취소를 허용하는가? 조기 반납 시 남은 구간을 해제하는가? | 대여 전까지만 취소, 조기 반납은 자동 해제 안 함 | 장비 회전율이 중요하면 조기 반납 시 예약 종료 단축 |

### 코드·환경 확인으로 해결

| ID | 항목 | 확인 방법 |
|---|---|---|
| U-07 | 기존 클라이언트의 오류 형식 의존 여부 | 클라이언트 코드 조사 |
| U-08 | 데이터 보존 기간과 현재 데이터량 | 운영 담당자 확인, 집계 쿼리 |
| U-10 | 응답시간 목표: fixture대로 **미정 유지**, 수치를 만들지 않음 | 필요 시 측정 후 결정 |
| U-11 | 표시 time zone과 "영업일" 정의 | 조직 기준 확인 |
| U-12 | 실제 schema, 장비 ID 타입, 장비 테이블 소유, 프로세스 관리 방식, PostgreSQL minor, lockfile | 저장소와 VM 확인 |
| U-13 | Node 22 종료(2027-04-30) 전 업그레이드 시기 | 유지보수자 일정 결정 |

## 8. 후속 spec에 넣을 내용

### 공통 기반 (의존 순서)
1. 도메인 오류 분류와 중앙 handler, `requestId`, 안전한 로그.
2. 인증·역할 정보 전달(U-05 의존).
3. Controller 경계 정리와 모듈 공개 계약.
4. 겹침 사전 조회, 정리(U-01), 제약 추가.
5. Loan 정정과 audit.
6. 복구 훈련 절차.

### 수용 시나리오

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| AC-1 | 같은 장비·같은 구간에 8건 동시 요청 | 1건 성공, 7건 `ReservationConflict`, 500 없음, DB에 Confirmed 1건 |
| AC-2 | 맞닿은 구간 / 시작 ≥ 종료 구간 | 앞은 성공 / 뒤는 400 |
| AC-3 | 충돌 응답 검사 | 제약 이름, SQL 상세, 타인 정보 없음 |
| AC-4 | 예약 취소 후 같은 구간 재예약 | 성공 |
| AC-5 | 앱을 거치지 않고 겹치는 Confirmed 행을 직접 삽입 또는 수정 | DB가 거부 (`23P01`) |
| AC-6 | 같은 Loan을 두 번 반납 | 두 번째는 `InvalidReturn`, 상태 불변 |
| AC-7 | 기한 직전 / 기한 시각 / 기한 이후 반납 전 Loan 조회 | 직전은 overdue 아님, 나머지는 overdue, 벌금·정지 부작용 없음 |
| AC-8 | 운영자가 반납 취소 / 일반 직원이 시도 / 해당 장비가 이미 재대여됨 | 상태와 audit 함께 반영 / 403 / `InvalidReturn`이고 audit 없음 |
| AC-9 | 직원이 타인 Loan을 조회 | 404, 목록에도 없음 |
| AC-10 | 예상 못 한 오류 발생 | 500 일반 메시지와 `requestId`, 상세는 서버 로그에만 |
| AC-11 | audit 기록 실패를 주입 | 정정 전체 롤백 |
| AC-12 | 백업을 새 DB로 복원 | 1영업일 내 완료, 제약·audit 보존, AC-1 재통과 |
| AC-13 | U-02 답변 후 연체 장비의 다음 예약 처리 | 답변에 따라 작성. 그전까지 **차단 항목** |

## 9. 검증과 남은 문제

**수행한 것**
- 스킬 참조 문서 2개(`execution-contract.md`, `technology.md`)와 `fixture-context.md`를 읽었습니다.
- 공식 문서, npm registry, GitHub release와 소스를 조회했습니다.
- 실제 서비스 변경, 파일 작성, tracker 게시는 하지 않았습니다.

**NOTRUN**
- SQL 실행, 동시성 시험, 복구 훈련: DB가 없고 이 세션에 shell도 없습니다.
- 실제 앱 코드와 schema 검사: fixture 발췌만 제공됐습니다.
- 위 수용 시나리오 전체: 설계 단계의 요구이며 실행하지 않았습니다.
- 대시보드 진행 보고(`report.py`): shell이 없어 실행하지 못했습니다.

**조사 한계**
- 웹 문서는 요약 도구를 거쳐 읽었으므로 spec에 인용하기 전에 원문을 확인해야 합니다.
- `pg`의 `code`, `constraint` 필드는 8.16.3이 아니라 `master` 소스에서 확인했으니 AC-1, AC-3으로 실제 버전에서 검증해야 합니다.
- npm 웹페이지는 403이어서 registry API를 사용했습니다.
- Express 5.3.0 릴리스 페이지에는 연도가 없어(`09 Oct`) 2026년은 추정입니다.
- Express 5.x의 종료 시점은 v6 출시에 달려 있습니다. 2025년 블로그는 "빠르면 2027-04-01"이고 지원 페이지는 "ongoing"이어서 확정 날짜가 없습니다.
- PostgreSQL 지원 표는 PG 19 RC 공지가 있는 시점에도 19 행이 없어, minor 번호가 최신이 아닐 수 있습니다.
- 동시 INSERT 시 deadlock 설명은 사용자 문서가 아닌 PostgreSQL 소스 주석이 근거입니다.
- Serializable에서의 제약 위반 안내는 문서상 unique 제약만 다루며, exclusion 제약에도 같은지는 확인하지 못했습니다.

## Sources (조회일 2026-11-05)

**PostgreSQL**
- S1 [PostgreSQL 17 CREATE TABLE](https://www.postgresql.org/docs/17/sql-createtable.html)
- S2 [PostgreSQL 17 Range Types](https://www.postgresql.org/docs/17/rangetypes.html)
- S3 [PostgreSQL 17 btree_gist](https://www.postgresql.org/docs/17/btree-gist.html)
- S4 [PostgreSQL 17 execIndexing.c](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/executor/execIndexing.c)
- S5 [PostgreSQL 17 Transaction Isolation](https://www.postgresql.org/docs/17/transaction-iso.html)
- S6 [PostgreSQL 18 CREATE TABLE](https://www.postgresql.org/docs/18/sql-createtable.html)
- S17 [PostgreSQL 17 Backup and Restore](https://www.postgresql.org/docs/17/backup.html)
- [PostgreSQL 17 Constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)
- [PostgreSQL 17 ALTER TABLE](https://www.postgresql.org/docs/17/sql-altertable.html)
- [PostgreSQL 17 Error Codes](https://www.postgresql.org/docs/17/errcodes-appendix.html)
- [PostgreSQL 17 Lock Management](https://www.postgresql.org/docs/17/runtime-config-locks.html)
- [PostgreSQL 17 SQL Dump](https://www.postgresql.org/docs/17/backup-dump.html)
- [PostgreSQL Versioning Policy](https://www.postgresql.org/support/versioning/)

**Express**
- S7 [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- S8 [Express Version Support](https://expressjs.com/en/support/)
- S9 [Express 5.3.0 Release](https://github.com/expressjs/express/releases/tag/v5.3.0)
- S10 [Express registry latest](https://registry.npmjs.org/express/latest)
- [Express Releases](https://github.com/expressjs/express/releases)
- [Express v5.1 Blog](https://expressjs.com/en/blog/2025-03-31-v5-1-latest-release)

**Fastify**
- S11 [Fastify LTS](https://fastify.dev/docs/latest/Reference/LTS/)
- S12 [Fastify Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- S13 [Fastify Errors](https://fastify.dev/docs/latest/Reference/Errors/)
- [Fastify V5 Migration Guide](https://fastify.dev/docs/latest/Guides/Migration-Guide-V5/)
- [Fastify registry latest](https://registry.npmjs.org/fastify/latest)

**배포**
- S14 [systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html)
- S15 [Docker Compose in Production](https://docs.docker.com/compose/how-tos/production/)
- S16 [Docker Engine Security](https://docs.docker.com/engine/security/)

**Node.js·node-postgres**
- [Node.js Release Schedule](https://raw.githubusercontent.com/nodejs/Release/main/schedule.json)
- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [node-postgres Transactions](https://node-postgres.com/features/transactions)
- [pg-protocol parser](https://raw.githubusercontent.com/brianc/node-postgres/master/packages/pg-protocol/src/parser.ts)
- [pg registry latest](https://registry.npmjs.org/pg/latest)
