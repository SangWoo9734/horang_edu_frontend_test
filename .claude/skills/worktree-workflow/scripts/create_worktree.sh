#!/bin/bash
# Create a new git worktree for feature development
# Usage: ./create_worktree.sh <branch-name>

set -e

BRANCH_NAME=$1
BASE_BRANCH="develop"
WORKTREE_DIR=".worktrees"

if [ -z "$BRANCH_NAME" ]; then
    echo "Error: Branch name is required"
    echo "Usage: ./create_worktree.sh <branch-name>"
    exit 1
fi

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_PATH="$REPO_ROOT/$WORKTREE_DIR/$BRANCH_NAME"

# Check if worktree already exists
if [ -d "$WORKTREE_PATH" ]; then
    echo "Error: Worktree already exists at $WORKTREE_PATH"
    exit 1
fi

# Create worktree directory if it doesn't exist
mkdir -p "$REPO_ROOT/$WORKTREE_DIR"

# Fetch latest changes
echo "Fetching latest changes from origin..."
git fetch origin

# Create worktree with new branch based on develop
echo "Creating worktree at $WORKTREE_PATH..."
git worktree add -b "$BRANCH_NAME" "$WORKTREE_PATH" "origin/$BASE_BRANCH"

echo "✅ Worktree created successfully!"
echo "📁 Location: $WORKTREE_PATH"
echo "🌿 Branch: $BRANCH_NAME"
echo ""
echo "To start working:"
echo "  cd $WORKTREE_PATH"
