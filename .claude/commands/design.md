Run a quick Stitch design session for **$ARGUMENTS**.

## Steps

1. List existing Stitch projects with `list_projects` to check for an existing BudgetZTL project.
2. If no project exists, create one with `create_project(title: "BudgetZTL")`.
3. Generate a screen from the user's description:
   - Use `generate_screen_from_text` with `deviceType: "DESKTOP"` and `modelId: "GEMINI_3_1_PRO"`
   - Prompt should describe the UI in detail based on $ARGUMENTS
4. Show the result to the user and ask for feedback.
5. Iterate with `edit_screens` or `generate_variants` until satisfied.
6. If `output_components` contains suggestions, present them to the user.

This is a lightweight design command — for full feature specs, use `/project:pm` instead.
