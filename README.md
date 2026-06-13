# GroupMark — Bookmark Groups

A Chrome extension for grouping bookmarks, opening them all at once, and saving your tabs as reusable collections.

## Features

- **Save entire windows** — Capture all open tabs in the current window as a named group with one click.
- **Organise with groups** — Create empty groups and add bookmarks manually, rename, duplicate, or delete groups.
- **Open all at once** — Launch every bookmark in a group as a Chrome tab group (or as background tabs if Chrome grouping isn't available).
- **Rich bookmark management** — Add, edit, remove, and search bookmarks within each group.
- **Color coding** — Assign one of six accent colors to each group for quick visual identification.
- **Backup & restore** — Export your groups as JSON and import them later.

## Tech stack

- **React 19** with hooks-based state management
- **Material UI 7** for the component library
- **Vite 7** as the build tool
- **Chrome Extensions API** (tabs, storage, tabGroups)

## Project structure

```
src/
├── App.jsx                  # Root component – wires hooks to UI
├── App.css                  # Global styles
├── index.css                # Base resets
├── main.jsx                 # Entry point
├── theme.js                 # MUI theme config + GROUP_COLORS
├── components/
│   ├── AppParts/            # UI sections (Header, Sidebar, DetailPane, etc.)
│   ├── ErrorBoundary.jsx    # Production error boundary
│   └── Logo/                # Logo component
├── hooks/                   # Custom hooks (groups, search, backup, etc.)
│   ├── index.js
│   ├── useGroups.js
│   ├── useGroupActions.js
│   ├── useSearch.js
│   ├── useUrlForm.js
│   ├── useBackup.js
│   ├── useNotice.js
│   └── useEditingState.js
└── utils/
    ├── index.js             # Chrome APIs, normalization, persistence, filtering
    └── groupsHelper.js      # (deprecated – consolidated into utils/index.js)
    └── storageHelper.js     # (deprecated – consolidated into utils/index.js)
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (with HMR)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview

# Run ESLint
npm run lint
```

The built extension is in the `dist/` directory. Load it in Chrome via **Extensions → Load unpacked** and point it to `dist/`.

## Extension permissions

The manifest requests the following permissions:

- `tabs` — To read and create tabs in the current window.
- `storage` — To persist groups locally using `chrome.storage.local`.
- `activeTab` — To read the currently active tab's URL and title.
- `unlimitedStorage` — So large backups are not rejected by the storage quota.
