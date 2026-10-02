"use client";

import * as Lucide from "lucide-react";
import { Check } from "lucide-react";

type IconComponent = React.ComponentType<{ size?: number | string; strokeWidth?: number }>;

/**
 * Renders a Lucide icon by its string name (as stored on the amenity).
 * Falls back to a check mark when the name isn't a valid icon.
 */
export function AmenityIcon({ name, size = 15 }: { name: string; size?: number }) {
  const icons = Lucide as unknown as Record<string, IconComponent>;
  const Icon = icons[name] && typeof icons[name] === "function" ? icons[name] : Check;
  return <Icon size={size} strokeWidth={2} />;
}
