import { Plane, Vector3 } from "three";

export interface ImageFile {
  readonly file: File;
  readonly filename?: string;
}

export type RegisterLoginFormData = {
  username: string;
  email?: string;
  password: string;
};

export type ItemOption = {
  label: string;
  value: string;
  height: number;
  width: number;
};

export type PlannerSnapshot = {
  lines: Line[];
  shapes: ShapeType[];
  furnitureItems: FurnitureItem[];
  ceilingItems: CeilingItem[];
  wallItems: WallItems2D[];
  floorPlanPoints: any[];
  roomNames: any[];
};

export type SocialLinkBody = {
  platform: string;
  link: string;
};

export type UpdateSocialLinkParams = {
  social_link: SocialLinkBody[];
};

export interface User {
  id: number;
  username?: string;
  email?: string;
  full_name?: string | null;
  phone?: string | null;
  bio?: string | null;
  password?: string | null;
}

export type USER = {
  id: number;
  image: string;
  username: string;
  email: string;
  is_active: boolean;
  role: Role;
};

export enum Role {
  SuperUser = 0,
  Admin = 1,
  Moderator = 2,
  Designer = 3,
}

export interface CompanyData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  company_intro?: string;
  license?: string;
  logo?: ImageFile;
}

export interface ImageData {
  id?: number;
  photo: string;
  source?: string;
  nationality?: string;
  room_type?: string;
  style?: string;
  theme?: string;
  is_url: string;
}

export interface VariantData {
  base_image: number;
  data: any;
  variant_image: string;
}

export type ImageFiles = {
  photo: File;
  nationality?: string;
  room_type?: string;
  source: string;
  style: string;
  theme?: string;
  is_url: string;
  object_type?: string;
  is_object: string;
};

export interface ChatData {
  prompt: string;
  input_image_link: string;
  num_outputs: number;
  aspect_ratio: string;
  studio_options: {
    style: string[];
  };
}

export interface CompanyLogoData {
  name: string;
  logo?: string | null;
}

export type BRAND = {
  logo: string;
  name: string;
  category: string;
  target_images: number;
  current_images: number;
  percentage: number;
};

export type SocialLink = {
  platform: "facebook" | "twitter" | "linkedin" | "website" | "github";
  link: string;
};

export interface PinClickEvent {
  index: number;
}

export interface ImageObject {
  id: string;
  url: string;
  lightBoxUrl: string;
}

export type TabListProps = {
  id: number;
  value: string;
  logo: string;
};

export type ApiResponse = {
  count: number;
  values: {
    room_type: string;
    source: string;
    count: number;
  }[];
};

export type BrandData = {
  logo: string;
  name: string;
  category: string;
  target_images: number;
  current_images: number;
  percentage: number;
};

export interface InteriorDesignInput {
  image: File;
  prompt: string;
  guidance_scale: number;
  negative_prompt: string;
  prompt_strength: number;
  num_inference_steps: number;
  seed?: number;
}

export interface PlanEditorProps {
  tool: "wall" | "window" | "door" | "moveWall" | "floorPoint" | null;
  setTool: React.Dispatch<
    React.SetStateAction<
      "wall" | "window" | "door" | "moveWall" | "floorPoint" | null
    >
  >;
  showDimensions: boolean;
  setShowDimensions: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: string | null;
  setSelectedShape: React.Dispatch<React.SetStateAction<string | null>>;
  selectedWall: string | null;
  setSelectedWall: React.Dispatch<React.SetStateAction<string | null>>;
  floorPlanPoints: { id: string; x: number; y: number }[];
  setFloorPlanPoints: React.Dispatch<
    React.SetStateAction<{ id: string; x: number; y: number }[]>
  >;
  roomNames: {
    id: number;
    x: number;
    y: number;
    name: string;
    offsetX: number;
  }[];
  setRoomNames: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        x: number;
        y: number;
        name: string;
        offsetX: number;
      }[]
    >
  >;
  shapes: ShapeType[];
  setShapes: React.Dispatch<React.SetStateAction<ShapeType[]>>;
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  windowImage: HTMLImageElement;
  doorImage: HTMLImageElement;
  viewMode: "2D" | "3D";
  addRoomName: (x: number, y: number, name: string) => void;
  editRoomName: (id: number, newName: string) => void;
  deleteRoomName: (id: number) => void;
  furnitureItems: FurnitureItem[];
  setFurnitureItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
  ceilingItems: CeilingItem[];
  setCeilingItems: React.Dispatch<React.SetStateAction<CeilingItem[]>>;
  selectedPlane: string;
  wallItems: WallItems2D[];
  setWallItems: React.Dispatch<React.SetStateAction<WallItems2D[]>>;
  isSidebarOpen: boolean;
  updateState: React.Dispatch<React.SetStateAction<DrawingState>>;
}

