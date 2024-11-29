import { FurnitureItem } from "@/types";
import Konva from "konva";
import { useEffect, useRef } from "react";
import useImage from "use-image";

import { Image as KonvaImage } from "react-konva";

const FurnitureItemComponent: React.FC<{
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (id: string, newAttrs: Partial<FurnitureItem>) => void;
}> = ({ item, isSelected, onSelect, onChange }) => {
  const [image] = useImage(item.imageSrc);
  const shapeRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      const transformer = new Konva.Transformer();
      shapeRef.current.getLayer()?.add(transformer);
      transformer.attachTo(shapeRef.current);
      shapeRef.current.getLayer()?.batchDraw();

      return () => {
        transformer.destroy();
      };
    }
  }, [isSelected]);

  if (!image) {
    return null;
  }

  return (
    <KonvaImage
      image={image}
      x={item.x}
      y={item.y}
      width={item.width}
      height={item.height}
      rotation={item.rotation}
      draggable
      onClick={() => onSelect(item.id)}
      ref={shapeRef}
      onDragEnd={(e) => {
        onChange(item.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = shapeRef.current;
        if (node) {
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange(item.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }
      }}
    />
  );
};

export default FurnitureItemComponent;
