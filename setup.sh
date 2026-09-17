
#!/bin/bash

echo "========================================================"
echo "    Gemini & Antigravity IDE (agy) Setup Script         "
echo "========================================================"
echo ""

# Step 1: Clean up existing modern-web-guidance
echo "[1/5] Removing existing 'modern-web-guidance' directories..."
rm -rf .claude/skills/modern-web-guidance .agent/skills/modern-web-guidance 
echo "  -> Cleanup complete."
echo ""

# Step 2: Prompt for Gemini API Key
echo "[2/5] Gemini API Configuration"
echo "  Get your API key here: https://aistudio.google.com/"
read -p "  Enter your GEMINI_API_KEY: " API_KEY

# Step 3: Update .bashrc
echo ""
echo "[3/5] Saving API key to ~/.bashrc..."
if grep -q "export GEMINI_API_KEY=" ~/.bashrc; then
    # Handle cross-platform sed differences (macOS vs Linux)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|^export GEMINI_API_KEY=.*|export GEMINI_API_KEY=\"$API_KEY\"|" ~/.bashrc
    else
        sed -i "s|^export GEMINI_API_KEY=.*|export GEMINI_API_KEY=\"$API_KEY\"|" ~/.bashrc
    fi
    echo "  -> Updated existing GEMINI_API_KEY in ~/.bashrc"
else
    echo "export GEMINI_API_KEY=\"$API_KEY\"" >> ~/.bashrc
    echo "  -> Appended GEMINI_API_KEY to ~/.bashrc"
fi
# Export for the current script session
export GEMINI_API_KEY="$API_KEY"
echo ""

# Step 4: Configure Antigravity CLI Settings
echo "[4/5] Configuring Antigravity CLI (agy v1.2.2)..."
mkdir -p ~/.gemini/antigravity-cli

cat <<EOF > ~/.gemini/antigravity-cli/settings.json
{
  "modelProvider": "gemini"
}
EOF
echo "  -> Created ~/.gemini/antigravity-cli/settings.json"
echo ""

# Step 5: Configure Chrome DevTools MCP Server
echo "[5/5] Configuring Chrome DevTools MCP Server..."
mkdir -p ~/.gemini/config

cat <<EOF > ~/.gemini/config/mcp_config.json
{
  "mcpServers": {
    "chrome-devtools": {
       "command": "npx",
       "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
EOF
echo "  -> Created ~/.gemini/config/mcp_config.json"

# Attempt to run the gemini mcp install command if 'gemini' CLI is installed
if command -v gemini &> /dev/null; then
    echo "  -> Registering MCP server via Gemini CLI..."
    gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest
else
    echo "  -> NOTE: 'gemini' CLI not found on path yet. You may need to run:"
    echo "     gemini mcp add chrome-devtools npx chrome-devtools-mcp@latest"
    echo "     manually after installing the Gemini tools."
fi

echo ""
echo "========================================================"
echo "                   SETUP COMPLETE!                      "
echo "========================================================"
echo ""
echo "To verify your setup and start working, run the following:"
echo ""
echo "1. Refresh your terminal session:"
echo "   source ~/.bashrc"
echo ""
echo "2. Clone the modern web guidance demos into your workspace."
echo "   (Remember: we will install modern web guidance *together* during"
echo "   the session, please refrain from doing so right now)."
echo ""
echo "3. Open the Antigravity CLI:"
echo "   agy"
echo ""
echo "   (You know this worked when you open agy cli and you see 'Gemini API Key')"
echo ""
echo "4. Inside the CLI, select the target model by typing:"
echo "   /model"
echo "   (Pick: 3.6 flash)"
echo ""
echo "========================================================"


