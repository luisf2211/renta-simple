import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

/**
 * GitHub-inspired operational palette: flat, restrained, information-first.
 * Brand red mirrors the Aybar render accent; it is intentionally used
 * sparingly for primary actions and status accents only.
 */
export const theme = extendTheme({
  config,
  fonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  fontSizes: {
    xs: "11px",
    sm: "12px",
    md: "13px",
    lg: "15px",
    xl: "18px",
    "2xl": "22px",
  },
  colors: {
    brand: {
      50: "#fef2f2",
      100: "#fde3e3",
      500: "#e5312f",
      600: "#d12523",
      700: "#b01d1b",
    },
    canvas: {
      sidebar: "#1f2328",
      sidebarHover: "#2d333b",
      border: "#d0d7de",
      borderMuted: "#e4e8ec",
      subtle: "#f6f8fa",
      accent: "#fff8f7",
    },
    fg: {
      default: "#1f2328",
      muted: "#656d76",
      subtle: "#8c959f",
    },
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "fg.default",
        fontSize: "md",
        lineHeight: "1.45",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: "6px",
      },
      sizes: {
        sm: { fontSize: "12px", h: "30px", px: "10px" },
        md: { fontSize: "13px", h: "34px", px: "12px" },
      },
      defaultProps: {
        size: "sm",
      },
    },
    Input: {
      defaultProps: { size: "sm", focusBorderColor: "brand.500" },
    },
    Select: {
      defaultProps: { size: "sm", focusBorderColor: "brand.500" },
    },
    Textarea: {
      defaultProps: { size: "sm", focusBorderColor: "brand.500" },
    },
    NumberInput: {
      defaultProps: { size: "sm", focusBorderColor: "brand.500" },
    },
  },
});