export type ViewType = "Top" | "Side" | "Default";

export interface DrawingState {
  shapes: ShapeType[];
  lines: Line[];
  floorPlanPoints: FloorPlanPoint[];
  furnitureItems: FurnitureItem[];
  ceilingItems: CeilingItem[];
  wallItems: WallItems2D[];
  roomNames: RoomName[];
}

export interface LineData {
  id: string;
  points: number[];
}

export interface ShapeType {
  id: string;
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: HTMLImageElement;
  wallId: string;
  variant?: string;
}

export interface ShapeData {
  id: string;
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: HTMLImageElement;
  wallId: string;
  variant?: string;
}

export interface Point {
  id?: string;
  x: number;
  y: number;
}

export interface Line {
  id: string;
  points: number[];
  thickness?: number;
}

export interface TourPoint {
  id: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  title: string;
}

export interface RoomName {
  id: number;
  x: number;
  y: number;
  name: string;
  offsetX: number;
}

export interface CameraControllerProps {
  activeTourPoint: TourPoint | null;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  isAutoRotating: boolean;
  setIsAutoRotating: (value: boolean) => void;
  disableControls?: boolean;
  cameraHeight: number;
}

export interface WallClassification {
  isOuter: boolean;
  isFacingInward: boolean;
}

export interface FloorPlanPoint {
  id: string;
  x: number;
  y: number;
}

