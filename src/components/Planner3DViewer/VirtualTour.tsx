import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three-stdlib";
import { Line, Shape } from "@/types";

interface VirtualTourProps {
  lines: Line[];
  shapes: Shape[];
}

interface Dimensions {
  doorWidth: number;
  doorHeight: number;
  windowWidth: number;
  windowHeight: number;
  wallHeight: number;
  wallThickness: number;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ lines, shapes }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<PointerLockControls | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [moveForward, setMoveForward] = useState(false);
  const [moveBackward, setMoveBackward] = useState(false);
  const [moveLeft, setMoveLeft] = useState(false);
  const [moveRight, setMoveRight] = useState(false);

  const dimensions: Dimensions = {
    doorWidth: 60,
    doorHeight: 100,
    windowWidth: 60,
    windowHeight: 50,
    wallHeight: 120,
    wallThickness: 10,
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, dimensions.wallHeight / 2, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Add walls
    lines.forEach((line) => {
      const [x1, y1, x2, y2] = line.points;
      const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      const wallGeometry = new THREE.BoxGeometry(
        length,
        dimensions.wallHeight,
        dimensions.wallThickness,
      );
      const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);

      const wallPosition = new THREE.Vector3(
        (x1 + x2) / 2,
        dimensions.wallHeight / 2,
        (y1 + y2) / 2,
      );
      wall.position.copy(wallPosition);

      const angle = Math.atan2(y2 - y1, x2 - x1);
      wall.rotation.y = -angle;

      scene.add(wall);
    });

    // Controls setup
    const controls = new PointerLockControls(camera, renderer.domElement);
    controlsRef.current = controls;

    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();

    // Event listeners
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          setMoveForward(true);
          break;
        case "ArrowDown":
        case "KeyS":
          setMoveBackward(true);
          break;
        case "ArrowLeft":
        case "KeyA":
          setMoveLeft(true);
          break;
        case "ArrowRight":
        case "KeyD":
          setMoveRight(true);
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          setMoveForward(false);
          break;
        case "ArrowDown":
        case "KeyS":
          setMoveBackward(false);
          break;
        case "ArrowLeft":
        case "KeyA":
          setMoveLeft(false);
          break;
        case "ArrowRight":
        case "KeyD":
          setMoveRight(false);
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controls.isLocked) {
        const delta = 0.1;

        velocity.x = 0;
        velocity.z = 0;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * delta;

        controls.moveRight(-velocity.x);
        controls.moveForward(-velocity.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [lines, shapes, dimensions]);

  const handleStartTour = () => {
    controlsRef.current?.lock();
    setIsLocked(true);
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mountRef} className="h-full w-full" />
      {!isLocked && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white p-6 shadow-lg">
          <div className="text-center">
            <h3 className="mb-4 text-lg font-semibold">
              Virtual Tour Controls
            </h3>
            <p className="mb-4">
              Use W,A,S,D or arrow keys to move
              <br />
              Mouse to look around
            </p>
            <button
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              onClick={handleStartTour}
            >
              Start Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualTour;
