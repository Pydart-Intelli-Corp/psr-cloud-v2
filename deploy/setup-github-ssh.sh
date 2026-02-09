#!/bin/bash

###############################################################################
# GitHub SSH Setup Script
# Run this on your VPS to configure SSH access to GitHub
###############################################################################

echo "=============================================="
echo "  GitHub SSH Configuration"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get user email
echo -e "${YELLOW}Enter your GitHub email:${NC}"
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "Email is required!"
    exit 1
fi

# Check if SSH key already exists
if [ -f ~/.ssh/id_ed25519 ]; then
    echo -e "${YELLOW}SSH key already exists!${NC}"
    echo "Do you want to:"
    echo "  1) Use existing key"
    echo "  2) Generate new key (will backup old)"
    read -p "Choice [1]: " CHOICE
    CHOICE=${CHOICE:-1}
    
    if [ "$CHOICE" == "2" ]; then
        mv ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.backup
        mv ~/.ssh/id_ed25519.pub ~/.ssh/id_ed25519.pub.backup
        echo "Old keys backed up"
    fi
fi

# Generate SSH key if not exists
if [ ! -f ~/.ssh/id_ed25519 ]; then
    echo -e "${GREEN}Generating SSH key...${NC}"
    ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""
    echo -e "${GREEN}✓ SSH key generated${NC}"
fi

# Start SSH agent
eval "$(ssh-agent -s)" > /dev/null 2>&1
ssh-add ~/.ssh/id_ed25519 > /dev/null 2>&1

# Display public key
echo ""
echo "=============================================="
echo -e "${GREEN}Your SSH Public Key:${NC}"
echo "=============================================="
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
echo "=============================================="
echo ""

# Instructions
echo -e "${YELLOW}Next Steps:${NC}"
echo ""
echo "1. Copy the SSH key above (entire line)"
echo "2. Go to: https://github.com/settings/keys"
echo "3. Click 'New SSH key'"
echo "4. Title: PSR VPS Server"
echo "5. Paste the key"
echo "6. Click 'Add SSH key'"
echo ""
read -p "Press Enter after adding key to GitHub..."

# Test connection
echo ""
echo -e "${GREEN}Testing GitHub connection...${NC}"
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSH connection to GitHub successful!${NC}"
else
    echo -e "${YELLOW}Testing connection (you might see a warning, that's OK)...${NC}"
    ssh -T git@github.com
fi

# Configure Git
echo ""
echo -e "${GREEN}Configuring Git...${NC}"
read -p "Enter your full name: " NAME
git config --global user.name "$NAME"
git config --global user.email "$EMAIL"
echo -e "${GREEN}✓ Git configured${NC}"

# Display configuration
echo ""
echo "=============================================="
echo -e "${GREEN}Configuration Complete!${NC}"
echo "=============================================="
echo ""
echo "Git Configuration:"
echo "  Name:  $(git config --global user.name)"
echo "  Email: $(git config --global user.email)"
echo ""
echo "SSH Key location: ~/.ssh/id_ed25519"
echo ""
echo "You can now clone repositories using SSH:"
echo -e "${BLUE}git clone git@github.com:username/repo.git${NC}"
echo ""

# Test with actual repo
echo -e "${YELLOW}Would you like to test cloning the PSR repository? (y/n)${NC}"
read -p "Test clone [n]: " TEST
if [ "$TEST" == "y" ] || [ "$TEST" == "Y" ]; then
    mkdir -p /tmp/test-clone
    cd /tmp/test-clone
    echo "Testing clone from: git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git"
    if git clone git@github.com:Pydart-Intelli-Corp/psr-cloud-v2.git . 2>&1; then
        echo -e "${GREEN}✓ Clone test successful!${NC}"
        cd ~
        rm -rf /tmp/test-clone
    else
        echo -e "${YELLOW}Clone test failed. Check your GitHub access.${NC}"
        echo "Try HTTPS: git clone https://github.com/Pydart-Intelli-Corp/psr-cloud-v2.git"
    fi
fi

echo ""
echo "Setup complete!"
