import {
  CeilingItem,
  FurnitureItem,
  Line,
  ShapeType,
  WallItems2D,
} from "@/types";
import { useState, useCallback, KeyboardEvent } from "react";

interface DrawingState {
  shapes: ShapeType[];
  lines: Line[];
  floorPlanPoints: { id: string; x: number; y: number }[];
  furnitureItems: FurnitureItem[];
  ceilingItems: CeilingItem[];
  wallItems: WallItems2D[];
  roomNames: {
    id: number;
    x: number;
    y: number;
    name: string;
    offsetX: number;
  }[];
}

function useHistoryManager<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const [undoStack, setUndoStack] = useState<T[]>([]);
  const [redoStack, setRedoStack] = useState<T[]>([]);

  const updateState = useCallback(
    (newState: T | ((prevState: T) => T)) => {
      const nextState =
        typeof newState === "function"
          ? (newState as (prevState: T) => T)(state)
          : newState;

      setUndoStack((prevStack) => [...prevStack, state]);
      setRedoStack([]);
      setState(nextState);
    },
    [state],
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const prevState = undoStack[undoStack.length - 1];

    setUndoStack((prevStack) => prevStack.slice(0, -1));
    setRedoStack((prevStack) => [...prevStack, state]);
    setState(prevState);
  }, [state, undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];

    setRedoStack((prevStack) => prevStack.slice(0, -1));
    setUndoStack((prevStack) => [...prevStack, state]);
    setState(nextState);
  }, [state, redoStack]);

  return {
    state,
    updateState,
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
