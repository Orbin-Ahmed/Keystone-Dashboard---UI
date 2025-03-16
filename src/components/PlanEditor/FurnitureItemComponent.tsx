"use client";
import React, { FC, useRef, useEffect, useState } from "react";
import { Image as KonvaImage, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { FurnitureItem } from "@/types";

interface FurnitureItemComponentProps {
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, newAttrs: Partial<FurnitureItem>) => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd?: (e: KonvaEventObject<DragEvent>) => void;
  onDragStart?: (id: string) => void;
  isShiftPressed?: boolean;
}

const FurnitureItemComponent: FC<FurnitureItemComponentProps> = ({
  item,
  isSelected,
  onSelect,
  onChange,
  onDragMove,
  onDragEnd,
  onDragStart,
  isShiftPressed = false,
}) => {
  const [image] = useImage(item.imageSrc);
  const shapeRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (transformerRef.current && shapeRef.current) {
      if (isSelected) {
        transformerRef.current.nodes([shapeRef.current]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    }
  }, [isSelected]);

  const handleDragStart = (e: any) => {
    setIsDragging(true);
    if (onDragStart && isShiftPressed) {
      onDragStart(item.id);
    }
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    if (!shapeRef.current) return;
    setIsDragging(false);

    const node = shapeRef.current;
    onChange(item.id, {
      x: node.x(),
      y: node.y(),
    });

    if (onDragEnd) {
      onDragEnd(e);
    }
  };

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (onDragMove) {
      onDragMove(e);
    }
  };

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const newWidth = Math.max(5, node.width() * scaleX);
    const newDepth = Math.max(5, node.height() * scaleY);

    onChange(item.id, {
      x: node.x(),
      y: node.y(),
      width: newWidth,
      depth: newDepth,
      rotation: node.rotation(),
    });
  };

  if (!image) return null;

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={item.x}
        y={item.y}
        width={item.width}
        height={item.depth}
        rotation={item.rotation}
        draggable
        onClick={() => onSelect(item.id)}
        onTap={() => onSelect(item.id)}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onMouseEnter={(e) => {
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = "pointer";
          }
        }}
        onMouseLeave={(e) => {
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = "default";
          }
        }}
      />

      {isSelected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
        />
      )}
    </>
  );
};

export default FurnitureItemComponent;
