# CSS·프론트 진단과 최적화

1. 대표 route·사용자 행동, 화면 크기·theme, loading·empty·error·modal 등 관련 상태를 고른다. 기존 component·디자인 token·global CSS와 실제 적용 경로를 확인한다. 유사 style만으로 서로 다른 상태·브랜드 규칙을 합치지 않는다.
2. production build의 bundle·chunk·이미지·폰트·CSS를 확인한다. 중복 자원, render blocking, 불필요한 요청·재렌더링을 후보로 삼고 실제 network·performance trace로 비용을 확인한다. 성능 주장 전에는 같은 환경·workload의 baseline을 확보한다.
3. CSS는 cascade·specificity·override·동적 class를 추적한다. Coverage의 미사용 결과는 관찰한 route와 조작에 한정된다. 다른 route·반응형·theme·지연 로딩·사용자 상태를 확인하기 전 삭제하지 않는다. 정적 미사용 분석도 entrypoint·framework 등록을 확인한다.
4. 기존 도구로 관찰하고 없으면 소스와 build 산출물로 확인 가능한 범위를 표시한다. 측정 없이 memoization·cache·code splitting을 일괄 추가하지 않는다. 변경은 실제 병목이나 확인된 중복에 한정하며 디자인·동작·접근성을 보존한다.
5. 같은 조건의 전후 성능과 관련 화면·상호작용을 함께 검증한다. 초기 로딩만 빨라지고 다음 조작이 느려지는 등 비용 이동을 확인한다. CSS 변경은 관련 크기·theme·focus·실패 상태의 렌더링 회귀도 확인한다. 실행 불가 항목은 NOTRUN으로 남긴다.

보고는 관찰 조건, 병목 근거, 변경 범위, 전후 결과와 미확인 상태로 끝낸다. 점수 하나나 CSS 줄 수 감소를 사용자 경험 개선의 증거로 쓰지 않는다.
