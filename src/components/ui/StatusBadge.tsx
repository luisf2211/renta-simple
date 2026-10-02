"use client";

import { Box, Flex } from "@chakra-ui/react";
import type { ContractStatus, VehicleStatus } from "@/types";
import { CONTRACT_STATUS_LABELS, VEHICLE_STATUS_LABELS } from "@/types";

type Tone = {
  dot: string;
  fg: string;
  bg: string;
  border: string;
};

const CONTRACT_TONES: Record<ContractStatus, Tone> = {
  DRAFT: tone("#8c959f", "#57606a"),
  SENT: tone("#bf8700", "#9a6700"),
  VIEWED: tone("#0969da", "#0969da"),
  CHANGES_REQUESTED: tone("#bc4c00", "#bc4c00"),
  SIGNED: tone("#1a7f37", "#1a7f37"),
  DELIVERED: tone("#8250df", "#8250df"),
  RETURNED: tone("#0969da", "#0969da"),
  CLOSED: tone("#57606a", "#57606a"),
  CANCELLED: tone("#cf222e", "#cf222e"),
  EXPIRED: tone("#57606a", "#57606a"),
};

const VEHICLE_TONES: Record<VehicleStatus, Tone> = {
  AVAILABLE: tone("#1a7f37", "#1a7f37"),
  RENTED: tone("#8250df", "#8250df"),
  MAINTENANCE: tone("#bf8700", "#9a6700"),
};

function tone(dot: string, fg: string): Tone {
  return { dot, fg, bg: `${hexToRgba(dot, 0.1)}`, border: hexToRgba(dot, 0.3) };
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ContractStatusBadge({
  status,
  size = "sm",
}: {
  status: ContractStatus;
  size?: "sm" | "md";
}) {
  const t = CONTRACT_TONES[status];
  // AR-1058 render shows "Pendiente de firma" for SENT/VIEWED states.
  const label =
    status === "SENT" || status === "VIEWED"
      ? "Pendiente de firma"
      : CONTRACT_STATUS_LABELS[status];
  return <Badge tone={t} label={label} size={size} />;
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <Badge tone={VEHICLE_TONES[status]} label={VEHICLE_STATUS_LABELS[status]} size="sm" />;
}

function Badge({ tone: t, label, size }: { tone: Tone; label: string; size: "sm" | "md" }) {
  return (
    <Flex
      as="span"
      align="center"
      gap="6px"
      bg={t.bg}
      color={t.fg}
      border="1px solid"
      borderColor={t.border}
      borderRadius="999px"
      px={size === "md" ? "10px" : "8px"}
      py={size === "md" ? "3px" : "2px"}
      fontSize={size === "md" ? "12px" : "11px"}
      fontWeight="600"
      whiteSpace="nowrap"
      lineHeight="1.2"
    >
      <Box as="span" w="7px" h="7px" borderRadius="999px" bg={t.dot} flexShrink={0} />
      {label}
    </Flex>
  );
}
