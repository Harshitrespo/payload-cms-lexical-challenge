# Payload CMS Lexical Challenge

This project implements a custom Mark (Highlight) feature for Payload CMS's Lexical editor as part of a coding challenge. The template comes configured with the bare minimum to get started plus our custom highlighting functionality.

## Custom Mark (Highlight) Feature Implementation

This project includes a fully functional custom Mark/Highlight feature for the Payload CMS Lexical editor with the following capabilities:

### Features Implemented

- **Custom Toolbar Button**: FontAwesome highlighter icon positioned between strikethrough and subscript buttons
- **Text Highlighting**: Highlights selected text with Material Design Yellow **(#ffeb3b)** background and black text for readability
- **Active State Detection**: Comprehensive detection of highlighted text including:
  - Lexical node inline styles
  - DOM element computed and inline styles
  - Parent element traversal for nested highlighting
  - Support for double-click text selection
- **Toggle Functionality**: Click to highlight, click again to remove highlighting
- **HTML Serialization**: Properly serializes to `<mark>` HTML tags
- **Selection Preservation**: Maintains text selection after toggling highlight state
- **Event Handling**: Multiple event listeners for selection changes, mouse events, and double-click support
- **Performance Optimized**: Uses React useCallback for event handlers and proper cleanup

### Technical Implementation

#### File Structure

```
src/
├── constant.ts                           # Shared highlight color constants
├── collections/
│   └── Posts.ts                         # Collection config with MarkFeature
└── lexical/
    ├── features/
    │   ├── mark.client.tsx              # Client-side feature configuration
    │   └── markFeature.server.ts        # Server-side feature configuration
    ├── nodes/
    │   └── MarkNode.ts                  # Custom Lexical node extending TextNode
    └── plugins/
        └── MarkToolbarButton.tsx        # React toolbar button component
```

#### Key Components

1. **MarkNode.ts**: Custom Lexical TextNode that handles DOM creation, updates, and HTML serialization
2. **MarkToolbarButton.tsx**: React component with comprehensive active state detection and toggle functionality
3. **mark.client.tsx**: Client-side feature configuration with toolbar integration
4. **markFeature.server.ts**: Server-side feature registration
5. **Posts.ts**: Collection configuration integrating the MarkFeature with default Payload features

### Loom Video

📹 **[Custom Mark Implementation Demo](https://www.loom.com/share/5102a733d9d443598b6ca106cb1f935c?sid=90c30ecc-3e91-43a6-9212-2badaee753dc)**

_Watch the complete implementation walkthrough including feature demonstration and testing of all functionality._

### Usage

1. Select any text in the Lexical editor
2. Click the highlighter button in the toolbar (between strikethrough and subscript)
3. Text will be highlighted with yellow background
4. Click the button again to remove highlighting
