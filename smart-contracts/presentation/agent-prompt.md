# Agent Prompt: Generate Google Slides Presentation

## Your Task

Create a Google Slides presentation for a Cardano developer tutorial titled **"Smart Contracts on Cardano with Aiken"**. The presentation is part of the Cardano Ambassador Program (CAP) 2026.

## Source Content

All slide content is in the file `slides-content.md` in this directory. It contains 18 slides with:
- Titles, body content, and layout hints for each slide
- Speaker notes for the presenter
- Visual suggestions describing diagrams/graphics to include
- A recommended color scheme

## Design Requirements

### Color Scheme
- **Background:** Dark navy (#1a1a2e) or deep charcoal (#16213e)
- **Primary accent:** Cardano blue (#0033ad)
- **Secondary accent:** Light blue (#00d2ff) for highlights
- **Text:** White (#ffffff) for body, light gray (#e0e0e0) for secondary
- **Code blocks:** Dark background (#0d1117) with syntax-highlighted monospace text
- **Warning/error:** Coral red (#ff6b6b) for security warnings

### Typography
- **Titles:** Bold sans-serif, 36-44pt (e.g., Montserrat, Inter, or Open Sans)
- **Body text:** Regular sans-serif, 18-24pt
- **Code samples:** Monospace, 14-16pt (e.g., Source Code Pro, JetBrains Mono)
- **Keep text concise** - bullets should be short phrases, not paragraphs

### Layout Rules
- Maximum 6 bullet points per slide
- Use icons/emojis sparingly for visual markers
- Leave generous whitespace - don't crowd the slides
- Diagrams should be large and central
- Use consistent margins and padding across all slides

### Slide Layouts
The content specifies layout types:
- **title**: Full-width title + subtitle, centered. Used for opening/closing slides.
- **title_and_body**: Title at top, bullet list or content below.
- **two_column**: Title at top, two equal columns below. Good for comparisons.

## Visual Elements

For each slide with a `visual_suggestion`, create or describe the diagram/visual. Options:
1. **ASCII/text diagrams** rendered as code blocks (simplest)
2. **Mermaid diagrams** embedded or linked (if the tool supports it)
3. **Description for manual creation** (if neither is feasible)

Key diagrams to produce:
- Slide 3: Ethereum vs Cardano comparison table
- Slide 4: UTXO model with inline datums
- Slide 6: Validator anatomy (datum, redeemer, context)
- Slide 7: Transaction execution with collateral
- Slide 9: Locking ADA to script
- Slide 10: Unlocking with redeemer
- Slide 12: CIP-68 token pair structure
- Slide 14: Updating token metadata flow

## How to Generate

### Option A: Google Apps Script (Preferred)
Generate a Google Apps Script that:
1. Creates a new Google Slides presentation
2. Applies the color scheme and fonts
3. Creates each slide with the specified layout
4. Adds speaker notes to each slide
5. Can be run from Google Apps Script editor (script.google.com)

### Option B: Python with python-pptx
Generate a Python script using the `python-pptx` library that:
1. Creates a .pptx file with all 18 slides
2. Applies styling (colors, fonts, layouts)
3. Includes speaker notes
4. The .pptx can then be uploaded to Google Slides

### Option C: Structured JSON Export
Generate a JSON file with all slide data that can be consumed by either approach:
```json
{
  "presentation": {
    "title": "Smart Contracts on Cardano with Aiken",
    "theme": { "colors": {...}, "fonts": {...} },
    "slides": [
      {
        "id": 1,
        "layout": "title",
        "title": "...",
        "subtitle": "...",
        "body": [...],
        "speaker_notes": "...",
        "visual": { "type": "diagram", "content": "..." }
      }
    ]
  }
}
```

## Output

Produce **Option A** (Google Apps Script) as the primary deliverable, with the JSON structure (Option C) as a secondary output for flexibility.

## Important Notes

- The audience is developers experienced in programming but new to Cardano smart contracts
- Keep the tone professional but approachable
- Emphasize visual learning - diagrams > walls of text
- Code examples should be syntax-highlighted where possible
- The presentation accompanies a live coding demo using a Spring Boot + cardano-client-lib project
- Include the Cardano logo or branding elements where appropriate
- Add slide numbers to all slides except the title slide
- Focus on explaining eUTXO model as the foundation for understanding smart contracts
- Show security considerations as important learning points
