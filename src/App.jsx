
import { Canvas } from "@react-three/fiber";

import {
  OrbitControls,
  useGLTF,
  Center,
  useTexture,
} from "@react-three/drei";

import * as THREE from "three";
import "./styles/global.css";
import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/* =========================
    LAPTOP
========================= */

function Laptop() {
  const { scene } = useGLTF("/models/laptop.glb");
  const logoTexture = useTexture("/images/logo.png");

  const [stage, setStage] = useState("off");
  const videoRef = useRef(null);

  // Initialize and attach planes to the screen mesh once
  useEffect(() => {
    const screen = scene.getObjectByName("screen_2");
    if (screen && !screen.userData.initialized) {
      
      // ==========================================
      // 🛠️ TWEAK THESE NUMBERS TO PERFECT MATCH
      // ==========================================
      
      // LOGO SETTINGS
      const logoZGap = 0.0001;
      const logoWidth = 0.36;
     
      const logoTiltDegrees = -16; 
      const tiltAngles = logoTiltDegrees * (Math.PI / 190);
      const logoYOffset = 0.9;
      const logoHeight = 0.22;

      // GRAY SCREEN SETTINGS
      const grayScreenWidth = 0.36;
      const grayScreenHeight = 0.22;
      const grayScreenZGap = 0.00001;
      
      // TILT ANGLE
      const screenTiltDegrees = -16; 
      const tiltAngle = screenTiltDegrees * (Math.PI / 190);
      const grayScreenYOffset = 0.9;

      // ==========================================

      // 1. SMALL LOGO 
      const logoPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(0.1, 0.06), 
        new THREE.MeshBasicMaterial({
          map: logoTexture,
          transparent: true,
          depthWrite: false,
        })
      );

      logoPlane.position.set(0, 0, logoZGap); 
      logoPlane.rotation.set(tiltAngle, 0, 0); 
      logoPlane.visible = false;
      
      screen.add(logoPlane);
      screen.userData.logoPlane = logoPlane;

      // 2. FULL GRAY SCREEN 
      const video = document.createElement("video");

      video.src = "/videos/video.mp4";
      video.crossOrigin = "anonymous";
      video.loop = false;
      video.muted = false;
      video.playsInline = true;
      video.preload = "metadata";

      videoRef.current = video;

      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;

      const videoPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(
          grayScreenWidth,
          grayScreenHeight
        ),
        new THREE.MeshBasicMaterial({
          map: videoTexture,
          depthWrite: false,
        })
      );

      videoPlane.position.set(
        0,
        0,
        grayScreenZGap
      );

      videoPlane.rotation.set(
        tiltAngle,
        0,
        0
      );

      videoPlane.visible = false;

      screen.add(videoPlane); 
      screen.userData.videoPlane = videoPlane;

      // VIDEO FINISHED → SCROLL TO SECOND SECTION
      video.addEventListener("ended", () => {

        const introSection = document.querySelector(
          ".profile-photo"
        );

        if (introSection) {

          const start = window.scrollY;

          const target =
            introSection.getBoundingClientRect().top +
            window.scrollY;

          const duration = 7000;

          const startTime = performance.now();

          const animateScroll = (currentTime) => {

            const progress = Math.min(
              (currentTime - startTime) / duration,
              1
            );

            const ease =
              progress < 0.5
                ? 2 * progress * progress
                : 1 -
                  Math.pow(-2 * progress + 2, 2) / 2;

            window.scrollTo(
              0,
              start + (target - start) * ease
            );

            if (progress < 1) {
              requestAnimationFrame(animateScroll);
            }
          };

          requestAnimationFrame(animateScroll);
        }

        // TURN LAPTOP OFF AFTER VIDEO
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.muted = true;
          videoRef.current.currentTime = 0;
        }

        setStage("off");
      });

      screen.userData.initialized = true;
    }
  }, [scene, logoTexture]);

  // Update visibility based on the current stage
  useEffect(() => {
    const screen = scene.getObjectByName("screen_2");
    if (!screen) return;

    if (screen.userData.logoPlane) {
      screen.userData.logoPlane.visible =
        stage === "logo";
    }

    if (screen.userData.videoPlane) {
      screen.userData.videoPlane.visible =
        stage === "static";
    }
  }, [stage, scene]);

  // Timer to transition from logo to video
  useEffect(() => {
    if (stage !== "logo") return;

    const timer = setTimeout(() => {
      const video = videoRef.current;

      if (video) {
        video.currentTime = 0;
        video.muted = false;

        const playPromise = video.play();

        if (playPromise) {
          playPromise.catch(() => {
            // The video was already started by a user gesture.
            // Keep the screen visible even if a browser delays audio.
          });
        }
      }

      setStage("static");
    }, 7200);

    return () =>
      clearTimeout(timer);
  }, [stage]);

  // Start only from a real click/touch on the laptop.
  // There is no global keyboard listener, so typing/scrolling elsewhere
  // on the page can never start the video by accident.
  const handleStart = (e) => {
    e.stopPropagation();

    if (stage !== "off") return;

    const video = videoRef.current;

    if (video) {
      video.load();
      video.currentTime = 0;
      video.muted = true;

      const playPromise = video.play();

      if (playPromise) {
        playPromise.catch(() => {
          // The timer below will try playback again after the logo.
        });
      }
    }

    setStage("logo");
  };

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse") return;

    handleStart(e);
  };

  const handleClick = (e) => {
    handleStart(e);
  };

  return (
    <group
      position={[0.38, 1.16, 0]}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}

