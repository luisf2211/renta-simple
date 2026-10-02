"use client";

import {
  Box,
  Flex,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  Send,
  Pencil,
  MoreHorizontal,
  ChevronDown,
  Mail,
  MessageCircle,
  Link2,
  ExternalLink,
  FileText,
  Printer,
  Copy,
  Truck,
  Undo2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Contract } from "@/types";
import { useDemoStore } from "@/store/demo-store";
import { ContractStatusBadge } from "@/components/ui/StatusBadge";
import { useContractActions } from "./useContractActions";
import { formatDateTime } from "@/lib/formatting/format";

export function ContractHeader({
  contract,
  onEdit,
  onDuplicate,
}: {
  contract: Contract;
  onEdit: () => void;
  onDuplicate: () => void;
}) {
  const { getCustomer, getVehicle } = useDemoStore();
  const customer = getCustomer(contract.customerId);
  const vehicle = getVehicle(contract.vehicleId);
  const actions = useContractActions();

  const status = contract.status;
  const canSend = !["SIGNED", "DELIVERED", "RETURNED", "CLOSED", "CANCELLED"].includes(status);
  const canDeliver = status === "SIGNED";
  const canReturn = status === "DELIVERED";
  const canClose = status === "RETURNED";
  const canCancel = ["DRAFT", "SENT", "VIEWED", "CHANGES_REQUESTED"].includes(status);
  const isSigned = ["SIGNED", "DELIVERED", "RETURNED", "CLOSED"].includes(status);

  return (
    <Box
      px="20px"
      py="14px"
      borderBottom="1px solid"
      borderColor="canvas.border"
      bg="white"
    >
      <Flex justify="space-between" align="flex-start" gap="12px" wrap="wrap">
        <Box minW={0}>
          <Flex align="center" gap="10px" mb="3px" wrap="wrap">
            <Text fontSize="20px" fontWeight="800" lineHeight="1">
              {contract.contractNumber}
            </Text>
            <ContractStatusBadge status={status} size="md" />
          </Flex>
          <Text fontSize="13px" color="fg.muted">
            {customer?.fullName ?? "—"} ·{" "}
            {vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : "—"}
          </Text>
          <Text fontSize="11px" color="fg.subtle" mt="2px">
            Creado el {formatDateTime(contract.createdAt)} por Christian
          </Text>
        </Box>

        <Flex gap="8px" flexShrink={0}>
          {canSend && (
            <Menu placement="bottom-end">
              <MenuButton
                as={Button}
                size="sm"
                colorScheme="red"
                bg="brand.500"
                _hover={{ bg: "brand.600" }}
                leftIcon={<Send size={14} />}
                rightIcon={<ChevronDown size={14} />}
              >
                Enviar
              </MenuButton>
              <MenuList fontSize="13px" minW="200px">
                <MenuItem icon={<Mail size={15} />} onClick={() => void actions.sendByEmail(contract)}>
                  Enviar por email
                </MenuItem>
                <MenuItem
                  icon={<MessageCircle size={15} />}
                  onClick={() => actions.openWhatsApp(contract, customer?.phone ?? "")}
                >
                  Abrir WhatsApp
                </MenuItem>
                <MenuItem icon={<Link2 size={15} />} onClick={() => void actions.copyLink(contract)}>
                  Copiar enlace
                </MenuItem>
              </MenuList>
            </Menu>
          )}

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Pencil size={14} />}
            onClick={onEdit}
            isDisabled={isSigned}
          >
            Editar
          </Button>

          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              size="sm"
              variant="outline"
              leftIcon={<MoreHorizontal size={16} />}
            >
              Más
            </MenuButton>
            <MenuList fontSize="13px" minW="220px">
              <MenuItem
                as={NextLink}
                href={`/c/${contract.token}`}
                target="_blank"
                icon={<ExternalLink size={15} />}
              >
                Vista del cliente
              </MenuItem>
              {isSigned && (
                <MenuItem
                  as={NextLink}
                  href={`/c/${contract.token}/document`}
                  target="_blank"
                  icon={<FileText size={15} />}
                >
                  Vista previa del contrato
                </MenuItem>
              )}
              {isSigned && (
                <MenuItem
                  as={NextLink}
                  href={`/c/${contract.token}/document?print=1`}
                  target="_blank"
                  icon={<Printer size={15} />}
                >
                  Descargar / imprimir
                </MenuItem>
              )}
              <MenuItem icon={<Copy size={15} />} onClick={onDuplicate}>
                Duplicar
              </MenuItem>

              {(canDeliver || canReturn || canClose) && <MenuDivider />}
              {canDeliver && (
                <MenuItem icon={<Truck size={15} />} onClick={() => actions.registerDelivery(contract)}>
                  Registrar entrega
                </MenuItem>
              )}
              {canReturn && (
                <MenuItem icon={<Undo2 size={15} />} onClick={() => actions.registerReturn(contract)}>
                  Registrar devolución
                </MenuItem>
              )}
              {canClose && (
                <MenuItem icon={<CheckCircle2 size={15} />} onClick={() => actions.closeContract(contract)}>
                  Cerrar contrato
                </MenuItem>
              )}

              {canCancel && (
                <>
                  <MenuDivider />
                  <MenuItem
                    icon={<XCircle size={15} />}
                    color="brand.600"
                    onClick={() => actions.cancelContract(contract)}
                  >
                    Cancelar
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}
