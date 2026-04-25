---
name: pre-commit-check
description: Automatically validate code before committing by running ESLint and build checks. Use this skill (1) immediately before creating a git commit, (2) after completing code changes when the user wants to ensure code quality, or (3) when the user explicitly requests pre-commit validation. Automatically attempts to fix lint errors using ESLint --fix and reports build errors if found.
---

# Pre-Commit Check

Validates code quality before committing by running ESLint and build checks, automatically fixing lint errors when possible.

## Workflow

Follow these steps in order when validating code before commit:

### 1. Check Staged Changes

First, verify there are staged changes to commit:

```bash
git status
```

If no changes are staged, inform the user and ask if they want to stage changes first.

### 2. Run ESLint

Execute ESLint to check for code quality issues:

```bash
npm run lint
```

**If errors found:**
- Automatically attempt to fix using `npm run lint -- --fix`
- Re-run lint to verify fixes
- Report any remaining errors that require manual intervention
- Stage the auto-fixed files: `git add <fixed-files>`

**If no errors:**
- Proceed to next step

### 3. Run Build

Execute the build to ensure compilation succeeds:

```bash
npm run build
```

**If build fails:**
- Parse and report the error messages
- Identify the problematic files and error types (type errors, import errors, etc.)
- DO NOT attempt automatic fixes for build errors
- Provide clear guidance on what needs to be fixed
- Ask user if they want help fixing the errors

**If build succeeds:**
- Report successful validation
- Confirm it's safe to proceed with commit

## Error Handling

### ESLint Errors
- Auto-fixable errors: Apply `--fix` automatically
- Non-fixable errors: Report file paths, line numbers, and error messages
- After fixes: Always re-stage modified files

### Build Errors
- Type errors: Show file path, line, and type mismatch
- Import errors: Show missing imports or incorrect paths
- Syntax errors: Show exact location and problematic code
- Never auto-fix build errors - always require user review

## Example Usage

**Scenario 1: Clean validation**
```
User: [completes code changes and asks to commit]
Assistant: [runs pre-commit-check skill]
- ✅ ESLint: No errors found
- ✅ Build: Successful
Ready to commit!
```

**Scenario 2: Auto-fixable lint errors**
```
User: [completes code changes and asks to commit]
Assistant: [runs pre-commit-check skill]
- ⚠️ ESLint: 12 errors found
- 🔧 Auto-fixing with --fix...
- ✅ ESLint: All errors fixed
- ✅ Build: Successful
Auto-fixed files have been staged. Ready to commit!
```

**Scenario 3: Build errors**
```
User: [completes code changes and asks to commit]
Assistant: [runs pre-commit-check skill]
- ✅ ESLint: No errors found
- ❌ Build: Failed with 3 type errors

Build Errors:
1. src/components/FeedbackWidget.tsx:245
   Type 'string | undefined' is not assignable to type 'string'
2. src/lib/utils/helpers.ts:89
   Property 'backgroundColor' does not exist on type 'StyleEdits'

Would you like help fixing these errors?
```

## Important Notes

- Always run ESLint before build (faster feedback loop)
- Auto-fix is safe for ESLint but NEVER for TypeScript/build errors
- Re-stage files after auto-fixing
- Provide clear, actionable error messages
- Don't proceed to commit if validation fails
