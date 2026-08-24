import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { prefersReducedMotion } from "@/motion/reducedMotion";
import fragmentShader from "./shaderField.frag.glsl?raw";
import vertexShader from "./shaderField.vert.glsl?raw";

function FieldPlane() {
  const { viewport, size } = useThree();
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uColorA: { value: new THREE.Color("#0b0018") },
          uColorB: { value: new THREE.Color("#00f3ff") },
        },
        vertexShader,
        fragmentShader,
      }),
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
    (material.uniforms.uMouse.value as THREE.Vector2).lerp(mouse.current, 0.06);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/** Full-bleed, cursor-reactive WebGL gradient/noise background. Renders a static CSS gradient instead when reduced motion is preferred. */
export default function ShaderField() {
  if (prefersReducedMotion()) {
    return (
      <div
        data-testid="shader-field-fallback"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 20%, rgba(0,243,255,0.18), transparent 55%), radial-gradient(circle at 70% 80%, rgba(176,38,255,0.18), transparent 55%), #050510",
        }}
      />
    );
  }

  return (
    <div data-testid="shader-field-canvas" style={{ position: "absolute", inset: 0 }}>
      <Canvas camera={{ position: [0, 0, 1] }} gl={{ antialias: true, alpha: false }}>
        <Suspense fallback={null}>
          <FieldPlane />
        </Suspense>
      </Canvas>
    </div>
  );
}
