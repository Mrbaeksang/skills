# 설치·업데이트·전환 평가

격리된 임시 home과 프로젝트에서만 실행한다. 실제 사용자의 설정·개별 스킬을 변경하지 않는다. CLI 버전·source SHA·설정 경로·초기/최종 목록과 실제 출력, 사용자 수정 sentinel hash를 기록한다. 각 호스트의 현재 `--help`를 확인하고 없는 명령은 NOTRUN이다.

로컬 source의 실제 native 설치·업데이트·설정 보존은 `node scripts/smoke-native.mjs codex NEW_OUTPUT PREVIOUS_CHECKOUT` 또는 `claude`로 실행한다. 이전 checkout을 생략하면 현재 fresh 설치만 검사한다. 새 output만 허용하고 실행 결과·격리 프로필을 보존한다. 이 명령은 원격 Git ref 전환이나 모델 발견을 검증하지 않으며 기본 프로필을 변경하지 않는다.

| Case | 준비와 실행 | 수용 기준 |
|---|---|---|
| Fresh | 빈 프로필에서 현재 checkout marketplace와 native plugin 설치 | 예상 버전 활성화, 17개 스킬 파일·참조 일치 |
| Update | 격리한 이전 버전 source 설치 후 같은 marketplace를 새 revision으로 갱신 | 새 cache·활성 버전 확인, 기존 사용자 설정 sentinel 보존 |
| Pinned | Git source를 이전 tag에 고정하고 일반 업데이트 시도 | 고정 상태를 최신으로 오판하지 않음; CLI가 허용하는 source 전환 후 다시 readback |
| Duplicate | native와 개별 설치를 함께 배치 | 중복 경로 식별, 출처가 확인된 개별 설치만 전환 대상으로 분류 |
| Modified | 개별 설치에 사용자 수정·무관한 스킬 추가 | 덮어쓰기·자동 삭제 없음, 백업/보존과 전환 제한 명시 |
| Discover | 각 호스트의 새 세션에서 8개 작업 스킬 중 대상 선택·호출 | 실제 발견·읽기 이력 확인; 설치 파일 존재만으로 PASS 아님 |
| Standalone | 기존 smoke:install로 review·verify 각각 선택 설치 | 형제 스킬 불필요, 자체 참조 완결, evals·fixture 미포함 |

전환 절차는 탐지 → 출처/수정 확인 → 허용 범위의 백업·이동 → native 상태·중복 재조회 순서다. 진단만 요청받으면 이동하지 않는다. 백업은 discovery 경로 밖에 두고 lock 기록의 해당 source 항목만 조정한다. 자동 installer hook이나 사용자 프로필 마이그레이션 도구는 추가하지 않는다.

소스·패키징 검사, 실제 설치, 새 세션 호출을 별도 행으로 보고한다. 대상 밖 host·UI는 미검증이다. 평가 결과는 `.artifacts/evals/`에 두고 일반 배포본에 넣지 않는다.
