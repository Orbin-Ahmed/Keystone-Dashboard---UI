export interface ImageFile {
  readonly file: File;
  readonly filename?: string;
}

export type RegisterLoginFormData = {
  username: string;
  email?: string;
  password: string;
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
}

export interface LineData {
  id: string;
  points: number[];
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
}

export interface Point {
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
