"use client";

import { Box, Flex, Button } from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

/**
 * Context panel (left) + workspace (right) layout shared by every admin module.
 * On desktop both panes are visible. On mobile only one is shown at a time:
 * the list first, then the workspace once an entity is selected, with a Back
 * control to return to the list.
 */
export function TwoPaneLayout({
  contextPanel,
  workspace,
  showWorkspaceOnMobile,
  onBack,
}: {
  contextPanel: React.ReactNode;
  workspace: React.ReactNode;
  showWorkspaceOnMobile: boolean;
  onBack: () => void;
}) {
  return (
    <Flex h="100%" minH={0} w="100%">
      {/* Context panel */}
      <Box
        w={{ base: "100%", md: "340px", xl: "360px" }}
        flexShrink={0}
        borderRight={{ base: "none", md: "1px solid" }}
        borderColor="canvas.border"
        h="100%"
        minH={0}
        display={{
          base: showWorkspaceOnMobile ? "none" : "flex",
          md: "flex",
        }}
        flexDirection="column"
        overflow="hidden"
      >
        {contextPanel}
      </Box>

      {/* Workspace */}
      <Box
        flex="1"
        minW={0}
        h="100%"
        minH={0}
        display={{
          base: showWorkspaceOnMobile ? "flex" : "none",
          md: "flex",
        }}
        flexDirection="column"
        overflow="hidden"
        bg="white"
      >
        <Box display={{ base: "block", md: "none" }} p="8px" borderBottom="1px solid" borderColor="canvas.borderMuted">
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<ArrowLeft size={15} />}
            onClick={onBack}
          >
            Volver
          </Button>
        </Box>
        <Box flex="1" minH={0} overflowY="auto">
          {workspace}
        </Box>
      </Box>
    </Flex>
  );
}
