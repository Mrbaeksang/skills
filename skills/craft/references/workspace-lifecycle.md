# 작업 공간 생성·통합·정리

코드 수정을 시작하거나 작업 소유 branch/worktree를 통합·정리할 때 읽는다. 분석-only 요청은 읽기 범위를 유지한다. 구현 권한이 main 병합, push, 배포 권한을 추가하지 않는다.

## 선택과 소유권

1. 실제 저장소 루트, cwd, branch/HEAD, worktree 목록, tracked 변경, untracked 및 ignored 파일을 확인한다. 작업의 승인 범위와 기존 변경을 기록한다. Git이 아닌 작업에는 해당 환경의 격리·보존 방법을 사용하고 Git 절차를 억지로 적용하지 않는다.
2. 작은 작업이며 기존 변경과 충돌하지 않으면 적합한 현재 작업 공간을 재사용한다. 병렬 작업이나 겹치는 변경으로 충돌 위험이 있으면 승인된 저장소 안에서 작업 전용 branch/worktree를 만든다. 기존 경로·branch가 있으면 소유권을 확인하고 덮어쓰지 않는다. reset/stash/clean으로 무관한 변경을 치우지 않는다.
3. 시작 base는 사용자의 지정과 작업 dependency graph를 따른다. 선행 결과가 필요한 작업은 해당 결과가 통합된 tip을 확인하고 시작한다. 무조건 main 또는 오래된 HEAD에서 분기하지 않는다. 작업 기록에 소유한 branch/worktree 경로, 시작 base SHA, 예정 통합 대상, 기존 자산과 신규 자산의 소유 범위를 남긴다.
4. 모든 명령에 명시적 cwd 또는 동등한 저장소 지정 인자를 사용한다. branch 이름만 믿지 말고 현재 HEAD와 worktree를 확인한다. 병렬 작업의 경로·브랜치를 섞지 않는다.

## 통합과 안전한 정리

1. 허용된 통합 대상에 대해서만 검증·독립 검토 조건을 충족한 변경을 통합한다. main 병합이나 외부 공개가 범위에 없으면 결과 branch와 commit을 보존하여 인계한다. 충돌 해결도 현재 작업 범위와 사용자 변경 보존을 따른다.
2. 정리 전 소유권을 다시 확인한다. 작업 branch tip이 실제 통합 대상 tip의 ancestor인지 확인한다(예: `git merge-base --is-ancestor <work-tip> <integration-tip>`). 미통합 commit, 열린 PR의 branch, 타 작업이 사용 중인 branch/worktree는 보존한다. squash/rebase로 ancestor가 아니면 동등하다고 추정해 삭제하지 말고 정리 미완료로 남긴다.
3. 삭제 직전에 해당 worktree의 tracked 변경, untracked 파일, ignored 자산을 각각 조회한다. 예: `git status --porcelain --untracked-files=all`과 `git ls-files --others --ignored --exclude-standard`. 필요한 에이전트 기록이 있으면 [작업 기록](agent-records.md)의 인계 조건도 확인한다. 보존 대상 또는 소유 불명 파일이 하나라도 있으면 worktree를 유지하고 이유를 보고한다. ignored라는 이유만으로 캐시·credentials·산출물을 삭제하지 않는다.
4. 본 작업이 생성한 자원만 정리한다. 통합 증거와 파일 보존 검사가 충족된 작업 소유 worktree를 다른 cwd에서 `git worktree remove <owned-path>`로 제거하고, 사용 중이지 않으며 통합된 작업 branch만 `git branch -d <owned-branch>`로 정리한다. 안전 명령이 거부하면 이유를 확인하고 자원을 보존한다. `--force`, `-D`, recursive 파일 삭제로 거부를 우회하지 않는다.
5. worktree/branch 목록을 재조회하여 결과를 확인한다. 정리 영수증에는 작업 base/tip, 통합 tip과 ancestor 확인 결과, 변경·untracked·ignored 검사 결과, 제거한 소유 자원, 보존한 자원과 이유를 기록한다. 정리하지 못한 자원을 정리 완료로 보고하지 않는다.
