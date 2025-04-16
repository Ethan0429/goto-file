m goto-file README

Navigate to files referenced in your text using Vim motions in VSCode.

## Overview

`goto-file` allows you to quickly open files mentioned in your text documents using familiar Vim navigation commands. For example, if you have a todo list with file references, you can place your cursor on a filename and use a Vim motion to open that file directly.

## Installation

1. Install this extension from the VSCode Marketplace
2. Ensure you have the [VSCodeVim](https://marketplace.visualstudio.com/items?itemName=vscodevim.vim) extension installed and enabled

## Setup

### 1. Configure Vim Keybinding

Add the following to your `settings.json` file (File > Preferences > Settings > Edit in settings.json):

```json
"vim.normalModeKeyBindingsNonRecursive": [
  {
    "before": ["g", "d"],
    "commands": ["vim-file-navigator.goToFile"]
  }
]
```

This example uses `gd` (go to file) as the keybinding, but you can choose any key combination you prefer. Other common choices include:
- `gf` (traditionally "go to definition")
- `gF` (uppercase F)
- `<leader>gf` (if you've configured a leader key)

### 2. Create Configuration File

Create a `.goto-file.toml` file in your project's root directory:

```toml
prefixes = [
  "/full/path/to/src",
  "/full/path/to/data",
  "full/path/to/docs"
]
```

The `prefixes` array should contain all directories where your referenced files might be located. The extension will search these directories in order when looking for a file.

**Note that paths must be absolute**

## Usage

1. Open a text file containing references to other files
2. Place your cursor on a filename (e.g., `config.json`, `main.py`, etc.)
3. In normal mode, press your configured keybinding (e.g., `gd`)
4. The referenced file will open if found in any of your configured directories

### Example

If you have a markdown file like:

```markdown
# Project Tasks
- Update the user schema in `schema.json`
- Fix the bug in `src/components/Button.js`
- Review the data in `users.csv`
```

## Known Limitations

- Currently only works with the vim extension and vim motions.
- Only absolute paths are allowed in `.goto-file.toml`.

## Planned Features/Changes

- Support for normal keybinds
- Support for relative paths