export interface PlacingItemType {
  id?: string;
  name: string;
  path: string;
  type: string;
  width: number;
  height: number;
  depth: number;
  category?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export interface PlacedItemType extends PlacingItemType {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface ScheduleItem {
  id: string;
  type: string;
  modelName: string;
  width: number;
  height: number;
  area: number;
  count: number;
  image: string;
}

export interface PDFItemData {
  id: string;
  name: string;
  roomName: string;
  type: string;
  width: number;
  height: number;
  depth: number;
  area: number;
  count: number;
  image: string;
  catrgory?: string;
}

export type FloorData = {
  lines: Line[];
  shapes: ShapeType[];
  roomNames: RoomName[];
  floorPlanPoints: FloorPlanPoint[];
  furnitureItems?: FurnitureItem[];
  ceilingItems?: CeilingItem[];
  wallItems?: WallItems2D[];
};

export interface SerializedShape {
  id: string;
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: "window" | "door";
  wallId: string;
  variant?: string;
}

export interface SerializedRoomName {
  x: number;
  y: number;
  name: string;
}

export interface SerializedFloorData {
  lines: Line[];
  shapes: SerializedShape[];
  roomNames: SerializedRoomName[];
  floorPlanPoints: FloorPlanPoint[];
  furniture: SerializedFurnitureItem[];
  ceilingItems: SerializedceilingItem[];
  wallItems: SerializedWallItem[];
}
export interface SerializedFurnitureItem {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  category: string;
}

export interface SerializedceilingItem {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  category: string;
}

export interface SerializedWallItem {
  id: string;
  x: number;
  y: number;
  z: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  category: string;
}

export interface FurnitureItem {
  id: string;
  x: number;
  y: number;
  z: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  imageSrc: string;
  category: string;
}

export interface CeilingItem {
  id: string;
  x: number;
  y: number;
  z: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  imageSrc: string;
  category: string;
}

export interface WallItems2D {
  id: string;
  x: number;
  y: number;
  z: number;
  name: string;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  rotationX: number;
  rotationZ: number;
  imageSrc: string;
  category: string;
}

export interface SidebarItem {
  name: string;
  imageSrc: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  type?: string;
}

export interface Plan3DViewerProps {
  lines: LineData[];
  shapes: ShapeData[];
  setShapes: React.Dispatch<React.SetStateAction<ShapeData[]>>;
  roomNames: RoomName[];
  floorPlanPoints: { id: string; x: number; y: number }[];
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  furnitureItems: FurnitureItem[];
  setFurnitureItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
  ceilingItems: CeilingItem[];
  setCeilingItems: React.Dispatch<React.SetStateAction<CeilingItem[]>>;
  currentFloorIndex: number;
  wallItems2D: WallItems2D[];
  setWallItems2D: React.Dispatch<React.SetStateAction<WallItems2D[]>>;
  hiddenFloorItems: PlacedItemType[];
  setHiddenFloorItems: React.Dispatch<React.SetStateAction<PlacedItemType[]>>;
  hiddenWallItems: WallItem[];
  setHiddenWallItems: React.Dispatch<React.SetStateAction<WallItem[]>>;
  hiddenCeilingItems: PlacedItemType[];
  setHiddenCeilingItems: React.Dispatch<React.SetStateAction<PlacedItemType[]>>;
  windowHeight: number;
  setWindowHeight: (value: number) => void;
}

export interface SceneContentProps {
  lines: LineData[];
  shapes: ShapeData[];
  roomNames: RoomName[];
  activeTourPoint: TourPoint | null;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
  isAutoRotating: boolean;
  setIsAutoRotating: React.Dispatch<React.SetStateAction<boolean>>;
  showRoof: boolean;
  setShowRoof: React.Dispatch<React.SetStateAction<boolean>>;
  tourPoints: TourPoint[];
  onTourPointClick: (point: TourPoint) => void;
  floorPlanPoints: Point[];
  centerX: number;
  centerY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  onModelClick: (shape: ShapeData) => void;
  modelPathsByShapeId: Record<string, string>;
  shapeDimensionsById: Record<string, { width: number; height: number }>;
  shouldExport: boolean;
  setShouldExport: React.Dispatch<React.SetStateAction<boolean>>;
  placingItem: PlacingItemType | null;
  setPlacingItem: React.Dispatch<React.SetStateAction<PlacingItemType | null>>;
  placedItems: PlacedItemType[];
  setPlacedItems: React.Dispatch<React.SetStateAction<PlacedItemType[]>>;
  selectedItem: PlacedItemType | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<PlacedItemType | null>>;
  wallHeight: number;
  wallThickness: number;
  wallTexture: string;
  floorTexture: string;
  ceilingTexture: string;
  shapeFlipStatusById: Record<string, boolean>;
  furnitureItems: FurnitureItem[];
  setFurnitureItems: React.Dispatch<React.SetStateAction<FurnitureItem[]>>;
  wallItems: any[];
  setWallItems: React.Dispatch<React.SetStateAction<any[]>>;
  wallItems2D: WallItems2D[];
  setWallItems2D: React.Dispatch<React.SetStateAction<WallItems2D[]>>;
  placingWallItem: any | null;
  setPlacingWallItem: React.Dispatch<React.SetStateAction<any | null>>;
  selectedWallItem: SelectedWallItem | null;
  setSelectedWallItem: React.Dispatch<
    React.SetStateAction<SelectedWallItem | null>
  >;
  ceilingItems: CeilingItem[];
  setCeilingItems: React.Dispatch<React.SetStateAction<CeilingItem[]>>;
  currentFloorIndex: number;
  isWallItemMoving: boolean;
  lightIntensity: number;
  cameraHeight: number;
  windowHeight: number;
}

export interface WallItem {
  id: string;
  path: string;
  type: "wall";
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
  depth: number;
  wallNormal?: Vector3;
  wallPlane?: Plane;
  name: string;
}

export interface SelectedWallItem extends WallItem {
  isDragging?: boolean;
  initialPosition?: [number, number, number];
}

export const items: { [category: string]: SidebarItem[] } = {
  "Living Room": [
    {
      name: "Sofa-Double",
      imageSrc: "/2DViewerAssets/sofa_double.svg",
      category: "living",
      width: 110,
      height: 45,
      depth: 50,
    },
    {
      name: "Tv",
      imageSrc: "/2DViewerAssets/tv.svg",
      category: "living",
      width: 60,
      height: 10,
      depth: 45,
    },
    {
      name: "Tea-Table",
      imageSrc: "/2DViewerAssets/tea_table.svg",
      category: "living",
      width: 85,
      height: 30,
      depth: 51,
    },
  ],
  "Bed Room": [
    {
      name: "Bed",
      imageSrc: "/2DViewerAssets/bed.svg",
      category: "bed",
      width: 136,
      height: 32,
      depth: 98,
    },
    {
      name: "Tv",
      imageSrc: "/2DViewerAssets/tv.svg",
      category: "bed",
      width: 60,
      height: 10,
      depth: 45,
    },
    {
      name: "Wardrobe",
      imageSrc: "/2DViewerAssets/wardrobe.svg",
      category: "bed",
      width: 130,
      height: 108,
      depth: 33,
    },
  ],
  Kitchen: [
    {
      name: "Fridge",
      imageSrc: "/2DViewerAssets/fridge.svg",
      category: "kitchen",
      width: 48,
      height: 115,
      depth: 42,
    },
    {
      name: "Stove",
      imageSrc: "/2DViewerAssets/stove.svg",
      category: "kitchen",
      width: 55,
      height: 55,
      depth: 45,
    },
    {
      name: "Burner",
      imageSrc: "/2DViewerAssets/burner.svg",
      category: "kitchen",
      width: 45,
      height: 48,
      depth: 48,
    },
    {
      name: "Side-Table",
      imageSrc: "/2DViewerAssets/side_table.svg",
      category: "kitchen",
      width: 20,
      height: 48,
      depth: 35,
    },
    {
      name: "Cabinets",
      imageSrc: "/2DViewerAssets/cabinets.svg",
      category: "kitchen",
      width: 48,
      height: 96,
      depth: 24,
    },
    {
      name: "Sink",
      imageSrc: "/2DViewerAssets/sink.svg",
      category: "kitchen",
      width: 120,
      height: 70,
      depth: 35,
    },
    {
      name: "Shelf",
      imageSrc: "/2DViewerAssets/shelf.svg",
      category: "kitchen",
      width: 60,
      height: 108,
      depth: 35,
    },
    {
      name: "Drawer",
      imageSrc: "/2DViewerAssets/floor_drawer.svg",
      category: "kitchen",
      width: 90,
      height: 48,
      depth: 35,
    },
  ],
  "Kid's Room": [
    {
      name: "BunkBed",
      imageSrc: "/2DViewerAssets/bunkBed.svg",
      category: "kid",
      width: 57,
      height: 83,
      depth: 110,
    },
  ],
  Common: [
    {
      name: "Shoe-Rack",
      imageSrc: "/2DViewerAssets/shoe_rack.svg",
      category: "common",
      width: 33,
      height: 70,
      depth: 21,
    },
    {
      name: "Potted-Plant",
      imageSrc: "/2DViewerAssets/potted_plant.svg",
      category: "common",
      width: 25,
      height: 25,
      depth: 25,
    },
  ],
  "Bath Room": [
    {
      name: "Bathtub",
      imageSrc: "/2DViewerAssets/bathtub.svg",
      category: "bath",
      width: 100,
      height: 35,
      depth: 47,
    },
  ],
  Ceiling: [
    {
      name: "Chandelier-1",
      imageSrc: "/2DViewerAssets/chandelier_1.svg",
      category: "ceiling",
      width: 45,
      height: 33,
      depth: 45,
    },
  ],
};

export const categories = [
  {
    name: "Living Room",
    items: [
      {
        name: "Sofa",
        path: "items/sofa_double.glb",
        type: "sofa",
        width: 110,
        height: 45,
        depth: 50,
      },
      {
        name: "TV Stand",
        path: "items/tv_stand.glb",
        type: "tv_stand",
        width: 100,
        height: 38,
        depth: 30,
      },
      {
        name: "Tea Table",
        path: "items/tea_table.glb",
        type: "tea_table",
        width: 85,
        height: 30,
        depth: 51,
      },
    ],
  },
  {
    name: "Bed Room",
    items: [
      {
        name: "Bed",
        path: "items/bed.glb",
        type: "bed",
        width: 136,
        height: 32,
        depth: 98,
      },
      {
        name: "Wardrobe",
        path: "items/wardrobe.glb",
        type: "wardrobe",
        width: 130,
        height: 108,
        depth: 33,
      },
    ],
  },
  {
    name: "Kitchen",
    items: [
      {
        name: "Fridge",
        path: "items/fridge.glb",
        type: "fridge",
        width: 48,
        height: 115,
        depth: 42,
      },
      {
        name: "Cabinets",
        path: "items/cabinets.glb",
        type: "cabinets",
        width: 48,
        height: 96,
        depth: 24,
      },
      {
        name: "Sink",
        path: "items/sink.glb",
        type: "sink",
        width: 120,
        height: 70,
        depth: 35,
      },
      {
        name: "Shelf",
        path: "items/shelf.glb",
        type: "shelf",
        width: 60,
        height: 108,
        depth: 35,
      },
      {
        name: "Drawer",
        path: "items/drawer.glb",
        type: "drawer",
        width: 90,
        height: 48,
        depth: 35,
      },
      {
        name: "Side-Table",
        path: "items/side_table.glb",
        type: "side_table",
        width: 20,
        height: 48,
        depth: 35,
      },
      {
        name: "Stove",
        path: "items/stove.glb",
        type: "stove",
        width: 32,
        height: 48,
        depth: 35,
      },
      {
        name: "Burner",
        path: "items/burner.glb",
        type: "burner",
        width: 45,
        height: 48,
        depth: 48,
      },
    ],
  },
  {
    name: "BathRoom",
    items: [
      {
        name: "Bathtub",
        path: "items/bathtub.glb",
        type: "bathtub",
        width: 100,
        height: 35,
        depth: 47,
      },
    ],
  },
  {
    name: "Kid's Room",
    items: [
      {
        name: "BunkBed",
        path: "items/bunkBed.glb",
        type: "bunkBed",
        width: 57,
        height: 83,
        depth: 110,
      },
    ],
  },
  {
    name: "Common",
    items: [
      {
        name: "Bookself 1",
        path: "items/bookself_1.glb",
        type: "bookself_1",
        width: 33,
        height: 70,
        depth: 21,
      },
      {
        name: "Bookself 2",
        path: "items/bookself_2.glb",
        type: "bookself_2",
        width: 33,
        height: 70,
        depth: 21,
      },
      {
        name: "Rack",
        path: "items/rack.glb",
        type: "rack",
        width: 30,
        height: 85,
        depth: 30,
      },
      {
        name: "Rug",
        path: "items/rug.glb",
        type: "rug",
        width: 157,
        height: 0.5,
        depth: 92,
      },
      {
        name: "Potted-Plant",
        path: "items/potted_plant.glb",
        type: "potted_plant",
        width: 25,
        height: 25,
        depth: 25,
      },
    ],
  },
];

export const wallItemsCatgories = [
  {
    name: "Wall",
    items: [
      {
        name: "Poster 1",
        path: "wallItems/poster_1.glb",
        type: "poster_1",
        width: 30,
        height: 40,
        depth: 2,
      },
      {
        name: "Poster 2",
        path: "wallItems/poster_2.glb",
        type: "poster_2",
        width: 30,
        height: 40,
        depth: 2,
      },
      {
        name: "Poster 3",
        path: "wallItems/poster_3.glb",
        type: "poster_3",
        width: 30,
        height: 40,
        depth: 2,
      },
      {
        name: "Poster 4",
        path: "wallItems/poster_4.glb",
        type: "poster_4",
        width: 45,
        height: 30,
        depth: 2,
      },
      {
        name: "Poster 5",
        path: "wallItems/poster_5.glb",
        type: "poster_5",
        width: 30,
        height: 40,
        depth: 2,
      },
      {
        name: "Wall Panel 1",
        path: "wallItems/wall_panel_1.glb",
        type: "wall_panel_1",
        width: 70,
        height: 120,
        depth: 3,
      },
      {
        name: "Wall Panel 2",
        path: "wallItems/wall_panel_2.glb",
        type: "wall_panel_2",
        width: 70,
        height: 120,
        depth: 3,
      },
      {
        name: "Wall Panel 3",
        path: "wallItems/wall_panel_3.glb",
        type: "wall_panel_3",
        width: 70,
        height: 120,
        depth: 3,
      },
    ],
  },
];

export interface DimensionBoxProps {
  width: number;
  height: number;
  depth: number;
}
