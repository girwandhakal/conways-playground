import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CellColorMode } from '../types';

interface GridProps {
  grid: Set<string>;
  rows: number;
  cols: number;
  onToggleCell: (r: number, c: number) => void;
  onPaintCell: (r: number, c: number) => void;
  colorMode: CellColorMode;
  cellColor: string;
  generation: number;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function rgbToHue(r: number, g: number, b: number) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === rNorm) {
    hue = ((gNorm - bNorm) / delta) % 6;
  } else if (max === gNorm) {
    hue = (bNorm - rNorm) / delta + 2;
  } else {
    hue = (rNorm - gNorm) / delta + 4;
  }

  return Math.round(hue * 60 < 0 ? hue * 60 + 360 : hue * 60);
}

function hexToHue(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHue(r, g, b);
}

function hashCell(r: number, c: number) {
  return Math.abs(((r + 1) * 73856093) ^ ((c + 1) * 19349663));
}

function getCellFillColor(
  mode: CellColorMode,
  baseColor: string,
  r: number,
  c: number,
  rows: number,
  cols: number,
  generation: number,
  animationTime: number
) {
  const baseHue = hexToHue(baseColor);
  const hash = hashCell(r, c);

  if (mode === 'solid') {
    return baseColor;
  }

  if (mode === 'rainbow') {
    const boardOffset = ((r / Math.max(1, rows)) + (c / Math.max(1, cols))) * 140;
    const hue = (baseHue + boardOffset + generation * 5 + animationTime * 0.015) % 360;
    return `hsl(${hue} 84% 42%)`;
  }

  if (mode === 'multicolor') {
    const hue = (baseHue + (hash % 210)) % 360;
    return `hsl(${hue} 76% 38%)`;
  }

  if (mode === 'flashing') {
    const pulse = (Math.sin(animationTime / 220) + 1) / 2;
    const lightness = 20 + pulse * 26;
    return `hsl(${baseHue} 80% ${lightness}%)`;
  }

  const cycle = Math.floor(animationTime / 180);
  const hue = (baseHue + hash + cycle * 47 + generation * 13) % 360;
  const saturation = 72 + (hash % 12);
  const lightness = 28 + ((hash >> 3) % 18);
  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export const Grid: React.FC<GridProps> = ({
  grid,
  rows,
  cols,
  onToggleCell,
  onPaintCell,
  colorMode,
  cellColor,
  generation,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAnimationFrame = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, cellSize: 0 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const [animationTime, setAnimationTime] = useState(0);
  const startMousePos = useRef({ x: 0, y: 0 });
  const lastPaintedCell = useRef<{ r: number, c: number } | null>(null);

  const dpr = typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1;
  const gridLineThickness = 1 / dpr;
  const snapToDevicePixel = useCallback((value: number) => {
    return Math.round(value * dpr) / dpr;
  }, [dpr]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const availableSize = Math.max(0, Math.min(width, height) - 40);
      const availablePixels = Math.floor(availableSize * dpr);
      const boardWidth = Math.max(cols, Math.floor(availablePixels / cols) * cols) / dpr;
      const boardHeight = Math.max(rows, Math.floor(availablePixels / rows) * rows) / dpr;

      setDimensions({
        width: boardWidth,
        height: boardHeight,
        cellSize: Math.min(boardWidth / cols, boardHeight / rows),
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [rows, cols, dpr]);

  useEffect(() => {
    const isAnimatedMode = colorMode === 'rainbow' || colorMode === 'flashing' || colorMode === 'random';
    if (!isAnimatedMode) {
      setAnimationTime(0);
      return;
    }

    let frameId = 0;
    const step = (time: number) => {
      if (time - lastAnimationFrame.current > 48) {
        lastAnimationFrame.current = time;
        setAnimationTime(time);
      }
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [colorMode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const translateX = snapToDevicePixel(dimensions.width / 2 + pan.x);
    const translateY = snapToDevicePixel(dimensions.height / 2 + pan.y);
    ctx.translate(translateX, translateY);
    ctx.scale(scale, scale);
    ctx.translate(-dimensions.width / 2, -dimensions.height / 2);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const { cellSize } = dimensions;

    ctx.fillStyle = '#D7DEE7';
    for (let r = 0; r <= rows; r++) {
      ctx.fillRect(0, r * cellSize, cols * cellSize, gridLineThickness / scale);
    }
    for (let c = 0; c <= cols; c++) {
      ctx.fillRect(c * cellSize, 0, gridLineThickness / scale, rows * cellSize);
    }

    const gap = cellSize > 6 ? gridLineThickness / scale : 0;

    for (const key of grid) {
      const [rStr, cStr] = key.split(',');
      const r = Number.parseInt(rStr, 10);
      const c = Number.parseInt(cStr, 10);

      ctx.fillStyle = getCellFillColor(colorMode, cellColor, r, c, rows, cols, generation, animationTime);
      ctx.fillRect(c * cellSize + gap, r * cellSize + gap, cellSize - gap * 2, cellSize - gap * 2);
    }
  }, [animationTime, cellColor, colorMode, dimensions, dpr, generation, grid, rows, cols, scale, pan, snapToDevicePixel]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCellFromEvent = (e: { clientX: number, clientY: number }) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const x = (mouseX - (dimensions.width / 2 + pan.x)) / scale + dimensions.width / 2;
    const y = (mouseY - (dimensions.height / 2 + pan.y)) / scale + dimensions.height / 2;

    const r = Math.floor(y / dimensions.cellSize);
    const c = Math.floor(x / dimensions.cellSize);

    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      return { r, c };
    }
    return null;
  };

  const maxZoom = Math.max(8, rows / 4);

  const handleWheel = (e: React.WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;
    const delta = -e.deltaY;
    const zoomSpeed = 0.0015;
    const oldScale = scale;
    const newScale = Math.min(Math.max(scale + delta * zoomSpeed * scale, 1), maxZoom);

    if (newScale === oldScale) return;

    const ratio = newScale / oldScale;
    let newPanX = pan.x - (mouseX - pan.x) * (ratio - 1);
    let newPanY = pan.y - (mouseY - pan.y) * (ratio - 1);

    const limitX = Math.max(0, (dimensions.width * newScale - dimensions.width) / 2);
    const limitY = Math.max(0, (dimensions.height * newScale - dimensions.height) / 2);

    newPanX = Math.min(Math.max(newPanX, -limitX), limitX);
    newPanY = Math.min(Math.max(newPanY, -limitY), limitY);

    setScale(newScale);
    setPan({ x: snapToDevicePixel(newPanX), y: snapToDevicePixel(newPanY) });

    if (newScale === 1) {
      setPan({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const isPanning = e.altKey || e.metaKey || (scale > 1 && e.shiftKey);

    if (isPanning) {
      setIsDragging(false);
      startMousePos.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };

      const onMouseMove = (moveEvent: MouseEvent) => {
        setIsDragging(true);
        let newX = moveEvent.clientX - startMousePos.current.x;
        let newY = moveEvent.clientY - startMousePos.current.y;
        const limitX = Math.max(0, (dimensions.width * scale - dimensions.width) / 2);
        const limitY = Math.max(0, (dimensions.height * scale - dimensions.height) / 2);
        newX = Math.min(Math.max(newX, -limitX), limitX);
        newY = Math.min(Math.max(newY, -limitY), limitY);
        setPan({ x: snapToDevicePixel(newX), y: snapToDevicePixel(newY) });
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setTimeout(() => setIsDragging(false), 50);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      let moved = false;
      const initialCell = getCellFromEvent(e);
      lastPaintedCell.current = initialCell;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const cell = getCellFromEvent(moveEvent);
        if (!cell) return;

        if (!moved && initialCell && (cell.r !== initialCell.r || cell.c !== initialCell.c)) {
          moved = true;
          setIsPainting(true);
          onPaintCell(initialCell.r, initialCell.c);
        }

        if (moved && (cell.r !== lastPaintedCell.current?.r || cell.c !== lastPaintedCell.current?.c)) {
          onPaintCell(cell.r, cell.c);
          lastPaintedCell.current = cell;
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        if (!moved && initialCell) {
          onToggleCell(initialCell.r, initialCell.c);
        }

        lastPaintedCell.current = null;
        setTimeout(() => setIsPainting(false), 50);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      let moved = false;
      const initialCell = getCellFromEvent({ clientX: touch.clientX, clientY: touch.clientY });
      lastPaintedCell.current = initialCell;

      const onTouchMove = (moveEvent: TouchEvent) => {
        const moveTouch = moveEvent.touches[0];
        const cell = getCellFromEvent({ clientX: moveTouch.clientX, clientY: moveTouch.clientY });
        if (!cell) return;

        if (!moved && initialCell && (cell.r !== initialCell.r || cell.c !== initialCell.c)) {
          moved = true;
          setIsPainting(true);
          onPaintCell(initialCell.r, initialCell.c);
        }

        if (moved && (cell.r !== lastPaintedCell.current?.r || cell.c !== lastPaintedCell.current?.c)) {
          onPaintCell(cell.r, cell.c);
          lastPaintedCell.current = cell;
        }
      };

      const onTouchEnd = () => {
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);

        if (!moved && initialCell) {
          onToggleCell(initialCell.r, initialCell.c);
        }

        lastPaintedCell.current = null;
        setTimeout(() => setIsPainting(false), 50);
      };

      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center bg-transparent overflow-hidden touch-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width * dpr}
          height={dimensions.height * dpr}
          style={{ width: dimensions.width, height: dimensions.height }}
          className="cursor-crosshair block shadow-xl border border-slate-200 bg-white"
        />
      </div>
    </div>
  );
};
