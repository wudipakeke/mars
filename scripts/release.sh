#!/bin/bash
set -e

TARGET=${1:-all}
TYPE=${2:-patch}

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Validate ──
VALID_TARGETS=("all" "server" "web")
VALID_TYPES=("patch" "minor" "major")
if [[ ! " ${VALID_TARGETS[*]} " =~ " ${TARGET} " ]]; then
  echo -e "${RED}Invalid target: ${TARGET}${NC}"
  echo "Valid options: all, server, web"
  exit 1
fi
if [[ ! " ${VALID_TYPES[*]} " =~ " ${TYPE} " ]]; then
  echo -e "${RED}Invalid type: ${TYPE}${NC}"
  echo "Valid options: patch, minor, major"
  exit 1
fi

# ── Target label ──
case $TARGET in
  all)    TARGET_LABEL="all packages" ;;
  server) TARGET_LABEL="@mars/server" ;;
  web)    TARGET_LABEL="@mars/web" ;;
esac

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🚀 Mars Release Process                  ║${NC}"
echo -e "${CYAN}║     Target: ${TARGET_LABEL}                      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Lint Check ──
echo -e "${YELLOW}[1/3] Running lint check...${NC}"
echo "      turbo lint:check"
echo ""
if pnpm lint:check; then
  echo ""
  echo -e "  ${GREEN}✅ Lint check passed${NC}"
else
  echo ""
  echo -e "  ${RED}❌ Lint found errors, release aborted${NC}"
  echo "     Fix the errors above and try again."
  exit 1
fi
echo ""

# ── Step 2: Version Bump ──
echo -e "${YELLOW}[2/3] Bumping version...${NC}"
echo "      pnpm version:${TARGET}:${TYPE}"
echo ""
pnpm "version:${TARGET}:${TYPE}"
echo ""

# Show version info
case $TARGET in
  all)
    SERVER_VER=$(cat apps/server/package.json | jq -r '.version')
    WEB_VER=$(cat apps/web/package.json | jq -r '.version')
    echo -e "  ${GREEN}✅ @mars/server → v${SERVER_VER}${NC}"
    echo -e "  ${GREEN}✅ @mars/web    → v${WEB_VER}${NC}"
    ;;
  server)
    SERVER_VER=$(cat apps/server/package.json | jq -r '.version')
    echo -e "  ${GREEN}✅ @mars/server → v${SERVER_VER}${NC}"
    ;;
  web)
    WEB_VER=$(cat apps/web/package.json | jq -r '.version')
    echo -e "  ${GREEN}✅ @mars/web    → v${WEB_VER}${NC}"
    ;;
esac
echo ""

# ── Step 3: Commit ──
echo -e "${YELLOW}[3/3] Committing version bump...${NC}"
case $TARGET in
  all)
    echo "      git add apps"
    echo "      git commit -m \"chore: bump all version (${TYPE})\""
    git add apps
    git commit -m "chore: bump all version (${TYPE})"
    ;;
  *)
    echo "      git add apps/${TARGET}/package.json"
    echo "      git commit -m \"chore: bump ${TARGET} version (${TYPE})\""
    git add "apps/${TARGET}/package.json"
    git commit -m "chore: bump ${TARGET} version (${TYPE})"
    ;;
esac
COMMIT_SHA=$(git rev-parse --short HEAD)
echo ""
echo -e "  ${GREEN}✅ Committed (${COMMIT_SHA})${NC}"
echo ""

# ── Summary ──
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✅ ${TARGET_LABEL} release ready!                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}✔ Lint check${NC}"
case $TARGET in
  all)
    echo -e "  ${GREEN}✔ @mars/server v${SERVER_VER}${NC}"
    echo -e "  ${GREEN}✔ @mars/web v${WEB_VER}${NC}"
    ;;
  server)
    echo -e "  ${GREEN}✔ @mars/server v${SERVER_VER}${NC}"
    ;;
  web)
    echo -e "  ${GREEN}✔ @mars/web v${WEB_VER}${NC}"
    ;;
esac
echo -e "  ${GREEN}✔ Committed (${COMMIT_SHA})${NC}"
echo ""
echo -e "  ${YELLOW}━━━ Next step ━━━${NC}"
echo ""
echo -e "  Run the following command to trigger deployment:"
echo ""
echo -e "  ${CYAN}    git push origin main${NC}"
echo ""
echo -e "  This will push the commit to GitHub. The CD workflow"
echo -e "  will detect the version change and automatically:"
case $TARGET in
  all)
    echo -e "  • Build & deploy @mars/server to k3s"
    echo -e "  • Build & deploy @mars/web to k3s"
    ;;
  server)
    echo -e "  • Build & deploy @mars/server to k3s"
    ;;
  web)
    echo -e "  • Build & deploy @mars/web to k3s"
    ;;
esac
echo ""
