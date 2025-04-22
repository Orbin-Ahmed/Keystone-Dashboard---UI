import * as THREE from "three";

export function adjustBrightness(hexColor: string, brightness: number): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const factor = (brightness - 50) / 50;

  const adjustColor = (color: number, factor: number): number => {
    if (factor >= 0) {
      return Math.min(255, Math.round(color + (255 - color) * factor));
    } else {
      return Math.max(0, Math.round(color * (1 + factor)));
    }
  };

  const newR = adjustColor(r, factor);
  const newG = adjustColor(g, factor);
  const newB = adjustColor(b, factor);
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}

export function findTopmostNamedNode(
  mesh: THREE.Object3D,
): THREE.Object3D | null {
  if (!mesh) return null;

  let current: THREE.Object3D | null = mesh;
  let parent = current.parent;

  if (current.name && current.name !== "") {
    return current;
  }

  while (parent && parent.type !== "Scene") {
    if (parent.name && parent.name !== "") {
      return parent;
    }
    current = parent;
    parent = current.parent;
  }

  return mesh;
}
