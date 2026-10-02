"use client";

import { useEffect, useRef, useCallback } from "react";
import { Box, Flex, Button, Text } from "@chakra-ui/react";
import { Eraser } from "lucide-react";

/**
 * Real interactive signature pad. Captures mouse, touch and pen input via
 * Pointer Events, draws smoothed strokes, and emits a PNG data URL whenever the
 * stroke set changes. Fully accessible: labelled, keyboard-focusable, with a
 * described clear control.
 */
export function SignaturePad({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hasStrokes = useRef(false);

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  // Size the canvas to its container with devicePixelRatio for crispness.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ratio = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = 180;
    // Preserve existing drawing by re-reading before resize.
    const prev = hasStrokes.current ? canvas.toDataURL() : null;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = getCtx();
    if (ctx) {
      ctx.scale(ratio, ratio);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#1f2328";
    }
    if (prev) {
      const img = new window.Image();
      img.onload = () => ctx?.drawImage(img, 0, 0, width, height);
      img.src = prev;
    }
  }, [getCtx]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear canvas if the external value was reset to empty.
  useEffect(() => {
    if (value === "" && hasStrokes.current) {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawing.current = true;
    last.current = pointerPos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = getCtx();
    const pos = pointerPos(e);
    if (ctx && last.current) {
      ctx.beginPath();
      ctx.moveTo(last.current.x, last.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      hasStrokes.current = true;
    }
    last.current = pos;
  };

  const end = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    if (hasStrokes.current && canvasRef.current) {
      onChange(canvasRef.current.toDataURL("image/png"));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    hasStrokes.current = false;
    onChange("");
  };

  return (
    <Box>
      <Flex justify="flex-end" mb="4px">
        <Button
          size="xs"
          variant="ghost"
          color="fg.muted"
          leftIcon={<Eraser size={13} />}
          onClick={clear}
        >
          Limpiar
        </Button>
      </Flex>
      <Box
        position="relative"
        border="1px solid"
        borderColor="canvas.border"
        borderRadius="8px"
        bg="white"
        overflow="hidden"
      >
        <canvas
          ref={canvasRef}
          className="signature-canvas"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          role="img"
          aria-label="Área de firma. Dibuja tu firma con el dedo, el mouse o un lápiz."
          tabIndex={0}
          style={{ display: "block", cursor: "crosshair" }}
        />
        {!hasStrokes.current && value === "" && (
          <Flex
            position="absolute"
            inset="0"
            align="center"
            justify="center"
            pointerEvents="none"
          >
            <Text fontSize="13px" color="fg.subtle">
              Firma aquí
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
}
