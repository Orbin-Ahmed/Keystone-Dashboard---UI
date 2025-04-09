import {
  CeilingItem,
  FloorPlanPoint,
  FurnitureItem,
  Line,
  RoomName,
  ShapeType,
  WallItems2D,
} from "@/types";
import { useState, useEffect, useRef } from "react";

type AppState = {
  lines: Line[];
  shapes: ShapeType[];
  roomNames: RoomName[];
  floorPlanPoints: FloorPlanPoint[];
  furnitureItems: FurnitureItem[];
  ceilingItems: CeilingItem[];
  wallItems: WallItems2D[];
};

export const useUndoRedo = (
  lines: Line[],
  shapes: ShapeType[],
  roomNames: RoomName[],
  floorPlanPoints: FloorPlanPoint[],
  furnitureItems: FurnitureItem[],
  ceilingItems: CeilingItem[],
  wallItems: WallItems2D[],
  setLines: React.Dispatch<React.SetStateAction<Line[]>>,
  setShapes: React.Dispatch<React.SetStateAction<ShapeType[]>>,
  setRoomNames: React.Dispatch<React.SetStateAction<RoomName[]>>,
  setFloorPlanPoints: React.Dispatch<React.SetStateAction<FloorPlanPoint[]>>,
  setFurnitureItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>,
  setCeilingItems: React.Dispatch<React.SetStateAction<CeilingItem[]>>,
  setWallItems: React.Dispatch<React.SetStateAction<WallItems2D[]>>,
) => {
  const [history, setHistory] = useState<AppState[]>([]);
  const [position, setPosition] = useState<number>(-1);
  const isUndoRedoOperation = useRef<boolean>(false);

  useEffect(() => {
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    const currentState: AppState = {
      lines,
      shapes,
      roomNames,
      floorPlanPoints,
      furnitureItems,
      ceilingItems,
      wallItems,
    };

    let newHistory;
    if (position < 0) {
      newHistory = [currentState];
    } else {
      newHistory = [...history.slice(0, position + 1), currentState];
    }

    setHistory(newHistory);
    setPosition(newHistory.length - 1);
  }, [
    lines,
    shapes,
    roomNames,
    floorPlanPoints,
    furnitureItems,
    ceilingItems,
    wallItems,
  ]);

  const undo = () => {
    if (position > 0) {
      isUndoRedoOperation.current = true;
      const previousState = history[position - 1];

      setLines([...previousState.lines]);
      setShapes([...previousState.shapes]);
      setRoomNames([...previousState.roomNames]);
      setFloorPlanPoints([...previousState.floorPlanPoints]);
      setFurnitureItems([...previousState.furnitureItems]);
      setCeilingItems([...previousState.ceilingItems]);
      setWallItems([...previousState.wallItems]);

      setPosition(position - 1);
    }
  };

  const redo = () => {
    if (position < history.length - 1) {
      isUndoRedoOperation.current = true;
      const nextState = history[position + 1];

      setLines([...nextState.lines]);
      setShapes([...nextState.shapes]);
      setRoomNames([...nextState.roomNames]);
      setFloorPlanPoints([...nextState.floorPlanPoints]);
      setFurnitureItems([...nextState.furnitureItems]);
      setCeilingItems([...nextState.ceilingItems]);
      setWallItems([...nextState.wallItems]);

      setPosition(position + 1);
    }
  };

  return {
    undo,
    redo,
    canUndo: position > 0,
    canRedo: position < history.length - 1,
  };
};
