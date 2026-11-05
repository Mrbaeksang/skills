# 측정 가능한 개선

1. **실험 계약.** 목표 지표와 단위, 대표 입력/크기/동시성, runtime·build·flags·하드웨어, seed, 데이터 snapshot, warm/cold cache, 성공 출력·오류 수, 반복 수를 고정한다. 실행 비용과 쓰기/외부 호출 권한을 확인한다. production 변경 없이 격리 fixture에서 가능한 경우 먼저 재현한다.
2. **baseline.** 측정 script가 실제 일을 끝내고 결과를 소비하는지 읽는다. end-to-end 사용자 경계와 hotspot 측정을 구분한다. warmup 후 profiler 없이 baseline을 기록한다. Python은 `time.perf_counter`/`timeit`, 다른 runtime은 이미 제공하는 timer/benchmark 도구를 사용한다.
3. **profile.** 별도 실행에서 CPU, allocation, I/O 또는 trace로 큰 구간을 source symbol과 연결한다. Python 표준 `cProfile`과 `pstats`도 대안이다. profiler 시간을 benchmark 시간으로 사용하지 않는다. 관찰 비용이 없으면 추정 병목으로만 보고한다.
4. **최소 변경.** 관찰된 제한 요인에 맞춰 불필요한 작업 제거, 반복 작업 재사용, 데이터 접근 개선 등을 비교한다. cache는 scope·무효화·메모리·동시성 계약까지 검토한다. 추정 speedup으로 변경을 정당화하지 않는다.
5. **같은 조건 비교.** 같은 입력과 runtime 설정, 같은 완료/오류 검사를 양쪽에 적용한다. 기본 5회 이상 A/B 교차 실행으로 median·min/max·오류 수를 기록한다. 한 번만 가능하면 단일 관찰임을 밝힌다. 차이가 변동 범위 수준이면 inconclusive로 판정한다. 동시 부하나 하드웨어 정보를 못 얻으면 그 한계를 남긴다.
6. **회귀와 주장.** 정상·경계·실패·복구 중 관련 use case를 공개 경계로 확인한다. 절대 시간과 상대 변화, profile 근거, 출력 정확성, 메모리/복잡도 trade-off, 측정 범위를 보고한다. microbenchmark 향상을 서비스 전체 향상으로 확장하지 않는다. 목표 미달·오류 증가·설명할 수 없는 수치는 PASS가 아니다.
