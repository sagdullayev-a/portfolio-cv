"use client";

import { Vector3, CatmullRomCurve3, RepeatWrapping, CanvasTexture } from "three";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";

import {
  Canvas,
  extend,
  useFrame,
  useThree,
} from "@react-three/fiber";

import {
  Environment,
  Lightformer,
  useGLTF,
  useTexture,
} from "@react-three/drei";

import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from "@react-three/rapier";

import {
  MeshLineGeometry,
  MeshLineMaterial,
} from "meshline";

extend({
  MeshLineGeometry,
  MeshLineMaterial,
});

const GLTF_PATH = "/assets/cards.glb";
useGLTF.preload(GLTF_PATH);

export default function BandCard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener(
        "resize",
        checkMobile
      );
    };
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <Canvas
          className="band-card-canvas"
          gl={{
            alpha: true,
            antialias: true,
          }}
          dpr={[1, 2]}
          camera={{
            position: isMobile
              ? [0, 0, 15]
              : [0, 0, 13],
            fov: isMobile ? 32 : 25,
          }}
          style={{
            background: "transparent",
            width: "100%",
            height: "100%",
            pointerEvents: "auto",
            touchAction: "none",
          }}
        >
          <ambientLight intensity={1.5} />

          <Physics
            interpolate
            gravity={[0, -25, 0]}
            timeStep={1 / 60}
          >
            <Band isMobile={isMobile} />
          </Physics>

          <Environment blur={0.75}>
            <Lightformer
              intensity={2}
              color="white"
              position={[0, -1, 5]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={3}
              color="white"
              position={[-1, -1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={3}
              color="white"
              position={[1, 1, 1]}
              rotation={[0, 0, Math.PI / 3]}
              scale={[100, 0.1, 1]}
            />

            <Lightformer
              intensity={10}
              color="white"
              position={[-10, 0, 14]}
              rotation={[
                0,
                Math.PI / 2,
                Math.PI / 3,
              ]}
              scale={[100, 10, 1]}
            />
          </Environment>
        </Canvas>
      </Suspense>
    </div>
  );
}

function Band({
  isMobile,
  maxSpeed = 50,
  minSpeed = 10,
}: {
  isMobile: boolean;
  maxSpeed?: number;
  minSpeed?: number;
}) {
  const band = useRef<any>(null);

  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);

  const card = useRef<any>(null);

  const vec = new Vector3();
  const ang = new Vector3();
  const rot = new Vector3();
  const dir = new Vector3();

  const segmentProps: any = {
    type: "dynamic",
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const gltf = useGLTF(GLTF_PATH) as any;

  const nodes = gltf?.nodes || {};
  const materials = gltf?.materials || {};



  const lanyardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Draw black background
    ctx.fillStyle = "#0f172a"; // deep premium slate dark
    ctx.fillRect(0, 0, 1024, 256);

    // 2. Draw subtle border stripes (simulating silver fabric stitching)
    ctx.fillStyle = "#4f46e5"; // Indigo accent stitch
    ctx.fillRect(0, 0, 1024, 15);
    ctx.fillRect(0, 241, 1024, 15);

    // 3. Draw text "HAN" repeated
    ctx.fillStyle = "#f8fafc"; // off-white
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 90px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

    const textToDraw = "HAN";
    const numRepeats = 4;
    const step = 1024 / numRepeats;
    for (let i = 0; i < numRepeats; i++) {
      const x = step * i + step / 2;
      ctx.fillText(textToDraw, x, 128);
    }

    const tex = new CanvasTexture(canvas);
    tex.wrapS = RepeatWrapping;
    tex.wrapT = RepeatWrapping;
    return tex;
  }, []);

  const userTexture = useTexture("/assets/azizxon.jpg");

  const cardTexture = useMemo(() => {
    if (!userTexture || !userTexture.image) return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Flip canvas vertically to cancel out the UV flipping in the 3D model while keeping horizontal text orientation correct
    ctx.translate(0, 1024);
    ctx.scale(1, -1);

    // The front of the card maps to the left portion of the texture (X = 0 to 530, Y = 0 to 750)
    // The back of the card maps to the right portion of the texture (X = 530 to 1024, Y = 0 to 750)
    const frontCenter = 265;
    const backCenter = 777;

    // --- DRAW CARD FRONT ---
    // 1. Draw card background (clean white/off-white)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 530, 750);

    // 2. Draw top header (dark indigo)
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(0, 0, 530, 120);

    // Draw brand text in header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HAN CREATIVE", frontCenter, 70);

    // 3. Draw user photo
    const pw = 340;
    const ph = 340;
    const px = frontCenter - pw / 2;
    const py = 150;

    // Draw photo frame/border
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 8;
    ctx.strokeRect(px, py, pw, ph);

    // Draw the photo
    ctx.drawImage(userTexture.image, px, py, pw, ph);

    // 4. Draw the ID text details
    ctx.fillStyle = "#0f172a"; // dark slate
    ctx.textAlign = "center";
    
    // Name
    ctx.font = "bold 30px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("Azizxon Sagdullayev", frontCenter, 540);

    // Role
    ctx.fillStyle = "#4f46e5"; // Indigo
    ctx.font = "bold 20px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("FRONTEND DEVELOPER", frontCenter, 580);

    // University
    ctx.fillStyle = "#64748b"; // Slate
    ctx.font = "600 15px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("PDP UNIVERSITY STUDENT", frontCenter, 615);

    // Fake barcode
    ctx.fillStyle = "#0f172a";
    const barY = 650;
    const barHeight = 35;
    const scaleFactor = 0.7;
    let currentX = frontCenter - (300 * scaleFactor) / 2; // Center barcode: 265 - 105 = 160
    const barcodePattern = [10, 8, 20, 12, 6, 16, 28, 8, 12, 22, 6, 14, 10, 12, 20, 10, 10, 26, 10, 10, 20];
    barcodePattern.forEach((w, idx) => {
      const scaledW = w * scaleFactor;
      if (idx % 2 === 0) {
        ctx.fillRect(currentX, barY, scaledW, barHeight);
      }
      currentX += scaledW;
    });

    // --- DRAW CARD BACK ---
    // 1. Draw card back background (dark premium blue)
    ctx.fillStyle = "#1e1b4b";
    ctx.fillRect(530, 0, 1024 - 530, 750);

    // 2. Draw styled circle outline
    ctx.strokeStyle = "rgba(79, 70, 229, 0.3)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(backCenter, 375, 90, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Draw Brand logo in the center of circle
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 60px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("HAN", backCenter, 375);

    // Reset baseline for other texts
    ctx.textBaseline = "alphabetic";

    // 4. Draw studio text below circle
    ctx.fillStyle = "#a5b4fc"; // soft indigo
    ctx.font = "bold 18px 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText("CREATIVE STUDIO", backCenter, 510);

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = "srgb";
    return tex;
  }, [userTexture]);

  const { width, height } = useThree(
    (state) => state.size
  );

  const [curve] = useState(
    () =>
      new CatmullRomCurve3([
        new Vector3(),
        new Vector3(),
        new Vector3(),
        new Vector3(),
      ])
  );

  const [dragged, drag] =
    useState<any>(null);

  const [hovered, hover] =
    useState(false);

  const canDrag = true;

  useRopeJoint(
    fixed,
    j1,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useRopeJoint(
    j1,
    j2,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useRopeJoint(
    j2,
    j3,
    [[0, 0, 0], [0, 0, 0], 1] as any
  );

  useSphericalJoint(
    j3,
    card,
    [[0, 0, 0], [0, 1.45, 0]] as any
  );

  useEffect(() => {
    if (hovered && canDrag) {
      document.body.style.cursor =
        dragged ? "grabbing" : "grab";

      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (
      dragged !== null &&
      card.current &&
      canDrag
    ) {
      vec
        .set(
          state.pointer.x,
          state.pointer.y,
          0.5
        )
        .unproject(state.camera);

      dir
        .copy(vec)
        .sub(state.camera.position)
        .normalize();

      vec.add(
        dir.multiplyScalar(
          state.camera.position.length()
        )
      );

      [
        card,
        j1,
        j2,
        j3,
        fixed,
      ].forEach((r) =>
        r.current?.wakeUp()
      );

      const newX = vec.x - dragged.x;

      let newY = vec.y - dragged.y;

      const newZ = 0;

      if (isMobile) {
        vec.multiplyScalar(0.92);
      }

      const limit = isMobile
        ? -0.05
        : -0.2;

      if (state.pointer.y < limit) {
        newY =
          card.current.translation().y;
      }

      card.current.setNextKinematicTranslation(
        {
          x: newX,
          y: newY,
          z: newZ,
        }
      );
    }

    if (
      fixed.current &&
      j1.current &&
      j2.current &&
      j3.current &&
      card.current
    ) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) {
          ref.current.lerped =
            new Vector3().copy(
              ref.current.translation()
            );
        }

        const d = Math.max(
          0.1,
          Math.min(
            1,
            ref.current.lerped.distanceTo(
              ref.current.translation()
            )
          )
        );

        ref.current.lerped.lerp(
          ref.current.translation(),
          delta *
          (minSpeed +
            d *
            (maxSpeed - minSpeed))
        );
      });

      curve.points[0].copy(
        j3.current.translation()
      );

      curve.points[1].copy(
        j2.current.lerped
      );

      curve.points[2].copy(
        j1.current.lerped
      );

      curve.points[3].copy(
        fixed.current.translation()
      );

      if (band.current?.geometry) {
        band.current.geometry.setPoints(
          curve.getPoints(32)
        );
      }

      ang.copy(card.current.angvel());

      rot.copy(card.current.rotation());

      card.current.setAngvel({
        x: ang.x,
        y: ang.y - rot.y * 0.25,
        z: ang.z,
      });
    }
  });

  curve.curveType = "chordal";

  return (
    <>
      <group
        position={
          isMobile
            ? [1.2, 2.3, 0]
            : [3, 3.2, 0]
        }
      >
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type="fixed"
        />

        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>

        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? "kinematicPosition"
              : "dynamic"
          }
        >
          <CuboidCollider
            args={[0.8, 1.125, 0.01]}
          />

          <group
            scale={
              isMobile ? 1.7 : 2.25
            }
            position={[0, -1.2, -0.05]}
            onPointerOver={() =>
              canDrag && hover(true)
            }
            onPointerOut={() =>
              canDrag && hover(false)
            }
            onPointerUp={(e: any) => {
              if (!canDrag) return;

              e.stopPropagation();

              e.target.releasePointerCapture(
                e.pointerId
              );

              drag(false);
            }}
            onPointerDown={(e: any) => {
              if (!canDrag) return;

              e.target.setPointerCapture(
                e.pointerId
              );

              drag(
                new Vector3()
                  .copy(e.point)
                  .sub(
                    vec.copy(
                      card.current.translation()
                    )
                  )
              );
            }}
          >
            {nodes?.card?.geometry && (
              <mesh
                geometry={
                  nodes.card.geometry
                }
              >
                <meshPhysicalMaterial
                  {...materials.base}
                  map={cardTexture || materials.base.map}
                  roughness={0.35}
                  metalness={0.1}
                  clearcoat={1}
                  clearcoatRoughness={0.15}
                />
              </mesh>
            )}

            {nodes?.clip?.geometry && (
              <mesh
                geometry={
                  nodes.clip.geometry
                }
                material={materials.metal}
              />
            )}

            {nodes?.clamp?.geometry && (
              <mesh
                geometry={
                  nodes.clamp.geometry
                }
                material={materials.metal}
              />
            )}
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        {/* @ts-expect-error meshline */}
        <meshLineGeometry />

        {/* @ts-expect-error meshline */}
        <meshLineMaterial
          transparent
          opacity={0.9}
          color="white"
          depthTest={false}
          resolution={[width, height]}
          useMap
          map={lanyardTexture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}