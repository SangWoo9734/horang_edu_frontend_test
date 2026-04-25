---
name: commit
description: Analyze all unstaged changes, group them by logical task, and create separate commits for each group using Conventional Commits format. Use this skill when the user wants to commit changes. Automatically runs pre-commit-check (lint + build) before committing.
---

# Commit

전체 변경사항을 분석하여 논리적 task 단위로 그룹화하고, 각 그룹을 Conventional Commits 형식으로 순서대로 커밋합니다.

## Workflow

### 1. 변경사항 전체 확인

```bash
git status
git diff
git diff --staged
```

staged/unstaged 모든 변경사항을 파악한다.

### 2. Task 단위 그룹화 및 제안

변경된 파일들의 diff를 분석하여 논리적으로 연관된 변경사항끼리 묶어 커밋 그룹을 제안한다.

**그룹화 기준:**
- 같은 기능/버그/리팩토링에 속하는 파일끼리 묶는다.
- 의존 관계가 있는 파일은 같은 그룹으로 묶는다 (예: API 함수와 그것을 사용하는 hook).
- 설정/의존성 변경은 별도 그룹으로 분리한다.

**제안 형식 예시:**

```
📦 커밋 그룹 제안

[1] refactor(api): add fetch wrapper and migrate user API
    - app/api/client.ts (신규)
    - app/api/user.ts (수정)

[2] feat(attendance): add attendance check-in API
    - app/api/attendance.ts (신규)
    - app/hooks/useAttendance.ts (신규)

[3] chore: update env variable for API base URL
    - .env.example (수정)
```

사용자에게 그룹 구성이 맞는지 확인하고, 수정 요청이 있으면 반영한다.

> **제한사항:** 한 파일에 여러 task의 변경사항이 섞인 경우 라인 단위 분리는 불가능하며, 해당 파일은 가장 관련성이 높은 그룹에 포함한다.

### 3. Pre-commit 검사 실행

첫 번째 커밋 전에 **pre-commit-check 스킬을 실행한다.**

- ESLint 실행 → 자동 수정 가능한 오류는 fix
- Build 실행 → 실패 시 커밋 전체 중단, 오류 내용 안내
- 검사 통과 시에만 커밋 진행

### 4. 그룹별 순서대로 커밋

각 그룹에 대해 순서대로 다음을 수행한다:

```bash
# 해당 그룹의 파일만 stage
git add <file1> <file2> ...

# 커밋 메시지 생성 및 커밋
git commit -m "<type>(<scope>): <subject>"
```

커밋마다 완료 메시지를 출력한다.

**타입 선택 기준:**

| 타입 | 사용 상황 |
|------|-----------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `chore` | 빌드, 설정, 의존성 변경 |
| `style` | 포맷, 세미콜론 등 코드 의미 변화 없는 수정 |
| `docs` | 문서 변경 |
| `test` | 테스트 추가/수정 |

**메시지 형식:**

```
<type>(<scope>): <subject>
```

- subject: 영어 소문자로 시작, 현재 시제, 50자 이하
- scope: 변경된 모듈/컴포넌트명 (선택)
- body, footer, trailer는 추가하지 않는다

### 5. 완료 보고

모든 커밋 완료 후 생성된 커밋 목록을 출력한다:

```bash
git log --oneline -<n>
```

## 중단 조건

- pre-commit-check(lint/build)가 실패한 경우
- 변경사항이 전혀 없는 경우
- 사용자가 커밋 취소를 요청한 경우

## 중요 규칙

- **커밋 메시지에 `Co-Authored-By` 또는 다른 author를 나타내는 trailer/footer를 절대 추가하지 않는다.** Claude, AI 등 외부 기여자 정보를 커밋에 포함하지 않는다.
- `git push`는 사용자가 명시적으로 요청하지 않으면 하지 않는다.
- `--no-verify` 등 검사 우회 옵션은 사용하지 않는다.
- 커밋 그룹이 1개뿐이어도 동일한 절차를 따른다.
