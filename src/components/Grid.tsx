import React, { useRef, useEffect, useCallback, useState } from 'react';

interface GridProps {
  grid: Set<string>;
  rows: number;
  cols: number;
  onToggleCell: (r: number, c: number) => void;
  onPaintCell: (r: number, c: number) => void;
}

export const Grid: React.FC<GridProps> = ({ grid, rows, cols, onToggleCell, onPaintCell }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, cellSize: 0 });

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const startMousePos = useRef({ x: 0, y: 0 });
  const lastPaintedCell = useRef<{ r: number, c: number } | null>(null);

  // High-resolution multiplier for "SVG-like" sharpness
  const dpr = 4;

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      const size = Math.min(width, height) - 40; // Padding
      setDimensions({
        width: size,
        height: size,
        cellSize: size / rows
      });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [rows]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set native resolution scale
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    
    // Calculate internal transform
    // We want to scale around the center, applying our pan
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Apply viewport transform (zoom/pan)
    // We center the canvas coordinate system, apply transform, then move back
    ctx.translate(dimensions.width / 2 + pan.x, dimensions.height / 2 + pan.y);
    ctx.scale(scale, scale);
    ctx.translate(-dimensions.width / 2, -dimensions.height / 2);

    // Draw canvas background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const { cellSize } = dimensions;

    // Draw subtle dot pattern background
    ctx.fillStyle = '#F1F5F9';
    const dotSpacing = rows > 150 ? 8 : (rows > 100 ? 5 : 2);
    for (let r = 0; r < rows; r += dotSpacing) {
      for (let c = 0; c < cols; c += dotSpacing) {
        ctx.beginPath();
        ctx.arc(c * cellSize + cellSize/2, r * cellSize + cellSize/2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw grid lines
    ctx.strokeStyle = '#000000';
    // Dynamically thin the lines as we zoom in for that "engraved" look
    ctx.lineWidth = Math.max(0.05, (dimensions.cellSize < 2 ? 0.05 : 0.1) / scale);
    ctx.beginPath();
    for (let r = 0; r <= rows; r++) {
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(cols * cellSize, r * cellSize);
    }
    for (let c = 0; c <= cols; c++) {
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, rows * cellSize);
    }
    ctx.stroke();

    // Draw cells
    ctx.fillStyle = '#1E1B4B';
    
    for (const key of grid) {
      const [rStr, cStr] = key.split(',');
      const r = parseInt(rStr, 10);
      const c = parseInt(cStr, 10);
      
      const gap = cellSize > 2 ? 0.3 : 0;
      ctx.fillRect(c * cellSize + gap, r * cellSize + gap, cellSize - gap * 2, cellSize - gap * 2);
    }
  }, [grid, dimensions, rows, cols, scale, pan]);

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

    // Mouse position relative to center of container
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const delta = -e.deltaY;
    const zoomSpeed = 0.0015;
    const oldScale = scale;
    const newScale = Math.min(Math.max(scale + delta * zoomSpeed * scale, 1), maxZoom);
    
    if (newScale === oldScale) return;

    // Calculate how much we need to pan to keep the point under the mouse
    // Formula: newPan = oldPan - (mousePos - oldPan) * (scaleRatio - 1)
    const ratio = newScale / oldScale;
    let newPanX = pan.x - (mouseX - pan.x) * (ratio - 1);
    let newPanY = pan.y - (mouseY - pan.y) * (ratio - 1);

    // Apply constraints
    const limitX = Math.max(0, (dimensions.width * newScale - dimensions.width) / 2);
    const limitY = Math.max(0, (dimensions.height * newScale - dimensions.height) / 2);

    newPanX = Math.min(Math.max(newPanX, -limitX), limitX);
    newPanY = Math.min(Math.max(newPanY, -limitY), limitY);

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
    
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
        setPan({ x: newX, y: newY });
      };
      
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        setTimeout(() => setIsDragging(false), 50);
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      // Logic for Paint or Toggle
      let moved = false;
      const initialCell = getCellFromEvent(e);
      lastPaintedCell.current = initialCell;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const cell = getCellFromEvent(moveEvent);
        if (!cell) return;

        if (!moved && initialCell && (cell.r !== initialCell.r || cell.c !== initialCell.c)) {
          moved = true;
          setIsPainting(true);
          // Paint the initial cell too once we know it's a drag
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
      <div 
        className="relative"
      >
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
