declare module "react-planner" {
  import { Store } from "redux";
  import { Map } from "immutable";
  import React, { Component } from "react";

  // Define ReactPlanner's core Models
  export namespace Models {
    interface State {
      mode: string;
      overlays: any[];
      scene: Scene;
      sceneHistory: SceneHistory;
      catalog: Catalog;
      viewer2D: Viewer2D;
      mouse: Mouse;
      zoom: number;
      snapMask: SnapMask;
      snapElements: any[];
      activeSnapElement: any | null;
      drawingSupport: any;
      draggingSupport: any;
      rotatingSupport: any;
      errors: any[];
      warnings: any[];
      clipboardProperties: any;
      selectedElementsHistory: any[];
      misc: any;
      alterate: boolean;
    }

    interface Scene {
      unit: string;
      layers: {
        [id: string]: Layer;
      };
      grids: {
        [id: string]: Grid;
      };
      selectedLayer: string;
      groups: Record<string, any>;
      width: number;
      height: number;
      meta: Record<string, any>;
      guides: {
        horizontal: Record<string, any>;
        vertical: Record<string, any>;
        circular: Record<string, any>;
      };
    }

    interface Layer {
      id: string;
      altitude: number;
      order: number;
      opacity: number;
      name: string;
      visible: boolean;
      vertices: Record<string, any>;
      lines: Record<string, any>;
      holes: Record<string, any>;
      areas: Record<string, any>;
      items: Record<string, any>;
      selected: {
        vertices: string[];
        lines: string[];
        holes: string[];
        areas: string[];
        items: string[];
      };
    }

    interface SceneHistory {
      undoList: any[];
      redoList: any[];
      first: Scene;
      last: Scene;
    }

    interface Catalog {
      ready: boolean;
      page: string;
      path: string[];
      elements: Record<string, any>;
    }

    interface Viewer2D {}

    interface Mouse {
      x: number;
      y: number;
    }

    interface SnapMask {
      SNAP_POINT: boolean;
      SNAP_LINE: boolean;
      SNAP_SEGMENT: boolean;
      SNAP_GRID: boolean;
      SNAP_GUIDE: boolean;
    }

    interface Grid {
      id: string;
      type: string;
      properties: {
        step: number;
        colors: string[];
      };
    }
  }

  // Define ReactPlanner's Plugins
  export namespace Plugins {
    export function Keyboard(): any;
    export function Autosave(key: string): any;
    export function ConsoleDebugger(): any;
  }

  // Define the core ReactPlanner component
  export class ReactPlanner extends Component<ReactPlannerProps> {}

  export interface ReactPlannerProps {
    store: Store<any>;
    catalog: any;
    width: number;
    height: number;
    plugins: any[];
    stateExtractor?: (state: any) => any;
  }

  // Define the reducer function
  export function reducer(
    state: Map<string, any>,
    action: any,
  ): Map<string, any>;
}
