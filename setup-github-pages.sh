#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Daily Notes - GitHub Pages Setup Helper  ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${YELLOW}Error: GitHub username is required${NC}"
    exit 1
fi

# Get repository name
read -p "Enter repository name (default: DailyNotes): " REPO_NAME
REPO_NAME=${REPO_NAME:-DailyNotes}

echo -e "\n${YELLOW}Setting up for:${NC}"
echo "  GitHub Username: $GITHUB_USERNAME"
echo "  Repository: $REPO_NAME"

# Update index.html with GitHub links
echo -e "\n${BLUE}Updating web/index.html with GitHub links...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|https://github.com/yourusername/DailyNotes|https://github.com/$GITHUB_USERNAME/$REPO_NAME|g" web/index.html
else
    # Linux
    sed -i "s|https://github.com/yourusername/DailyNotes|https://github.com/$GITHUB_USERNAME/$REPO_NAME|g" web/index.html
fi

echo -e "${GREEN}✓ Updated GitHub links${NC}"

# Initialize git if not already
if [ ! -d ".git" ]; then
    echo -e "\n${BLUE}Initializing git repository...${NC}"
    git init
    git branch -M main
    echo -e "${GREEN}✓ Git repository initialized${NC}"
fi

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo -e "\n${BLUE}Adding remote origin...${NC}"
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo -e "${GREEN}✓ Remote origin added${NC}"
fi

# Create .gitignore if not exists
if [ ! -f ".gitignore" ]; then
    echo -e "\n${BLUE}Creating .gitignore...${NC}"
    cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
.env
.env.local
*.log
EOF
    echo -e "${GREEN}✓ Created .gitignore${NC}"
fi

echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Setup Complete! ✓${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Push your code to GitHub:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m 'Initial commit: Daily Notes web version'${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo "2. Go to GitHub repository settings:"
echo "   ${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME/settings${NC}"
echo ""
echo "3. Scroll to 'GitHub Pages' section"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main"
echo "   - Folder: /web"
echo "   - Click Save"
echo ""
echo "4. Your site will be available at:"
echo "   ${GREEN}https://$GITHUB_USERNAME.github.io/$REPO_NAME/${NC}"
echo ""
echo "For more information, see: ${BLUE}web/DEPLOYMENT.md${NC}"
