import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, Vector3 } from "three";
import { getPortfolioContent } from "../../data/portfolioContent";
import { AmbientField } from "./AmbientField";
import { ContactForm } from "./ContactForm";

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function WebsiteMedia({ src, alt, className = "" }) {
  return (
    <div className={`website-media-frame ${className}`}>
      {src ? <img src={src} alt={alt} onError={(event) => event.currentTarget.remove()} /> : null}
    </div>
  );
}

function WebsiteContactMedia({ content }) {
  const media = [
    ...(content.gallery || []).map((item) => ({ ...item, type: "image" })),
    ...(content.video ? [{ ...content.video, type: "video" }] : []),
  ];

  if (!media.length) return null;

  return (
    <>
      <p className="website-contact-media-heading">Snapshots</p>
      <div className="website-contact-media reveal-item" aria-label="Snapshots">
        {media.map((item, index) => (
          <div className="website-contact-media-item" key={item.src || index}>
            {item.type === "video" ? (
              <video src={item.src} muted playsInline preload="metadata" controls />
            ) : (
              <img src={item.src} alt={item.alt || `Snapshot ${index + 1}`} onError={(event) => event.currentTarget.remove()} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function updateCardTilt(event) {
  const element = event.currentTarget;
  const rect = element.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  element.style.setProperty("--card-rotate-x", `${y * -4}deg`);
  element.style.setProperty("--card-rotate-y", `${x * 5}deg`);
  element.style.setProperty("--card-glow-x", `${(x + 0.5) * 100}%`);
  element.style.setProperty("--card-glow-y", `${(y + 0.5) * 100}%`);
}

function resetCardTilt(event) {
  event.currentTarget.style.setProperty("--card-rotate-x", "0deg");
  event.currentTarget.style.setProperty("--card-rotate-y", "0deg");
}

function getProjectDestination(project) {
  const actions = project.actions?.filter((action) => action.href) || [];
  const priorities = [
    /live|demo|watch/i,
    /report|pdf|presentation|slides/i,
    /github|repository|source/i,
  ];

  for (const priority of priorities) {
    const match = actions.find((action) => priority.test(action.label));
    if (match) return match.href;
  }

  return actions[0]?.href || null;
}

const LANDING_CHARACTER_PATH = "/models/landing-character.glb";
const AVATAR_SCALE = 1.18;
const AVATAR_POSITION = [0, -0.25, 0];
const AVATAR_ROTATION = [0, -0.08, 0];
const CAMERA_POSITION = [0, 1.3, 6];
const CAMERA_TARGET = [0, 1.3, 0];
const CAMERA_FOV = 20;
const AVATAR_ROOT_Y_ROTATION = 0;

class CharacterErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn("Landing character could not be loaded.", error);
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function LandingCharacter({ pointerRef, reducedMotion }) {
  const modelRef = useRef(null);
  const animationRootRef = useRef(null);
  const { scene, animations } = useGLTF(LANDING_CHARACTER_PATH);
  const { actions } = useAnimations(animations, animationRootRef);
  const avatarRoot = useMemo(() => scene.getObjectByName("Hips"), [scene]);
  const modelTransform = useMemo(() => {
    scene.updateWorldMatrix(true, true);
    const bounds = new Box3().setFromObject(scene);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const scale = size.y > 0 ? (4 / size.y) * AVATAR_SCALE : AVATAR_SCALE;

    return {
      position: [-center.x * scale, -center.y * scale, -center.z * scale],
      scale,
    };
  }, [scene]);

  useEffect(() => {
    const firstClip = animations[0];
    const action = firstClip ? actions[firstClip.name] : null;
    if (!action) return undefined;

    action.reset().play();
    return () => action.stop();
  }, [actions, animations]);

  useFrame((_, delta) => {
    if (!modelRef.current) return;
    if (avatarRoot) avatarRoot.rotation.y = AVATAR_ROOT_Y_ROTATION;
    const pointer = pointerRef.current;
    const targetX = reducedMotion ? AVATAR_ROTATION[0] : AVATAR_ROTATION[0] + pointer.y * -0.045;
    const targetY = reducedMotion ? AVATAR_ROTATION[1] : AVATAR_ROTATION[1] + pointer.x * 0.08;
    const smoothing = 1 - Math.exp(-delta * 7);
    modelRef.current.rotation.x += (targetX - modelRef.current.rotation.x) * smoothing;
    modelRef.current.rotation.y += (targetY - modelRef.current.rotation.y) * smoothing;
  });

  return (
    <group ref={modelRef} position={AVATAR_POSITION} rotation={AVATAR_ROTATION}>
      <group position={modelTransform.position} scale={modelTransform.scale}>
        <group ref={animationRootRef}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

function CharacterStage({ stageRef }) {
  const pointerRef = useRef({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(query.matches);
    updatePreference();
    query.addEventListener?.("change", updatePreference);
    return () => query.removeEventListener?.("change", updatePreference);
  }, []);

  const updateStageLight = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--hero-light-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--hero-light-y", `${event.clientY - rect.top}px`);
    event.currentTarget.style.setProperty("--hero-rotate-x", `${y * -7}deg`);
    event.currentTarget.style.setProperty("--hero-rotate-y", `${x * 10}deg`);
    pointerRef.current.x = x * 2;
    pointerRef.current.y = y * 2;
  };

  const resetStage = () => {
    stageRef.current?.style.setProperty("--hero-rotate-x", "0deg");
    stageRef.current?.style.setProperty("--hero-rotate-y", "0deg");
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  };

  return (
    <aside
      ref={stageRef}
      className="website-character-card"
      aria-label="Interactive 3D character"
      onPointerLeave={resetStage}
      onPointerMove={updateStageLight}
    >
      <div className="website-character-glow" />
      <div className="landing-character-canvas" aria-hidden="true">
          <CharacterErrorBoundary>
            <Canvas
              camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, near: 0.01, far: 100 }}
              dpr={[1, 1.75]}
              gl={{ alpha: true, antialias: true }}
              onCreated={({ camera }) => camera.lookAt(...CAMERA_TARGET)}
            >
              <ambientLight intensity={1.25} />
              <directionalLight position={[3, 5, 5]} intensity={2.4} />
              <directionalLight position={[-4, 2.5, -3]} intensity={1.8} color="#75dfff" />
              <pointLight position={[0, 1, 4]} intensity={1.1} color="#fff4dc" />
              <Suspense fallback={null}>
                <LandingCharacter pointerRef={pointerRef} reducedMotion={reducedMotion} />
              </Suspense>
            </Canvas>
          </CharacterErrorBoundary>
        </div>
    </aside>
  );
}

useGLTF.preload(LANDING_CHARACTER_PATH);

const SKILL_ORBS = [
  { label: "AI", category: "AI / Data", x: 12, y: 23, size: "large", tone: "cyan" },
  { label: "Data", category: "AI / Data", x: 30, y: 16, size: "medium", tone: "white" },
  { label: "Python", category: "AI / Data", x: 49, y: 25, size: "large", tone: "blue" },
  { label: "React", category: "Software / Web", x: 70, y: 15, size: "medium", tone: "purple" },
  { label: "SQL", category: "AI / Data", x: 88, y: 29, size: "small", tone: "gold" },
  { label: "Product", category: "Product / Business", x: 15, y: 53, size: "medium", tone: "green" },
  { label: "Automation", category: "AI / Data", x: 36, y: 49, size: "medium", tone: "purple" },
  { label: "Dashboards", category: "Product / Business", x: 59, y: 48, size: "medium", tone: "cyan" },
  { label: "Web", category: "Software / Web", x: 82, y: 55, size: "small", tone: "blue" },
  { label: "Analytics", category: "AI / Data", x: 10, y: 82, size: "medium", tone: "gold" },
  { label: "Operations", category: "Operations / Admin", x: 27, y: 75, size: "medium", tone: "green" },
  { label: "Admin", category: "Operations / Admin", x: 46, y: 84, size: "small", tone: "white" },
  { label: "Communication", category: "Communication / People", x: 65, y: 73, size: "medium", tone: "green" },
  { label: "Creative", category: "Creative / Other", x: 85, y: 83, size: "medium", tone: "purple" },
];

function SkillOrbCluster({ activeCategory, onActivate }) {
  const clusterRef = useRef(null);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const orbs = Array.from(cluster.querySelectorAll(".skill-orb"));
    const motion = orbs.map(() => ({ x: 0, y: 0, targetX: 0, targetY: 0 }));
    let frameId = 0;

    const animate = () => {
      let moving = false;
      motion.forEach((item, index) => {
        const returning = item.targetX === 0 && item.targetY === 0;
        const smoothing = returning ? 0.09 : 0.18;
        item.x += (item.targetX - item.x) * smoothing;
        item.y += (item.targetY - item.y) * smoothing;
        if (Math.abs(item.targetX - item.x) > 0.05 || Math.abs(item.targetY - item.y) > 0.05) moving = true;
        orbs[index].style.setProperty("--repel-x", `${item.x.toFixed(2)}px`);
        orbs[index].style.setProperty("--repel-y", `${item.y.toFixed(2)}px`);
      });
      frameId = moving ? window.requestAnimationFrame(animate) : 0;
    };

    const startAnimation = () => {
      if (!frameId) frameId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (event) => {
      const clusterRect = cluster.getBoundingClientRect();
      orbs.forEach((orb, index) => {
        const orbDefinition = SKILL_ORBS[index];
        const dx = clusterRect.left + clusterRect.width * (orbDefinition.x / 100) - event.clientX;
        const dy = clusterRect.top + clusterRect.height * (orbDefinition.y / 100) - event.clientY;
        const distance = Math.max(Math.hypot(dx, dy), 1);
        const influence = Math.max(0, 1 - distance / 185);
        const force = influence * influence * 52;
        motion[index].targetX = (dx / distance) * force;
        motion[index].targetY = (dy / distance) * force;
        orb.style.setProperty("--orb-brightness", (1 + influence * 0.3).toFixed(3));
        orb.style.setProperty("--orb-scale", (1 + influence * 0.08).toFixed(3));
      });
      cluster.style.setProperty("--orb-glow-x", `${event.clientX - clusterRect.left}px`);
      cluster.style.setProperty("--orb-glow-y", `${event.clientY - clusterRect.top}px`);
      startAnimation();
    };

    const onPointerLeave = () => {
      motion.forEach((item, index) => {
        item.targetX = 0;
        item.targetY = 0;
        orbs[index].style.setProperty("--orb-brightness", "1");
        orbs[index].style.setProperty("--orb-scale", "1");
      });
      startAnimation();
    };

    cluster.addEventListener("pointermove", onPointerMove, { passive: true });
    cluster.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.cancelAnimationFrame(frameId);
      cluster.removeEventListener("pointermove", onPointerMove);
      cluster.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={clusterRef} className="skill-orb-cluster" aria-label="Interactive skill constellation">
      <div className="skill-orb-ambient" />
      <svg className="skill-constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M12 23 L30 16 L49 25 L70 15 L88 29 L82 55 L85 83 L65 73 L46 84 L27 75 L10 82 L15 53 Z" />
        <path d="M12 23 L36 49 L59 48 L88 29 M15 53 L27 75 L46 84 L65 73 L85 83 M49 25 L36 49 L59 48 L70 15" />
        <circle cx="50" cy="50" r="34" />
      </svg>
      <p className="skill-orb-caption"><span>Interactive toolkit</span> Move through the constellation</p>
      {SKILL_ORBS.map((orb, index) => (
        <button
          className={`skill-orb skill-orb-${orb.size} skill-orb-${orb.tone}${activeCategory === orb.category ? " is-category-active" : ""}`}
          key={orb.label}
          data-orb={orb.label}
          type="button"
          aria-label={`Highlight ${orb.category} skills`}
          aria-pressed={activeCategory === orb.category}
          onClick={() => onActivate(orb.category)}
          onFocus={() => onActivate(orb.category)}
          onPointerEnter={() => onActivate(orb.category)}
          style={{ "--orb-x": `${orb.x}%`, "--orb-y": `${orb.y}%`, "--orb-delay": `${index * -0.48}s` }}
        >
          <span>{orb.label}</span>
        </button>
      ))}
    </div>
  );
}

export function PortfolioWebsite({
  onOpenSection,
  onEnterWorld,
  onBackToStart,
  onViewResume,
}) {
  const websiteRef = useRef(null);
  const heroVisualRef = useRef(null);
  const [activeSkillCategory, setActiveSkillCategory] = useState(null);
  const [activeNav, setActiveNav] = useState("portfolio-home");
  const [activeAboutTab, setActiveAboutTab] = useState(0);
  const projects = getPortfolioContent("projects");
  const skills = getPortfolioContent("skills");
  const experience = getPortfolioContent("experience");
  const resume = getPortfolioContent("resume");
  const contact = getPortfolioContent("socials");
  const about = getPortfolioContent("interests");
  const featuredProjects = projects.projects;

  useEffect(() => {
    const website = websiteRef.current;
    if (!website) return undefined;

    let frameId = 0;
    const onPointerMove = (event) => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        const normalizedX = event.clientX / window.innerWidth - 0.5;
        const normalizedY = event.clientY / window.innerHeight - 0.5;
        website.style.setProperty("--mouse-x", `${event.clientX}px`);
        website.style.setProperty("--mouse-y", `${event.clientY}px`);
        website.style.setProperty("--mouse-nx", `${normalizedX}`);
        website.style.setProperty("--mouse-ny", `${normalizedY}`);
        website.style.setProperty("--parallax-x", `${normalizedX * 30}px`);
        website.style.setProperty("--parallax-y", `${normalizedY * 22}px`);
        website.style.setProperty("--parallax-x-negative", `${normalizedX * -30}px`);
        website.style.setProperty("--parallax-y-negative", `${normalizedY * -22}px`);
        website.style.setProperty("--decor-x", `${normalizedX * 7}px`);
        website.style.setProperty("--decor-x-negative", `${normalizedX * -7}px`);
        website.style.setProperty("--decor-y", `${normalizedY * 6}px`);

        if (heroVisualRef.current) {
          heroVisualRef.current.style.setProperty("--hero-rotate-x", `${normalizedY * -8}deg`);
          heroVisualRef.current.style.setProperty("--hero-rotate-y", `${normalizedX * 10}deg`);
        }
      });
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = website.querySelectorAll(".reveal-target");
    const navigationTargets = website.querySelectorAll("[data-stream-section]");
    let observer;
    let navigationObserver;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("is-visible"));
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.16, rootMargin: "0px 0px -5% 0px" }
      );
      revealTargets.forEach((target) => observer.observe(target));
    }

    if ("IntersectionObserver" in window) {
      navigationObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible?.target.id) setActiveNav(visible.target.id);
        },
        { threshold: [0.2, 0.45, 0.7], rootMargin: "-18% 0px -56% 0px" }
      );
      navigationTargets.forEach((target) => navigationObserver.observe(target));
    }

    if (!reducedMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(frameId);
      if (!reducedMotion) window.removeEventListener("pointermove", onPointerMove);
      observer?.disconnect();
      navigationObserver?.disconnect();
    };
  }, []);

  const goTo = (id) => {
    setActiveNav(id);
    scrollToSection(id);
  };

  const continueCards = [
    { label: "Interactive", title: "Drive the 3D World", detail: "Interactive driving portfolio", action: onEnterWorld, art: "world" },
    { label: "Collection", title: "Featured Projects", detail: "Practical tools, dashboards, web builds, and experiments", action: () => goTo("site-projects"), art: "projects" },
    { label: "Profile", title: "Resume", detail: "Experience and technical strengths", action: () => goTo("site-resume"), art: "resume" },
    { label: "Connect", title: "Contact", detail: "Professional and creative channels", action: () => goTo("site-contact"), art: "contact" },
  ];

  return (
    <section ref={websiteRef} className="portfolio-website stream-website interactive-shell" aria-label="Maan Grover Portfolio Hub">
      <div className="landing-gradient" />
      <div className="landing-grid" />
      <div className="cinematic-noise" />
      <AmbientField />
      <div className="portfolio-light-beam beam-one" />
      <div className="portfolio-light-beam beam-two" />
      <div className="interactive-spotlight" />
      <div className="cursor-glow" />

      <header className="portfolio-site-nav" aria-label="Portfolio website navigation">
        <button type="button" className="stream-brand" onClick={() => goTo("portfolio-home")}>MAAN GROVER</button>
        <nav>
          <button className={activeNav === "portfolio-home" ? "active" : ""} type="button" onClick={() => goTo("portfolio-home")}>Home</button>
          <button className={activeNav === "site-projects" ? "active" : ""} type="button" onClick={() => goTo("site-projects")}>Projects</button>
          <button className={activeNav === "site-skills" ? "active" : ""} type="button" onClick={() => goTo("site-skills")}>Skills</button>
          <button className={activeNav === "site-experience" ? "active" : ""} type="button" onClick={() => goTo("site-experience")}>Experience</button>
          <button className={activeNav === "site-resume" ? "active" : ""} type="button" onClick={() => goTo("site-resume")}>Resume</button>
          <button className={activeNav === "site-contact" ? "active" : ""} type="button" onClick={() => goTo("site-contact")}>Contact</button>
          <button type="button" onClick={onEnterWorld}>Enter 3D World</button>
          <button type="button" onClick={onBackToStart}>Back to Start</button>
        </nav>
      </header>

      <main className="portfolio-site-content" id="portfolio-home">
        <section className="portfolio-site-hero stream-hero reveal-target is-visible" data-stream-section>
          <div className="stream-hero-copy">
            <p className="start-kicker">Featured Portfolio</p>
            <h1>Maan Grover</h1>
            <p>
              Product-minded builder creating practical AI/data tools, dashboards, web
              experiences, operations workflows, customer-facing systems, and polished
              interactive projects.
            </p>
            <div className="landing-actions">
              <button className="start-button primary" type="button" onClick={onEnterWorld}>
                <span aria-hidden="true">▶</span> Play 3D World
              </button>
              <button className="start-button secondary" type="button" onClick={() => goTo("site-projects")}>View Projects</button>
              <button className="start-button secondary" type="button" onClick={onViewResume}>
                View Resume
              </button>
            </div>
            <div className="stream-meta" aria-label="Portfolio categories">
              <span>Product</span><i /> <span>AI/Data</span><i /> <span>Operations</span><i /> <span>Interactive Systems</span>
            </div>
          </div>
          <CharacterStage stageRef={heroVisualRef} />
        </section>

        <section className="stream-section reveal-target" id="site-continue">
          <div className="stream-section-heading"><div><p>Pick up where you left off</p><h2>Continue Exploring</h2></div></div>
          <div className="stream-rail stream-feature-rail">
            {continueCards.map((card) => (
              <button className={`stream-feature-card stream-art-${card.art} reveal-item`} type="button" key={card.title} onClick={card.action} onPointerMove={updateCardTilt} onPointerLeave={resetCardTilt}>
                <div className={`stream-feature-art feature-art-${card.art}`} aria-hidden="true"><i /><i /><i /><b /></div>
                <span>{card.label}</span><strong>{card.title}</strong><small>{card.detail}</small><i aria-hidden="true">▶</i>
              </button>
            ))}
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-about">
          <div className="stream-section-heading"><div><p>Portfolio Hub</p><h2>About</h2></div><button type="button" onClick={() => onOpenSection("interests")}>Open About Panel</button></div>
          <div className="stream-about-banner reveal-item">
            <p>{about.personalIntro}</p>
            <div className="about-preview-tabs" role="tablist" aria-label="About highlights">
              {about.cards.map((card, index) => (
                <button
                  className={activeAboutTab === index ? "active" : ""}
                  key={card.title}
                  type="button"
                  role="tab"
                  aria-selected={activeAboutTab === index}
                  onClick={() => setActiveAboutTab(index)}
                >
                  {card.title}
                </button>
              ))}
            </div>
            <div className="about-preview-detail" role="tabpanel" aria-live="polite">
              <strong>{about.cards[activeAboutTab]?.title}</strong>
              <span>{about.cards[activeAboutTab]?.body}</span>
            </div>
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-projects" data-stream-section>
          <div className="stream-section-heading"><div><p>{projects.eyebrow}</p><h2>Featured Projects</h2></div><button type="button" onClick={() => onOpenSection("projects")}>Open Projects Panel</button></div>
          <div className="stream-rail stream-project-rail">
            {featuredProjects.map((project) => {
              const destination = getProjectDestination(project);
              const projectPreview = (
                <>
                  <WebsiteMedia src={project.coverImage} alt={`${project.title} preview`} />
                  <span className="stream-status">{project.status}</span>
                  <div className="stream-project-copy"><h3>{project.title}</h3><p>{project.subtitle}</p></div>
                </>
              );

              return (
                <article className={`stream-project-card reveal-item${destination ? " is-clickable" : ""}`} key={project.id} onPointerMove={updateCardTilt} onPointerLeave={resetCardTilt}>
                  {destination ? (
                    <a className="stream-project-main" href={destination} target="_blank" rel="noreferrer" aria-label={`Open ${project.title}`}>
                      {projectPreview}
                    </a>
                  ) : (
                    <button className="stream-project-main" type="button" onClick={() => onOpenSection("projects")}>
                      {projectPreview}
                    </button>
                  )}
                  <div className="stream-quick-actions">
                    <button type="button" onClick={() => onOpenSection("projects")}>＋ Open Panel</button>
                    {project.actions?.filter((action) => action.href).slice(0, 2).map((action) => <a key={action.label} href={action.href} target="_blank" rel="noreferrer">{action.label} ↗</a>)}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-skills" data-stream-section>
          <div className="stream-section-heading"><div><p>{skills.eyebrow}</p><h2>Builder Toolkit</h2></div><button type="button" onClick={() => onOpenSection("skills")}>Open Skills Panel</button></div>
          <SkillOrbCluster activeCategory={activeSkillCategory} onActivate={setActiveSkillCategory} />
          <div className={`stream-rail stream-skill-rail website-skill-grid${activeSkillCategory ? " has-skill-highlight" : ""}`}>
            {skills.categories.map((category) => (
              <article
                className={`stream-collection-card reveal-item skill-category-card${activeSkillCategory === category.title ? " is-skill-highlighted" : ""}`}
                key={category.title}
                onPointerEnter={() => setActiveSkillCategory(category.title)}
              >
                <span>Collection</span><h3>{category.title}</h3><p>{category.level}</p>
                <div className="website-chip-list">
                  {category.skills.slice(0, 7).map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-experience" data-stream-section>
          <div className="stream-section-heading"><div><p>Career Timeline</p><h2>Experience</h2></div><button type="button" onClick={() => onOpenSection("experience")}>Open Experience Panel</button></div>
          <div className="stream-rail stream-episode-rail">
            {experience.timeline.slice(0, 7).map((entry, index) => (
              <article className="stream-episode-card reveal-item" key={`${entry.role}-${entry.date}`}>
                <span>Episode {String(index + 1).padStart(2, "0")}</span><small>{entry.date}</small>
                <h3>{entry.role}</h3><p>{entry.organization}</p>
                <div className="episode-detail">{entry.bullets?.[0]}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-resume" data-stream-section>
          <div className="stream-section-heading"><div><p>Professional Profile</p><h2>Resume</h2></div><button type="button" onClick={() => onOpenSection("resume")}>Open Resume Panel</button></div>
          <div className="stream-resume-card reveal-item">
            <div><span>Ready to review</span><h3>Maan Grover — Resume</h3><p>{resume.summary}</p></div>
            <div className="stream-resume-tags">{resume.strengths.map((strength) => <span key={strength}>{strength}</span>)}</div>
            <div className="content-actions">
              <a className="content-action" href={resume.pdfPath} target="_blank" rel="noreferrer">View Resume</a>
              <a className="content-action" href={resume.pdfPath} download>Download Resume</a>
            </div>
          </div>
        </section>

        <section className="stream-section reveal-target" id="site-contact" data-stream-section>
          <div className="stream-section-heading"><div><p>Connect</p><h2>Contact</h2></div><button type="button" onClick={() => onOpenSection("socials")}>Open Contact Panel</button></div>
          <WebsiteContactMedia content={contact} />
          <div className="stream-rail stream-contact-rail website-contact-grid">
            {contact.groups.flatMap((group) => group.cards).map((card) => (
              <article className="stream-contact-card reveal-item" key={card.label}>
                <span>Channel</span><h3>{card.label}</h3><p>{card.value}</p>
                {card.href ? <a href={card.href} target="_blank" rel="noreferrer">{card.action} ↗</a> : null}
              </article>
            ))}
          </div>
          <ContactForm className="website-contact-form" />
        </section>
      </main>
    </section>
  );
}
