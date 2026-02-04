Theme Tokens and Theming

Token naming
- Base tokens: raw values in src/lib/theme/tokens.ts (colors, radii, shadows, fonts, fontWeights, lineHeights, letterSpacings, gradients)
- Semantic tokens: meaningful roles in src/lib/theme/tokens.ts under semanticTokens (bg.*, text.*, border.*, icon.*)
- Component usage: prefer semantic tokens in props (bg="bg.subtle", color="text.muted", borderColor="border.brand")

Adding tokens
1) Add raw values under tokens (e.g., colors.brand.700, shadows.modal).
2) Map semantic roles in semanticTokens to those base tokens.
3) Use semantic tokens in components instead of raw values.

Using tokens
- Chakra props: bg="bg.card", color="text.primary", boxShadow="card", lineHeight="body"
- Typography: fontFamily="display", letterSpacing="tight"
- Weights: fontWeight="medium", fontWeight="semibold"
- Spacing: use the Chakra space scale via numbers (e.g., mt={4} maps to space.4)
- Dark surfaces: color="text.onDark", color="text.onDarkMuted", borderColor="border.onDark"
- Gradients: bgGradient="var(--chakra-gradients-brand-sunset)"
- CSS: background-color: var(--chakra-colors-bg-canvas);

Light and dark themes
- Light/dark values are defined via semanticTokens using _light/_dark.
- Theme is applied by toggling html class "light" or "dark".
- Storage key: shattak-theme (localStorage).

Creating a new theme
1) Add a new semantic token set in src/lib/theme/tokens.ts with _light/_dark values.
2) Add a new theme class (e.g., "brandB") and update the theme init script to read it.
3) Toggle the class on document.documentElement to switch.
