# 실험 선택

도구 이름보다 가설을 구분하는 관측값을 먼저 정한다. 기존 설치된 도구를 사용하며 도구가 없으면 같은 경계를 관찰하는 허용된 대안을 찾는다. 무거운 도구 설치를 진단의 기본 전제로 삼지 않는다.

가설의 범위와 예측을 맞춘다. 관찰한 입력에서 같은 출력을 내는 두 가설은 그 실험으로 구분할 수 없다. 예를 들어 정수 입력에서 `x > 50000`과 `x >= 50001`은 동치이므로 출력 대조만으로 둘 중 하나를 기각하지 않는다. 실행된 소스/trace 같은 추가 증거로 좁히거나 미결로 남긴다.

| 조건 | 실험과 증거 | 해석 한계 |
|---|---|---|
| 잘못된 CLI/API 결과 | 같은 입력의 실제 process/request, 파싱한 응답·채널·exit/status; 정상 대조군 | 내부 함수 호출만으로 실제 entrypoint를 검증하지 못함 |
| 여러 계층의 값 변형 | entrypoint에서 실패 지점까지 관련 로그/trace와 입출력 대조; 필요시 한 경계에 임시 계측 | 로그가 없다는 사실은 해당 코드 미실행의 증명이 아님 |
| 특정 변경 이후 회귀 | 알려진 정상/실패 revision과 결정적 재현으로 격리된 checkout에서 비교 또는 bisect | 기존 dirty worktree를 reset하지 않으며 첫 실패 commit이 원인 메커니즘을 대신하지 않음 |
| 비결정적 실패 | 고정 seed/조건, 제한된 반복과 실패율, 실패 trace 비교 | 한 번 성공은 해결 증거가 아님; 부하/장애 주입은 허용된 격리 환경에 한정 |
| 지연/처리량 저하 | workload, baseline, 시간/메모리 등 목표 지표와 분산; profiler/trace로 비용 구간 확인 | 평균 하나나 복잡도 수치만으로 병목을 확정하지 않음 |
| 자원 병목 의심 | 관련 자원의 utilization, saturation, errors를 같은 시간 창에서 관찰 | 높은 사용률은 원인 후보; 요청 지연/실행 경로와 연결해야 함 |
| 외부 서비스 오류 | 실제 응답·timeout·설정, 가능한 안전한 대조 요청 | mock 성공은 provider 복구 증거가 아님; 외부 변경/재시도 권한 확대 금지 |

성능 실험이면 [공용 측정 절차](workflows/optimize/measurement.md)를 적용한다. 이미 읽었으면 반복하지 않는다.

이 절차는 Google SRE의 가설-실험 접근과 Brendan Gregg의 자원/측정 중심 진단을 적용해 새로 작성했다. 원본 문구나 실행 코드를 포함하지 않는다. 방법의 출처: [Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/), [USE Method](https://www.brendangregg.com/usemethod.html). 최신 도구/API 사용법이 필요할 때는 해당 환경의 공식 문서를 별도로 확인한다.
