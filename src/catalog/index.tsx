import * as Areas from "./areas/area/planner-element.jsx";
import * as Lines from "./lines/wall/planner-element.jsx";
import Door from "./holes/door/planner-element.jsx";
import DoorDouble from "./holes/door-double/planner-element.jsx";
import PanicDoor from "./holes/panic-door/planner-element.jsx";
import PanicDoorDouble from "./holes/panic-door-double/planner-element.jsx";
import SlidingDoor from "./holes/sliding-door/planner-element.jsx";
import Window from "./holes/window/planner-element.jsx";
import SashWindow from "./holes/sash-window/planner-element.jsx";
import VenetianBlindWindow from "./holes/venetian-blind-window/planner-element.jsx";
import WindowCurtain from "./holes/window-curtain/planner-element.jsx";
import Image from "./items/image/planner-element.jsx";
// import * as Holes from "./holes/**/planner-element.jsx";
// import * as Items from "./items/**/planner-element.jsx";
import { Catalog } from "react-planner";
let MyCatalog = new Catalog();

for (let x in Areas) MyCatalog.registerElement(Areas[x]);
for (let x in Lines) MyCatalog.registerElement(Lines[x]);
MyCatalog.registerElement(Door);
MyCatalog.registerElement(DoorDouble);
MyCatalog.registerElement(PanicDoor);
MyCatalog.registerElement(PanicDoorDouble);
MyCatalog.registerElement(SlidingDoor);
MyCatalog.registerElement(Window);
MyCatalog.registerElement(SashWindow);
MyCatalog.registerElement(VenetianBlindWindow);
MyCatalog.registerElement(WindowCurtain);
MyCatalog.registerElement(Image);

// for (let x in Holes) MyCatalog.registerElement(Holes[x]);
// for (let x in Items) MyCatalog.registerElement(Items[x]);

MyCatalog.registerCategory("windows", "Windows", [
  Window,
  SashWindow,
  VenetianBlindWindow,
  WindowCurtain,
]);
MyCatalog.registerCategory("doors", "Doors", [
  Door,
  DoorDouble,
  PanicDoor,
  PanicDoorDouble,
  SlidingDoor,
]);

export default MyCatalog;
