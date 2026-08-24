import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/motion/reducedMotion";
import fragmentShader from "./authField.frag.glsl?raw";
import vertexShader from "./shaderField.vert.glsl?raw";

interface FieldPlaneProps {
  colorA: string;
  colorB: string;
}

/** Converts a "#rrggbb" hex string to an "rgba(r, g, b, alpha)" string. */
function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace("#", "");
  const bigint = parseInt(parsed, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function FieldPlane({ colorA, colorB }: FieldPlaneProps) {
  const { viewport } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
        },
        vertexShader,
        fragmentShader,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      mouse.current.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    }
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    (material.uniforms.uMouse.value as THREE.Vector2).lerp(mouse.current, 0.05);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/**
 * Lighter, transparent variant of ShaderField for auth-page backgrounds: one
 * noise octave instead of two, capped device-pixel-ratio, alpha-blended so it
 * sits subtly behind a form panel rather than as a full-bleed hero canvas.
 */
export interface AuthFieldProps {
  colorA?: string;
  colorB?: string;
}

export default function AuthField({ colorA = "#0b0018", colorB = "#00f3ff" }: AuthFieldProps) {
  if (prefersReducedMotion()) {
    return (
      <div
        data-testid="auth-field-fallback"
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 40%, ${hexToRgba(colorB, 0.1)}, transparent 60%)`,
        }}
      />
    );
  }

  return (
    <div data-testid="auth-field-canvas" style={{ position: "absolute", inset: 0 }}>
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]} gl={{ antialias: false, alpha: true }}>
        <Suspense fallback={null}>
          <FieldPlane colorA={colorA} colorB={colorB} />
        </Suspense>
      </Canvas>
    </div>
  );
}
