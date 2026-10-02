"use client";

import { Box, Flex, Text, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { mockUser } from "@/data/mock/tenant";

/**
 * Users is a light placeholder module in the prototype: it shows the single
 * mock operator. Full user management is out of scope for this phase.
 */
export function UsersModule() {
  const users = [
    { ...mockUser, email: "christian@aybarrentcar.com", status: "Activo" },
  ];

  return (
    <Box p="20px" maxW="900px">
      <Text fontSize="18px" fontWeight="700" mb="2px">
        Usuarios
      </Text>
      <Text fontSize="13px" color="fg.muted" mb="16px">
        Operadores con acceso al panel.
      </Text>

      <Box border="1px solid" borderColor="canvas.border" borderRadius="8px" overflow="hidden">
        <Table size="sm" variant="simple">
          <Thead bg="canvas.subtle">
            <Tr>
              <Th fontSize="11px">Nombre</Th>
              <Th fontSize="11px">Email</Th>
              <Th fontSize="11px">Rol</Th>
              <Th fontSize="11px">Estado</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <Flex align="center" gap="8px">
                    <Flex
                      align="center"
                      justify="center"
                      w="24px"
                      h="24px"
                      borderRadius="999px"
                      bg="brand.500"
                      color="white"
                      fontSize="11px"
                      fontWeight="700"
                    >
                      {u.initials}
                    </Flex>
                    <Text fontSize="13px" fontWeight="600">
                      {u.name}
                    </Text>
                  </Flex>
                </Td>
                <Td fontSize="13px" color="fg.muted">
                  {u.email}
                </Td>
                <Td fontSize="13px">{u.role}</Td>
                <Td fontSize="13px" color="#1a7f37" fontWeight="600">
                  {u.status}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
