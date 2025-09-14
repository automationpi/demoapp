# Final TechDocs Docker image with robust configuration handling
FROM python:3.12-alpine

# Install system dependencies including Node.js for mermaid-cli
RUN apk add --no-cache \
    gcc \
    musl-dev \
    openjdk17 \
    curl \
    graphviz \
    ttf-dejavu \
    font-noto \
    nodejs \
    npm \
    chromium \
    && rm -rf /var/cache/apk/*

# Install mermaid-cli globally for markdown-inline-mermaid
RUN npm install -g @mermaid-js/mermaid-cli

# Set Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install PlantUML
RUN curl -L https://github.com/plantuml/plantuml/releases/download/v1.2024.6/plantuml-1.2024.6.jar -o /opt/plantuml.jar

# Create PlantUML execution script
RUN echo $'#!/bin/sh\\n\\njava -jar /opt/plantuml.jar ${@}' > /usr/local/bin/plantuml \
    && chmod 755 /usr/local/bin/plantuml

# Install Python packages for TechDocs
RUN pip install --upgrade pip \
    && pip install mkdocs-techdocs-core==1.5.4

# Install additional packages for enhanced Mermaid support
RUN pip install --no-cache-dir \
    markdown-inline-mermaid \
    pymdown-extensions \
    mkdocs-mermaid2-plugin \
    pyyaml

# Create working directory
WORKDIR /content

# Create configuration fixer script
RUN cat > /usr/local/bin/fix-config.py << 'EOF'
#!/usr/bin/env python3
import yaml
import os
import sys

def fix_config():
    print("🔧 Configuration Fixer Started")
    
    if not os.path.exists('mkdocs.yml'):
        print("❌ No mkdocs.yml found")
        return
    
    print("📖 Reading mkdocs.yml...")
    try:
        with open('mkdocs.yml', 'r') as f:
            content = f.read()
            print(f"📄 File size: {len(content)} chars")
            config = yaml.safe_load(content) or {}
        print(f"✅ Successfully parsed YAML with {len(config)} top-level keys")
        print(f"🔍 Keys found: {list(config.keys())}")
    except Exception as e:
        print(f"❌ Failed to parse mkdocs.yml: {e}")
        print("🆘 Creating minimal config")
        config = {}
    
    changes_made = []
    
    # Fix docs_dir
    original_docs_dir = config.get('docs_dir')
    if not original_docs_dir or original_docs_dir in ['.', './']:
        config['docs_dir'] = 'docs'
        changes_made.append(f"docs_dir: '{original_docs_dir}' → 'docs'")
    
    # Fix markdown_extensions with enhanced Mermaid support
    extensions = config.get('markdown_extensions')
    if not extensions or not isinstance(extensions, list) or any(ext is None for ext in extensions):
        old_ext = str(extensions)[:50] if extensions else 'None'
        config['markdown_extensions'] = [
            'admonition',
            'toc',
            'pymdownx.highlight',
            {
                'pymdownx.superfences': {
                    'custom_fences': [
                        {
                            'name': 'mermaid',
                            'class': 'mermaid',
                            'format': '!!python/name:pymdownx.superfences.fence_code_format'
                        }
                    ]
                }
            },
            'markdown_inline_mermaid'
        ]
        changes_made.append(f"markdown_extensions: {old_ext} → [enhanced with dual Mermaid support]")
    else:
        # Enhance existing extensions for better Mermaid support
        ext_names = []
        for ext in extensions:
            if isinstance(ext, str):
                ext_names.append(ext)
            elif isinstance(ext, dict):
                ext_names.extend(ext.keys())
        
        # Add Mermaid support if not present
        has_inline_mermaid = 'markdown_inline_mermaid' in ext_names
        has_superfences = 'pymdownx.superfences' in ext_names
        
        if not has_inline_mermaid:
            config['markdown_extensions'].append('markdown_inline_mermaid')
            changes_made.append("Added markdown_inline_mermaid for inline Mermaid support")
        
        if not has_superfences:
            config['markdown_extensions'].append({
                'pymdownx.superfences': {
                    'custom_fences': [
                        {
                            'name': 'mermaid',
                            'class': 'mermaid',
                            'format': '!!python/name:pymdownx.superfences.fence_code_format'
                        }
                    ]
                }
            })
            changes_made.append("Added pymdownx.superfences with Mermaid custom fences")
    
    # Ensure plugins with enhanced Mermaid support
    if not config.get('plugins'):
        config['plugins'] = [
            'techdocs-core',
            {'mermaid2': {'version': '10.8.0'}}
        ]
        changes_made.append("plugins: None → ['techdocs-core', 'mermaid2']")
    else:
        # Check if mermaid2 plugin exists
        plugin_names = []
        for plugin in config['plugins']:
            if isinstance(plugin, str):
                plugin_names.append(plugin)
            elif isinstance(plugin, dict):
                plugin_names.extend(plugin.keys())
        
        if 'mermaid2' not in plugin_names:
            config['plugins'].append({'mermaid2': {'version': '10.8.0'}})
            changes_made.append("Added mermaid2 plugin for enhanced diagram support")
    
    # Fix navigation
    if not config.get('nav'):
        config['nav'] = [{'Home': 'index.md'}]
        changes_made.append("nav: None → [{'Home': 'index.md'}]")
    
    # Ensure site_name
    if not config.get('site_name'):
        config['site_name'] = 'Documentation'
        changes_made.append("site_name: None → 'Documentation'")
    
    # Report changes
    if changes_made:
        print("🔄 Configuration changes made:")
        for change in changes_made:
            print(f"  • {change}")
    else:
        print("✅ Configuration was already valid")
    
    # Write fixed config
    print("💾 Writing fixed configuration...")
    try:
        with open('mkdocs.yml', 'w') as f:
            yaml.dump(config, f, default_flow_style=False, sort_keys=False, indent=2)
        print("✅ Configuration successfully written")
    except Exception as e:
        print(f"❌ Failed to write config: {e}")
        return
    
    print("🎉 Configuration fixing completed!")

if __name__ == '__main__':
    fix_config()
EOF

RUN chmod +x /usr/local/bin/fix-config.py

# Create entrypoint that fixes config then runs mkdocs
RUN cat > /usr/local/bin/entrypoint.sh << 'EOF'
#!/bin/sh
set -e

echo "=== TechDocs Build Container ==="
echo "Working directory: $(pwd)"
echo "Command: mkdocs $*"
echo "Container image: backstage-techdocs:final"
echo "Python version: $(python --version)"
echo "MkDocs version: $(mkdocs --version)"

# Show environment info
echo ""
echo "=== Environment Information ==="
echo "User: $(whoami)"
echo "PWD: $(pwd)"
echo "Files in working directory:"
ls -la

# Fix configuration
if [ -f "mkdocs.yml" ]; then
    echo ""
    echo "=== Configuration Processing ==="
    echo "Original mkdocs.yml:"
    cat mkdocs.yml
    echo ""
    echo "Running configuration fixer..."
    /usr/local/bin/fix-config.py
    echo ""
    echo "Fixed mkdocs.yml:"
    cat mkdocs.yml
else
    echo "WARNING: No mkdocs.yml found!"
fi

# Handle docs directory
DOCS_DIR=$(grep '^docs_dir:' mkdocs.yml 2>/dev/null | cut -d: -f2 | xargs || echo "docs")
echo ""
echo "=== Directory Setup ==="
echo "Docs directory: $DOCS_DIR"

if [ ! -d "$DOCS_DIR" ]; then
    echo "Creating docs directory: $DOCS_DIR"
    mkdir -p "$DOCS_DIR"
    if [ -f "README.md" ]; then
        echo "Copying README.md to $DOCS_DIR/index.md"
        cp README.md "$DOCS_DIR/index.md"
    else
        echo "Creating placeholder index.md"
        echo "# Documentation" > "$DOCS_DIR/index.md"
    fi
else
    echo "Using existing docs directory"
fi

echo "Files in docs directory:"
ls -la "$DOCS_DIR/" || echo "Cannot list docs directory"

# Show final setup before build
echo ""
echo "=== Pre-Build Status ==="
echo "MkDocs configuration validation:"
mkdocs config-show 2>&1 || echo "Config validation failed"

echo ""
echo "=== Starting MkDocs Build ==="
echo "Running: mkdocs $*"
echo ""

# Run mkdocs with verbose output
exec mkdocs "$@" --verbose
EOF

RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
