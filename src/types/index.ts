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

export interface Shape {
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  image: HTMLImageElement;
  wallIndex?: number;
}

export interface PlanEditorProps {
  tool: "wall" | "window" | "door" | "moveWall" | null;
  setTool: React.Dispatch<
    React.SetStateAction<"wall" | "window" | "door" | "moveWall" | null>
  >;
  showDimensions: boolean;
  setShowDimensions: React.Dispatch<React.SetStateAction<boolean>>;
  selectedShape: number | null;
  setSelectedShape: React.Dispatch<React.SetStateAction<number | null>>;
  selectedWall: number | null;
  setSelectedWall: React.Dispatch<React.SetStateAction<number | null>>;
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
  shapes: Shape[];
  setShapes: React.Dispatch<React.SetStateAction<Shape[]>>;
  lines: Line[];
  setLines: React.Dispatch<React.SetStateAction<Line[]>>;
  windowImage: HTMLImageElement | undefined;
  doorImage: HTMLImageElement | undefined;
  viewMode: "2D" | "3D";
  addRoomName: (x: number, y: number, name: string) => void;
  editRoomName: (id: number, newName: string) => void;
  deleteRoomName: (id: number) => void;
}

export interface LineData {
  points: number[];
}

export interface ShapeData {
  type: "window" | "door";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  wallIndex?: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Line {
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
