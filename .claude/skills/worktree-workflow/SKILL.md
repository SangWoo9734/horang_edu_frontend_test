---
name: worktree-workflow
description: "Manage feature development using git worktrees for isolated work environments. Use when implementing product features or significant changes. Always ask the user first whether to use worktree workflow before starting implementation work. Triggers on feature implementation requests, new functionality additions, significant refactoring tasks, or any substantial code changes that would benefit from isolated development."
---

# Worktree Workflow

## Overview

Provides a structured workflow for implementing features using git worktrees, allowing isolated development without affecting the main working directory. This skill automates worktree creation, guides implementation, and offers post-completion options.

## When to Use This Workflow

**Always ask the user** before starting any feature implementation work:
> "Would you like to use a git worktree for this work, or work directly in the current directory?"

Use worktrees for:
- Product feature implementations
- Significant refactoring tasks
- Any substantial changes that benefit from isolation

Skip worktrees for:
- Quick bug fixes
- Documentation updates
- Minor refactoring

## Workflow Steps

### 1. Ask User Preference

Before starting implementation, present the choice:

```
I can implement this in two ways:

1. **Using git worktree** (recommended for features)
   - Isolated environment in .worktrees/
   - Based on latest develop branch
   - Keeps your current work untouched

2. **Direct implementation**
   - Work in current directory
   - Faster for small changes

Which approach would you prefer?
```

### 2. Create Worktree (if user chooses worktree)

**Determine branch name:**
- Check existing branches to understand project naming convention
- Common patterns: `feature/`, `fix/`, `refactor/`, `chore/`
- Use descriptive names: `feature/user-authentication`, `fix/login-bug`

**Create the worktree:**

```bash
bash .claude/skills/worktree-workflow/scripts/create_worktree.sh <branch-name>
```

The script will:
- Fetch latest changes from origin
- Create worktree in `.worktrees/<branch-name>/`
- Create new branch based on `origin/develop`
- Set up tracking

**Change to worktree directory:**

```bash
cd .worktrees/<branch-name>
```

### 3. Implement the Feature

Proceed with normal implementation workflow in the worktree:
- Make code changes
- Run tests
- Commit changes
- Follow project conventions

All work happens in isolated `.worktrees/<branch-name>/` directory.

### 4. Post-Completion Actions

After implementation is complete, ask the user what they'd like to do next:

```
Implementation complete! What would you like to do next?

1. **Create a Pull Request**
   - Push branch to remote
   - Create PR against develop
   - Keep worktree for review iterations

2. **Clean up worktree**
   - Remove worktree directory
   - Keep or delete the branch

3. **Return to main directory**
   - Leave worktree as-is
   - Switch back to original working directory

4. **Continue working**
   - Stay in worktree for more changes

Which option would you prefer?
```

**For cleanup:**

```bash
bash .claude/skills/worktree-workflow/scripts/cleanup_worktree.sh <branch-name>
```

Note: Cleanup removes the worktree but keeps the branch. To delete the branch:

```bash
git branch -d <branch-name>  # If merged
git branch -D <branch-name>  # Force delete
```

## Branch Naming Conventions

Before creating a worktree, check project conventions:

```bash
git branch -r | grep -E "feature/|fix/|refactor/|chore/" | head -10
```

Common patterns:
- `feature/descriptive-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `chore/task-description` - Maintenance tasks

Use kebab-case for branch names.

## Troubleshooting

**Worktree already exists:**
```bash
# List all worktrees
git worktree list

# Remove existing worktree if needed
git worktree remove .worktrees/<branch-name>
```

**Branch already exists:**
```bash
# List branches
git branch -a

# Use different branch name or delete existing
git branch -d <branch-name>
```

**Return to main directory:**
```bash
cd /Users/songdonghoon/donghoonsong/project/potens-ai-lms
```

## Scripts Reference

### create_worktree.sh

Creates a new worktree with a feature branch.

```bash
bash .claude/skills/worktree-workflow/scripts/create_worktree.sh <branch-name>
```

- Base branch: `develop`
- Location: `.worktrees/<branch-name>/`
- Automatically fetches latest changes

### cleanup_worktree.sh

Removes a worktree after work is complete.

```bash
bash .claude/skills/worktree-workflow/scripts/cleanup_worktree.sh <branch-name>
```

- Removes worktree directory
- Preserves the branch
- Safe to run multiple times
