"use client";
import React, { useEffect, useRef, useState } from "react";
import { Map } from "immutable";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { Store } from "redux";

import MyCatalog from "@/catalog";

import {
  Models as PlannerModels,
  reducer as PlannerReducer,
  ReactPlanner,
  Plugins as PlannerPlugins,
} from "@/file/";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

const AppState = Map({
  "react-planner": new PlannerModels.State(),
});

const _reducer = (state: Map<string, any> = AppState, action: any) => {
  state = state || AppState;
  state = state.update("react-planner", (plannerState) =>
    PlannerReducer(plannerState, action),
  );
  return state;
};

const FloorPlannerPage = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [store, setStore] = useState<Store<any> | null>(null);
  const [plugins, setPlugins] = useState<any[]>([]);

  useEffect(() => {
    const width = parentRef.current?.offsetWidth || 800;
    const height = parentRef.current?.offsetHeight || 600;
    setWidth(width);
    setHeight(height);

    if (typeof window !== "undefined") {
      const _store = configureStore({
        reducer: _reducer,
        devTools: process.env.NODE_ENV !== "production",
      });
      setStore(_store);

      setPlugins([
        PlannerPlugins.Keyboard(),
        PlannerPlugins.Autosave("react-planner_v0"),
        PlannerPlugins.ConsoleDebugger(),
      ]);
    }
  }, []);

  if (!store) {
    return <div>Loading planner...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%" }} ref={parentRef}>
      {width && height && store && plugins && (
        <Provider store={store}>
          <ReactPlanner
            store={store}
            catalog={MyCatalog}
            width={width}
            height={height}
            plugins={plugins}
            stateExtractor={(state: any) => state.get("react-planner")}
          />
        </Provider>
      )}
    </div>
  );
};

export default FloorPlannerPage;
