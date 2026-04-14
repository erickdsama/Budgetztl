# Stitch MCP Integration

Stitch is a UI design and prototyping service exposed via MCP (Model Context Protocol). It enables AI-driven design workflows: creating projects, managing design systems, generating screens from text prompts, editing screens, and producing design variants — all without leaving the CLI.

## Available Tools

### Project Management

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects. Filter by `view=owned` (default) or `view=shared`. |
| `create_project` | Create a new project container for UI designs and frontend code. |
| `get_project` | Retrieve project details by resource name (`projects/{id}`). |

### Screen Operations

| Tool | Description |
|------|-------------|
| `list_screens` | List all screens within a project. |
| `get_screen` | Retrieve details of a specific screen (`projects/{project}/screens/{screen}`). |
| `generate_screen_from_text` | Generate a new screen from a text prompt. Takes a few minutes — do **not** retry. |
| `edit_screens` | Edit existing screens using a text prompt. Requires screen IDs. |
| `generate_variants` | Generate design variants of existing screens with configurable creativity. |

### Design Systems

| Tool | Description |
|------|-------------|
| `list_design_systems` | List all design systems for a project (or global if no project ID). |
| `create_design_system` | Create a new design system with colors, fonts, shapes, and appearance. Always call `update_design_system` immediately after. |
| `update_design_system` | Update an existing design system's theme tokens. |
| `apply_design_system` | Apply a design system to one or more screen instances. |

---

## Core Concepts

### Projects

A **project** is a container for screens and design systems. Every screen belongs to a project.

```
projects/{project_id}
projects/{project_id}/screens/{screen_id}
```

### Design Systems

A design system defines the visual foundation applied across screens:

- **Color palette**: Primary color (hex), color mode (LIGHT/DARK), color variant (MONOCHROME, NEUTRAL, TONAL_SPOT, VIBRANT, EXPRESSIVE, FIDELITY, CONTENT, RAINBOW, FRUIT_SALAD)
- **Typography**: Headline, body, and label fonts from the supported font set
- **Shape**: Corner roundness — `ROUND_FOUR`, `ROUND_EIGHT`, `ROUND_TWELVE`, `ROUND_FULL`
- **Design MD**: Free-form markdown with additional design instructions

**Supported fonts**: Inter, Geist, DM Sans, IBM Plex Sans, Manrope, Rubik, Sora, Montserrat, Plus Jakarta Sans, Space Grotesk, Work Sans, Nunito Sans, and many more.

### Screens

Screens are individual UI views within a project. They can be:

- **Generated** from text prompts (`generate_screen_from_text`)
- **Edited** via text instructions (`edit_screens`)
- **Varied** to explore design alternatives (`generate_variants`)

### Device Types

Screens target a specific device form factor:

| Value | Use case |
|-------|----------|
| `DESKTOP` | Full-width web layouts |
| `MOBILE` | Phone-sized layouts |
| `TABLET` | Tablet-sized layouts |
| `AGNOSTIC` | Device-independent designs |

### AI Models

Screen generation supports model selection:

| Value | Description |
|-------|-------------|
| `GEMINI_3_1_PRO` | Highest quality (recommended) |
| `GEMINI_3_FLASH` | Faster generation |

---

## Workflows

### 1. New Project Setup

```
1. create_project(title: "BudgetZTL")
2. create_design_system(projectId, designSystem: { ... })
3. update_design_system(name, projectId, designSystem: { ... })   # required after create
```

### 2. Generate Screens from Specs

```
1. generate_screen_from_text(projectId, prompt: "Dashboard showing monthly expenses...", deviceType: "DESKTOP")
2. get_screen(name) to verify the result
3. If output_components has suggestions, pass the accepted suggestion back to generate_screen_from_text
```

### 3. Iterate on Existing Screens

```
1. list_screens(projectId) to get screen IDs
2. edit_screens(projectId, selectedScreenIds: [...], prompt: "Move the sidebar to the left...")
```

### 4. Explore Design Alternatives

```
1. generate_variants(projectId, selectedScreenIds: [...], prompt: "Try different card layouts",
     variantOptions: { variantCount: 3, creativeRange: "EXPLORE", aspects: ["LAYOUT"] })
```

**Creative ranges**:
- `REFINE` — Subtle refinements, stays close to original
- `EXPLORE` — Balanced exploration (default)
- `REIMAGINE` — Radical departures from the original

**Variant aspects** (focus areas):
- `LAYOUT` — Element arrangement
- `COLOR_SCHEME` — Color palette
- `IMAGES` — Imagery
- `TEXT_FONT` — Typography
- `TEXT_CONTENT` — Copy/content

### 5. Apply Design System to Screens

```
1. list_design_systems(projectId) to get asset ID
2. get_project(name) to get screen instances (id + sourceScreen)
3. apply_design_system(projectId, selectedScreenInstances: [...], assetId)
```

---

## BudgetZTL Design System Reference

Recommended configuration for this project:

```json
{
  "displayName": "BudgetZTL Design System",
  "theme": {
    "colorMode": "LIGHT",
    "colorVariant": "TONAL_SPOT",
    "customColor": "#2563eb",
    "headlineFont": "INTER",
    "bodyFont": "INTER",
    "labelFont": "INTER",
    "roundness": "ROUND_EIGHT",
    "designMd": "Clean, minimal finance UI. Use whitespace generously. Data-dense tables and charts should remain readable. Emphasize hierarchy through font weight and color, not decoration."
  }
}
```

---

## Important Notes

- Screen generation can take **several minutes**. Never retry a generation call — if it times out, use `get_screen` to check if it completed.
- Always call `update_design_system` immediately after `create_design_system` to display it in the UI.
- Screen instance IDs (from `get_project`) are different from source screen IDs (from `list_screens`). Use the correct one for each tool.
- The `designMd` field in design systems accepts free-form markdown — use it for design intent that isn't captured by tokens alone.