/*=================
   TABLE
========================= */

function Table() {
  return (
    <group>
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[14, 0.25, 9]} />
        <meshStandardMaterial
          color="#623621"
          roughness={0.48}
          metalness={0.05}
        />
      </mesh>

      <mesh position={[-4.3, -2.5, 2]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial
          color="#21130d"
          roughness={0.65}
        />
      </mesh>

      <mesh position={[4.3, -2.5, 2]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial
          color="#21130d"
          roughness={0.65}
        />
      </mesh>

      <mesh position={[-4.3, -2.5, -2]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial
          color="#21130d"
          roughness={0.65}
        />
      </mesh>

      <mesh position={[4.3, -2.5, -2]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial
          color="#0d1021"
          roughness={0.65}
        />
      </mesh>
    </group>
  );
}

/* =========================
   ROOM
========================= */

function Room() {
  return (
    <group>
      <mesh position={[0, 3, -14]}>
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          color="#1f0756"
          roughness={0.92}
        />
      </mesh>

      <mesh
        position={[-14, 3, 0]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          color="#091a49"
          roughness={0.92}
        />
      </mesh>

      <mesh
        position={[14, 3, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[28, 16]} />
        <meshStandardMaterial
          color="#081c52"
          roughness={0.92}
        />
      </mesh>

      <mesh
        position={[0, -4, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.75}
          metalness={0.12}
        />
      </mesh>

      <mesh
        position={[0, 10, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[28, 28]} />
        <meshStandardMaterial
          color="#daa0a0"
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}

/* =========================
   FLOOR PATTERN
========================= */

function FloorPattern() {
  const tiles = [];

  for (let x = -12; x <= 12; x += 2) {
    for (let z = -12; z <= 12; z += 2) {
      const isEven = (x + z) % 4 === 0;

      tiles.push(
        <mesh
          key={`${x}-${z}`}
          position={[x, -3.97, z]}
          rotation={[
            -Math.PI / 2,
            0,
            isEven ? Math.PI / 4 : -Math.PI / 4,
          ]}
        >
          <planeGeometry args={[1.7, 0.12]} />
          <meshStandardMaterial
            color={
              isEven
                ? "#252a33"
                : "#181c23"
            }
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      );
    }
  }

  return <group>{tiles}</group>;
}

/* =========================
   PAPER
========================= */

function Paper() {
  const canvas = document.createElement("canvas");

  canvas.width = 800;
  canvas.height = 500;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#eeeeee";
  ctx.fillRect(0, 0, 800, 500);

  ctx.fillStyle = "#111111";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "Developed By Gaurav Sharma",
    400,
    250
  );

  const texture =
    new THREE.CanvasTexture(canvas);

  return (
    <group position={[-5, -0.9, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial map={texture} />
      </mesh>
    </group>
  );
}

/* =========================
   CORNER TABLE
========================= */

function CornerTable() {
  return (
    <group position={[-8.5, 0, -8.5]}>
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[2.8, 0.2, 2.2]} />
        <meshStandardMaterial
          color="#111318"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[-1.1, -2.4, -0.8]}>
        <boxGeometry args={[0.22, 3.2, 0.22]} />
        <meshStandardMaterial color="#08090c" />
      </mesh>

      <mesh position={[1.1, -2.4, -0.8]}>
        <boxGeometry args={[0.22, 3.2, 0.22]} />
        <meshStandardMaterial color="#08090c" />
      </mesh>

      <mesh position={[-1.1, -2.4, 0.8]}>
        <boxGeometry args={[0.22, 3.2, 0.22]} />
        <meshStandardMaterial color="#08090c" />
      </mesh>

      <mesh position={[1.1, -2.4, 0.8]}>
        <boxGeometry args={[0.22, 3.2, 0.22]} />
        <meshStandardMaterial color="#08090c" />
      </mesh>

      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry
          args={[0.35, 0.28, 0.55, 32]}
        />
        <meshStandardMaterial
          color="#7b3d24"
          roughness={0.7}
        />
      </mesh>

      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry
          args={[0.035, 0.035, 0.8, 12]}
        />
        <meshStandardMaterial
          color="#274d32"
          roughness={0.8}
        />
      </mesh>

      <mesh
        position={[-0.25, 0.5, 0]}
        rotation={[0, 0, -0.5]}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#3fa45b"
          roughness={0.75}
        />
      </mesh>

      <mesh
        position={[0.25, 0.55, 0]}
        rotation={[0, 0, 0.5]}
      >
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#46b964"
          roughness={0.75}
        />
      </mesh>

      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#55c96d"
          roughness={0.75}
        />
      </mesh>
    </group>
  );
}

/* =========================
   POSTER
========================= */

function Poster() {
  const texture =
    useTexture("/images/images.png");

  const imageAspect =
    texture.image.width /
    texture.image.height;

  const posterHeight = 2.2;
  const posterWidth =
    posterHeight * imageAspect;

  return (
    <group
      position={[5.8, 4.5, -13.82]}
    >
      <mesh>
        <boxGeometry
          args={[
            posterWidth + 0.25,
            posterHeight + 0.25,
            0.12,
          ]}
        />
        <meshStandardMaterial
          color="#111318"
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>

      <mesh position={[0, 0, 0.08]}>
        <planeGeometry
          args={[posterWidth, posterHeight]}
        />
        <meshStandardMaterial
          map={texture}
          color="#dddddd"
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

/* =========================
   STAR FIELD
========================= */

function StarField() {
  const stars = Array.from({ length: 90 });
  const meteors = Array.from({ length: 12 });

  return (
    <div className="star-field">
      {stars.map((_, i) => (
        <span
          key={`star-${i}`}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}

      {meteors.map((_, i) => (
        <span
          key={`meteor-${i}`}
          className="meteor"
          style={{
            left: `${Math.random() * 120 - 10}%`,
            top: `${Math.random() * 50 - 20}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

/* =========================
   CODING PROFILES
========================= */

function CodingProfiles() {
  const profiles = [
    {
      name: "LEETCODE",
      subtitle:
        "DSA • COMPETITIVE PROGRAMMING",
      image: "/images/leetcode.png",
      link:
        "https://leetcode.com/u/gaurav_cooo/",
    },
    {
      name: "CODECHEF",
      subtitle:
        "COMPETITIVE PROGRAMMING",
      image: "/images/codechef.png",
      link:
        "https://www.codechef.com/users/gaurav5794",
    },
    {
      name: "GITHUB",
      subtitle:
        "PROJECTS • DEVELOPMENT",
      image: "/images/github.png",
      link:
        "https://github.com/GauravSh7",
    },
    {
      name: "LINKEDLN",
      image: "/images/link.png",
      link:
        "https://linkedin.com/in/gaurav-sharma-ga",
    },
  ];

  return (
    <section className="coding-profiles-section">

      <div className="coding-profiles-heading">
        <h2>CODING PROFILES</h2>
      </div>

      <div className="coding-profiles-grid">

        {profiles.map((profile) => (
          <a
            key={profile.name}
            href={profile.link}
            target="_blank"
            rel="noopener noreferrer"
            className="coding-profile-card"
          >

            <img
              src={profile.image}
              alt={profile.name}
              className="coding-profile-image"
            />

            <div className="coding-profile-number">
              {profile.stat}
            </div>

            <div className="coding-profile-content">
              <h3>{profile.name}</h3>

              <span>{profile.subtitle}</span>
            </div>

            <div className="coding-profile-arrow">
              ↗
            </div>

          </a>
        ))}

      </div>

    </section>
  );
}

/* =========================
   BEYOND CREATION DATA
========================= */

const beyondPosts = [
  {
    title: "DISTRICT TOPPER",
    subtitle:
      "CLASS 12 • MUZAFFARNAGAR",
    text:
      "One of the achievements I value most is finishing Class 12 at 5th rank in the district Muzaffarnagar and  got facilated by Chairperson. It was the result of consistency, discipline, and staying focused on a long-term goal. More than the result itself, it taught me the value of patience and sustained effort.",
    images: ["/images/district.png"],
  },

  {
    title: "GDG HACKATHON",
    subtitle:
      "RUNNER-UP • GDG JIIT",
    text:
      "I participated in **BitBox 6.0**, a hackathon hosted by **GeeksforGeeks at JIIT 62**, where our team built and presented our solution under a competitive, time-constrained environment. Working through the entire process—from developing the idea to implementing and presenting it—was a valuable experience in teamwork",
    images: ["/images/gdg.png"],
  },

  {
    title: "AGENTIC AI BUILDATHON",
    subtitle:
      "SEMIFINALIST • TEAM EUREKA",
    text:
      "Our Team Eureka made it to the Top 100 Finalists in the Capgemini Exceller AgentifAI Buildathon 2026, securing a position in the 11–50 range among 8,000+ teams.",
    images: ["/images/agentic.png"],
  },

  {
    title: "THROUGH MY CAMERA",
    subtitle:
      "PHONE PHOTOGRAPHY",
    text:
      "Not everything I create starts with code. Photography is one of the ways I slow down and pay attention to the world around me. These are a few moments I captured simply because something about them caught my eye.",
    images: [
      "/images/photo1.png",
      "/images/photo4.png",
      "/images/photo3.png",
    ],
  },

  {
    title: "Winner At Expo-Quiz",
    subtitle:
      "PUZZLE GAME • EXPO GREATER NOIDA",
    text:
      "A completely different kind of challenge was taking part in a puzzle game at an expo in Greater Noida. I ended up winning the game, and the experience reminded me that problem solving is something I genuinely enjoy even outside programming.",
    images: [
      "/images/beyond/puzzle.png",
    ],
  },

  {
    title: "FOOTBALL ENTHUSIAST",
    subtitle:
      "THE GAME I LOVE",
    text:
      "Football is one of the things I enjoy beyond academics and technology. Whether I am playing or following the game, it gives me a completely different kind of energy. It is also a reminder to step away from the screen and enjoy something I simply love.",
    images: [
      "/images/beyond/football.png",
    ],
  },
];

/* =========================
   BEYOND CREATION
========================= */

function BeyondCreation() {
  const [activePost, setActivePost] =
    useState(0);

  const [activeImage, setActiveImage] =
    useState(0);

  const touchStartX = useRef(null);
  const isDragging = useRef(false);

  // Preload Beyond Creation images after the first paint so image switches
  // are fast without making the initial page load heavier.
  useEffect(() => {
    const preloadImages = () => {
      beyondPosts.forEach((item) => {
        item.images.forEach((src) => {
          const image = new Image();
          image.src = src;
        });
      });
    };

    let idleId = null;
    let timeoutId = null;

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(
        preloadImages,
        { timeout: 2000 }
      );
    } else {
      timeoutId = window.setTimeout(
        preloadImages,
        600
      );
    }

    return () => {
      if (idleId !== null) {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    isDragging.current = true;
  };

  const handleMouseUp = (e) => {
    if (
      !isDragging.current ||
      touchStartX.current === null
    ) {
      return;
    }

    const distance =
      touchStartX.current - e.clientX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    touchStartX.current = null;
    isDragging.current = false;
  };

  const post = beyondPosts[activePost];

  useEffect(() => {
    setActiveImage(0);
  }, [activePost]);

  const nextImage = () => {
    if (post.images.length <= 1) return;

    setActiveImage((current) =>
      current === post.images.length - 1
        ? 0
        : current + 1
    );
  };

  const previousImage = () => {
    if (post.images.length <= 1) return;

    setActiveImage((current) =>
      current === 0
        ? post.images.length - 1
        : current - 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current =
      e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;

    const distance =
      touchStartX.current -
      e.changedTouches[0].clientX;

    if (Math.abs(distance) > 50) {
      if (distance > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    touchStartX.current = null;
  };

  return (
    <section className="beyond-creation-section">

      <div className="beyond-left">

        <p className="beyond-label">
          BEYOND CREATION
        </p>

        <h2>
          {post.title}
        </h2>

        <p className="beyond-subtitle">
          {post.subtitle}
        </p>

        <p className="beyond-description">
          {post.text}
        </p>

        <div className="beyond-post-navigation">

          {beyondPosts.map((item, index) => (
            <button
              key={item.title}
              className={
                index === activePost
                  ? "beyond-post-dot active"
                  : "beyond-post-dot"
              }
              onClick={() => {
                setActivePost(index);
                setActiveImage(0);
              }}
              aria-label={`Open ${item.title}`}
            />
          ))}

        </div>

      </div>

      <div className="beyond-right">

        <div
          className="beyond-image-card"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            touchStartX.current = null;
            isDragging.current = false;
          }}
        >

          <img
            src={post.images[activeImage]}
            alt={post.title}
            decoding="async"
            draggable={false}
          />

          {post.images.length > 1 && (
            <>
              <button
                className="beyond-image-arrow left"
                onClick={previousImage}
              >
                ←
              </button>

              <button
                className="beyond-image-arrow right"
                onClick={nextImage}
              >
                →
              </button>
              <div className="beyond-image-indicators">

                {post.images.map(
                  (_, index) => (
                    <button
                      key={index}
                      className={
                        index === activeImage
                          ? "beyond-image-dot active"
                          : "beyond-image-dot"
                      }
                      onClick={() =>
                        setActiveImage(index)
                      }
                    />
                  )
                )}

              </div>
            </>
          )}

        </div>

      </div>

    </section>
  );
}

/* =========================
   APP
========================= */

function App() {
  const [showPanel, setShowPanel] =
    useState(true);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const transitionText =
    "Beyond the code, there are things I’ve achieved, things I love, and moments I enjoy creating.";

  const [typedText, setTypedText] =
    useState("");

  const [showBeyondArrow, setShowBeyondArrow] =
    useState(false);

  const typingStarted = useRef(false);
  const typingTimerRef = useRef(null);

  const typingSectionRef = useRef(null);

  const controlsRef = useRef(null);

  const isTransitioning = useRef(false);

  const projects = {
    cine: {
      name: "CINE-HOOK",
      description:
        "A movie booking platform inspired by BookMyShow, allowing users to browse movies, check showtimes and book tickets.",
      stack:
        "React, Node.js,Express, PostGreSQL",
      type: "Independent",
      github: "#",
      demo: "#",
    },

    drone: {
      name: "DRONE DETECTION",
      description:
        "An AI-based computer vision system designed to detect dornes .",
      stack:
        "Python, OpenCV, Machine Learning",
      type: "Independent",
      github: "#",
      demo: "#",
    },

    trace: {
      name: "TRACE-WISE",
      description:
        "An AI-assisted tool for validating PCB and CAD designs and identifying potential design issues.",
      stack:
        "React, Python, AI/ML",
      type: "Collaborative",
      github: "#",
      demo: "#",
    },

    todo: {
      name: "TODO APP",
      description:
        "A productivity application for creating, managing and filtering tasks by date and status.",
      stack:
        "React, JavaScript, CSS",
      type: "Independent",
      github: "#",
      demo: "#",
    },
  };

  /* =========================
     TYPING
  ========================= */

  useEffect(() => {
    const section = typingSectionRef.current;

    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          !entry.isIntersecting ||
          typingStarted.current
        ) {
          return;
        }

        typingStarted.current = true;

        let i = 0;

        typingTimerRef.current =
          setInterval(() => {
            setTypedText(
              transitionText.slice(
                0,
                i + 1
              )
            );

            i++;

            if (
              i >= transitionText.length
            ) {
              clearInterval(
                typingTimerRef.current
              );

              typingTimerRef.current = null;

              setShowBeyondArrow(true);
            }
          }, 45);

        observer.disconnect();
      },
      {
        threshold: 0.6,
      }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();

      if (typingTimerRef.current) {
        clearInterval(
          typingTimerRef.current
        );
      }
    };
  }, []);

  /* =========================
     INTRO SCROLL
  ========================= */

  useEffect(() => {
    const intro =
      document.querySelector(
        ".intro-section"
      );

    const hero =
      document.querySelector(
        ".hero-section"
      );

    if (!intro || !hero) return;

    const handleWheel = (e) => {
      if (e.deltaY <= 0) return;

      if (isTransitioning.current)
        return;

      const controls =
        controlsRef.current;

      if (!controls) return;

      const currentDistance =
        controls.getDistance();

      if (currentDistance < 13.9) {
        return;
      }

      e.preventDefault();

      isTransitioning.current =
        true;

      hero.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    intro.addEventListener(
      "wheel",
      handleWheel,
      {
        passive: false,
        capture: true,
      }
    );

    return () => {
      intro.removeEventListener(
        "wheel",
        handleWheel,
        {
          capture: true,
        }
      );
    };
  }, []);

  /* =========================================================
     ===== NEW: OVERALL SCROLL REVEAL =====
  ========================================================= */

  useEffect(() => {
    const revealElements =
      document.querySelectorAll(
        [
          ".profile-photo",
          ".hero-label",
          ".hero-section h1",
          ".hero-description",
          ".projects-heading",
          ".project-card",
          ".coding-profiles-heading",
          ".coding-profile-card",
          ".beyond-transition-section .typing-text",
          ".beyond-creation-section .beyond-left",
          ".beyond-creation-section .beyond-right",
          ".portfolio-footer",
        ].join(", ")
      );

    if (!revealElements.length) return;

    revealElements.forEach((element) => {
      element.classList.add(
        "scroll-reveal"
      );
    });

    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "is-visible"
              );

              observer.unobserve(
                entry.target
              );
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin:
            "0px 0px -60px 0px",
        }
      );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="portfolio-page">

      {/* INTRO */}

      <section className="intro-section">

        <Canvas
          camera={{
            position: [
              0,
              2.5,
              typeof window !== "undefined" &&
              window.innerWidth <= 600
                ? 12
                : 10,
            ],
            fov:
              typeof window !== "undefined" &&
              window.innerWidth <= 600
                ? 50
                : 45,
          }}
          dpr={
            typeof window !== "undefined" &&
            window.innerWidth <= 700
              ? [1, 1.25]
              : [1, 2]
          }
          gl={
            typeof window !== "undefined" &&
            window.innerWidth <= 700
              ? {
                  antialias: false,
                  powerPreference: "high-performance",
                }
              : undefined
          }
        >
          <ambientLight intensity={2.08} />

          <pointLight
            position={[1, 4, -9]}
            intensity={30}
            distance={10}
            decay={2}
            color="#ffffff"
          />

          <pointLight
            position={[5, 5, -9]}
            intensity={12}
            distance={8}
            decay={2}
            color="#4169ff"
          />

          <pointLight
            position={[-9, 4, 0]}
            intensity={20}
            distance={10}
            decay={2}
            color="#2864ff"
          />

          <pointLight
            position={[9, 4, 0]}
            intensity={20}
            distance={10}
            decay={2}
            color="#ff7138"
          />

          <Room />
          <FloorPattern />
          <Table />
          <Laptop />
          <Paper />
          <CornerTable />
          <Poster />

          <OrbitControls
            ref={controlsRef}
            enableRotate={
              typeof window !== "undefined"
                ? window.innerWidth > 700
                : true
            }
            enableZoom={
              typeof window !== "undefined"
                ? window.innerWidth > 700
                : true
            }
            enablePan={false}
            rotateSpeed={0.8}
            zoomSpeed={0.8}
            minDistance={6}
            maxDistance={14}
          />
        </Canvas>

      </section>

      {/* HERO */}

      <section className="hero-section">

        <StarField />

        {showPanel ? (
          <div className="achievement-panel">

            <button
              className="panel-close"
              onClick={() =>
                setShowPanel(false)
              }
            >
              ←
            </button>

            <div className="achievement-title">
              <span>ABOUT ME</span>
            </div>

            <div className="achievement-item">
              <strong>
                ELECTRONICS &
              </strong>

              <span>
                COMMUNICATION ENGINEERING
              </span>
            </div>

            <div className="achievement-item">
              <strong>2027</strong>

              <span>
                GRADUATING
              </span>
            </div>

            <div className="achievement-item">
              <strong>
                G.L BAJAJ
              </strong>

              <span>
                INSTITUTE OF TECHNOLOGY AND
                MANAGEMENT
              </span>
            </div>

            <div className="achievement-item">
              <strong>
                S.D. PUBLIC SCHOOL
              </strong>

              <span>
                SCHOOL
              </span>
            </div>

          </div>
        ) : (
          <button
            className="panel-open"
            onClick={() =>
              setShowPanel(true)
            }
          >
            →
          </button>
        )}

        <div className="profile-photo">
          <img
            src="/images/gaurav.png"
            alt="Gaurav Sharma"
          />
        </div>

        <p className="hero-label">
          SOFTWARE DEVELOPER
        </p>

        <h1>
          GAURAV
          <span>SHARMA</span>
        </h1>

        <p className="hero-description">
          I build software, solve problems,
          and turn ideas into real products.
        </p>

      </section>

      {/* PROJECTS */}

      <section className="projects-section">

        <div className="projects-heading">
          <p>
            SELECTED WORK (click on cards to know
            more)
          </p>

          <h2>
            PROJECTS
          </h2>
        </div>

        <div className="projects-grid">

          <div
            className="project-card"
            onClick={() =>
              setSelectedProject(
                projects.cine
              )
            }
          >
            <img
              src="/images/cine.png"
              alt="Cine-Hook"
            />

            <div className="project-content">
            </div>
          </div>

          <div
            className="project-card"
            onClick={() =>
              setSelectedProject(
                projects.drone
              )
            }
          >
            <img
              src="/images/drone.png"
              alt="Drone Detection"
            />

            <div className="project-content">
            </div>
          </div>

          <div
            className="project-card"
            onClick={() =>
              setSelectedProject(
                projects.trace
              )
            }
          >
            <img
              src="/images/pcb.png"
              alt="Trace-Wise"
            />

            <div className="project-content">
            </div>
          </div>

          <div
            className="project-card"
            onClick={() =>
              setSelectedProject(
                projects.todo
              )
            }
          >
            <img
              src="/images/todo.png"
              alt="Todo App"
            />

            <div className="project-content">
            </div>
          </div>

        </div>

        {selectedProject && (
          <div className="project-detail-panel">

            <button
              className="project-detail-close"
              onClick={() =>
                setSelectedProject(null)
              }
            >
              ×
            </button>

            <h2>
              {selectedProject.name}
            </h2>

            <div className="project-detail-item">
              <span>
                WHAT IT DOES
              </span>

              <p>
                {
                  selectedProject.description
                }
              </p>
            </div>

            <div className="project-detail-item">
              <span>
                TECH STACK
              </span>

              <p>
                {
                  selectedProject.stack
                }
              </p>
            </div>

            <div className="project-detail-item">
              <span>
                TYPE
              </span>

              <p>
                {selectedProject.type}
              </p>
            </div>

            <div className="project-detail-links">

              <a href={selectedProject.github}>
                GITHUB
              </a>

              <a href={selectedProject.demo}>
                LIVE DEMO
              </a>

            </div>

          </div>
        )}

      </section>

      {/* CODING PROFILES */}

      <CodingProfiles />

      {/* TYPING TRANSITION */}

      <section
        ref={typingSectionRef}
        className="beyond-transition-section"
      >

        <div className="typing-text">
          {typedText}

          <span className="typing-cursor">
            |
          </span>
        </div>

        {showBeyondArrow && (
          <button
            className="beyond-arrow"
            onClick={() =>
              document
                .querySelector(
                  ".beyond-creation-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
            }
          >
            →
          </button>
        )}

      </section>

      {/* BEYOND CREATION */}

      <BeyondCreation />

      <Footer />

    </div>
  );
}

function Footer() {
  return (
    <footer className="portfolio-footer">

      <div className="footer-links">

        <a
          href="https://github.com/GauravSh7/todo-fullstack"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          GitHub
        </a>

        <a
          href="mailto:gaurav895854@gmail.com"
          title="Gmail"
        >
          Gmail
        </a>

        <a
          href="https://www.linkedin.com/in/gaurav-sharma-ga"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          LinkedIn
        </a>

        <a
          href="https://drive.google.com/file/d/1zBMqnheXN4byZSs0o9m4zGql8S0KF79T/view?usp=drivesdk"
          target="_blank"
          rel="noopener noreferrer"
          title="Resume"
        >
          Resume
        </a>

      </div>

    </footer>
  );
}

export default App;