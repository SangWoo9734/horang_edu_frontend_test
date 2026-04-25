#!/bin/bash
# Cleanup a git worktree after work is complete
# Usage: ./cleanup_worktree.sh <branch-name>

set -e

BRANCH_NAME=$1
WORKTREE_DIR=".worktrees"

if [ -z "$BRANCH_NAME" ]; then
    echo "Error: Branch name is required"
    echo "Usage: ./cleanup_worktree.sh <branch-name>"
    exit 1
fi

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="$REPO_ROOT/$WORKTREE_DIR/$BRANCH_NAME"

# Check if worktree exists
if [ ! -d "$WORKTREE_PATH" ]; then
    echo "Error: Worktree does not exist at $WORKTREE_PATH"
    exit 1
fi

# Remove the worktree
echo "Removing worktree at $WORKTREE_PATH..."
git worktree remove "$WORKTREE_PATH"

echo "✅ Worktree removed successfully!"
echo ""
echo "Note: The branch '$BRANCH_NAME' still exists."
echo "To delete the branch after merging:"
echo "  git branch -d $BRANCH_NAME"
