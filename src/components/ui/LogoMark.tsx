"use client";

import { Box, Flex, Text } from "@chakra-ui/react";

interface LogoMarkProps {
  label?: string;
  /** Uploaded logo image URL; when present, it is shown instead of the wordmark. */
  imageUrl?: string;
  /** "light" for dark backgrounds (sidebar), "dark" for white backgrounds. */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

/**
 * Lightweight Aybar wordmark drawn with a small car silhouette. Keeps the
 * prototype free of binary logo assets while matching the render's spirit.
 * Branding text comes from props (fed by tenant), never hardcoded in features.
 */
export function LogoMark({ label = "AYBAR", imageUrl, variant = "dark", size = "md" }: LogoMarkProps) {
  const red = "#e5312f";
  const text = variant === "light" ? "#ffffff" : "#1f2328";
  const sizes = {
    sm: { icon: 18, title: "13px", sub: "8px", img: "26px" },
    md: { icon: 22, title: "16px", sub: "9px", img: "34px" },
    lg: { icon: 30, title: "22px", sub: "11px", img: "48px" },
  }[size];

  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt={label}
        style={{ height: sizes.img, width: "auto", maxWidth: "160px", objectFit: "contain" }}
      />
    );
  }

  return (
    <Flex align="center" gap="8px">
      <Box as="span" color={red} lineHeight="0">
        <svg
          width={sizes.icon}
          height={sizes.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M3 13 l2 -5 a2 2 0 0 1 1.9 -1.3 h10.2 a2 2 0 0 1 1.8 1.1 L21 13" />
          <path d="M3 13 h18 v4 a1 1 0 0 1 -1 1 h-1 a1 1 0 0 1 -1 -1 M6 18 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 v-4" />
          <circle cx="7.5" cy="17.5" r="1.3" fill="currentColor" />
          <circle cx="16.5" cy="17.5" r="1.3" fill="currentColor" />
        </svg>
      </Box>
      <Box>
        <Text
          fontWeight="800"
          fontSize={sizes.title}
          letterSpacing="0.08em"
          color={text}
          lineHeight="1"
        >
          {label}
        </Text>
        <Text
          fontWeight="600"
          fontSize={sizes.sub}
          letterSpacing="0.28em"
          color={variant === "light" ? "rgba(255,255,255,0.6)" : "fg.muted"}
          lineHeight="1.4"
        >
          RENT CAR
        </Text>
      </Box>
    </Flex>
  );
}
