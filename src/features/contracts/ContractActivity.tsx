"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import {
  FilePlus,
  Pencil,
  Send,
  Eye,
  MessageSquareWarning,
  UserCheck,
  Upload,
  PenLine,
  Truck,
  Undo2,
  CheckCircle2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { Contract, ContractEventType } from "@/types";
import { formatDateTime } from "@/lib/formatting/format";
import { EVENT_LABELS } from "@/types";

const ICONS: Record<ContractEventType, LucideIcon> = {
  CONTRACT_CREATED: FilePlus,
  CONTRACT_EDITED: Pencil,
  CONTRACT_SENT: Send,
  CONTRACT_VIEWED: Eye,
  CHANGES_REQUESTED: MessageSquareWarning,
  CUSTOMER_INFO_UPDATED: UserCheck,
  DOCUMENT_UPLOADED: Upload,
  CONTRACT_SIGNED: PenLine,
  CONTRACT_DELIVERED: Truck,
  CONTRACT_RETURNED: Undo2,
  CONTRACT_CLOSED: CheckCircle2,
  CONTRACT_CANCELLED: XCircle,
};

export function ContractActivity({ contract }: { contract: Contract }) {
  const events = [...contract.events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <Box p="20px" maxW="640px">
      <Text fontSize="14px" fontWeight="700" mb="16px">
        Actividad
      </Text>
      {events.length === 0 ? (
        <Text fontSize="13px" color="fg.muted">
          Sin actividad registrada.
        </Text>
      ) : (
        <Box position="relative" pl="8px">
          {events.map((e, i) => {
            const Icon = ICONS[e.type];
            const isLast = i === events.length - 1;
            return (
              <Flex key={e.id} gap="12px" position="relative" pb={isLast ? "0" : "18px"}>
                {!isLast && (
                  <Box
                    position="absolute"
                    left="13px"
                    top="26px"
                    bottom="0"
                    w="1px"
                    bg="canvas.border"
                  />
                )}
                <Flex
                  align="center"
                  justify="center"
                  w="28px"
                  h="28px"
                  borderRadius="999px"
                  bg="canvas.subtle"
                  border="1px solid"
                  borderColor="canvas.border"
                  color="fg.muted"
                  flexShrink={0}
                  zIndex={1}
                >
                  <Icon size={14} />
                </Flex>
                <Box pt="2px">
                  <Text fontSize="13px" fontWeight="600">
                    {EVENT_LABELS[e.type]}
                  </Text>
                  <Text fontSize="12px" color="fg.muted">
                    {e.description}
                  </Text>
                  <Text fontSize="11px" color="fg.subtle" mt="2px">
                    {e.actor} · {formatDateTime(e.at)}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
