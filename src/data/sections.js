import * as THREE from "three";
import {
  DESTINATION_ORDER,
  DISTRICT_BOUNDS,
  getDistrictDestination,
} from "./districtMap";
import { getDestinationAnchor } from "./destinationAnchors";

export const DISTRICT_HALF_WIDTH = DISTRICT_BOUNDS.halfWidth;
export const DISTRICT_HALF_DEPTH = DISTRICT_BOUNDS.halfDepth;
export const INTERACTION_RADIUS = 8.5;
export const CLAMP_RADIUS = DISTRICT_BOUNDS.clampRadius;

const accessToXZ = (accessPosition) => {
  if (Array.isArray(accessPosition) && accessPosition.length >= 2) {
    return [accessPosition[0], accessPosition[1]];
  }
  if (accessPosition && typeof accessPosition === "object") {
    return [accessPosition.x, accessPosition.z];
  }
  return null;
};

const accessToY = (accessPosition) => {
  if (accessPosition && typeof accessPosition === "object" && Number.isFinite(accessPosition.y)) {
    return accessPosition.y;
  }
  return 0;
};

const districtPosition = (id) => {
  const anchor = getDestinationAnchor(id);
  const [x, z] = accessToXZ(anchor?.accessPosition) ||
    anchor?.entrancePosition ||
    anchor?.targetPosition ||
    getDistrictDestination(id).accessPosition;
  return new THREE.Vector3(x, 0, z);
};

const destinationFields = (id) => {
  const destination = getDistrictDestination(id);
  const anchor = getDestinationAnchor(id);
  const accessPosition = accessToXZ(anchor?.accessPosition) ||
    anchor?.entrancePosition ||
    anchor?.targetPosition ||
    destination.accessPosition;
  return {
    buildingPosition: anchor?.position || destination.buildingPosition,
    accessPosition,
    accessY: accessToY(anchor?.accessPosition),
    accessRadius: anchor?.accessRadius || destination.accessRadius,
    key: destination.key,
    entrancePosition: accessPosition,
    calibratedAccessPosition: anchor?.accessPosition,
    signPosition: accessPosition || destination.signPosition,
    pinPosition: anchor?.pinPosition,
    pinHeightOffset: anchor?.pinHeightOffset,
    contentType: anchor?.contentType || id,
    destinationAnchor: anchor,
  };
};

export function getSectionAccessPosition(section) {
  if (Array.isArray(section?.accessPosition) && section.accessPosition.length >= 2) {
    return section.accessPosition;
  }

  if (import.meta.env.DEV) {
    console.warn("Missing section.accessPosition; falling back to origin", section?.id);
  }

  return [0, 0];
}

export const SECTIONS = [
  {
    id: "resume",
    title: "Resume House",
    shortLabel: "Resume House",
    interactionKey: "R",
    interactionCode: "KeyR",
    description:
      "A concise recruiter-facing overview of education, focus areas, and downloadable resume details.",
    angle: Math.PI,
    rotationY: getDistrictDestination("resume").rotationY,
    position: districtPosition("resume"),
    ...destinationFields("resume"),
    themeColor: getDistrictDestination("resume").themeColor,
    icon: {
      name: "FileText",
      type: "archive",
    },
    content: {
      summary:
        "Product-minded developer focused on interactive web experiences, practical AI features, and polished frontend systems.",
      education: [
        {
          school: "University Placeholder",
          program: "B.S. Computer Science",
          period: "2022 - 2026",
          detail: "Coursework in software engineering, data systems, and human-computer interaction.",
        },
      ],
      highlights: [
        "React and 3D web interfaces",
        "Fast prototyping from idea to usable product",
        "Clear product thinking and implementation discipline",
      ],
      resumeFileLabel: "Resume PDF placeholder",
    },
  },
  {
    id: "projects",
    title: "Projects Pavilion",
    shortLabel: "Projects Pavilion",
    interactionKey: "P",
    interactionCode: "KeyP",
    description:
      "Selected builds presented as high-signal case-study bays for interaction, product thinking, and engineering execution.",
    angle: -Math.PI / 2,
    rotationY: getDistrictDestination("projects").rotationY,
    position: districtPosition("projects"),
    ...destinationFields("projects"),
    themeColor: getDistrictDestination("projects").themeColor,
    icon: {
      name: "FolderKanban",
      type: "garage",
    },
    content: {
      projects: [
        {
          title: "MaanOS Portfolio Showroom",
          description:
            "A compact interactive showroom with a premium landing site, driveable campus slice, and proximity-based OS windows.",
          techStack: ["React", "Three.js", "React Three Fiber", "Rapier"],
          linkLabel: "Case study placeholder",
        },
        {
          title: "AI Workflow Assistant",
          description:
            "Prototype for turning rough user input into structured tasks, summaries, and follow-up actions.",
          techStack: ["React", "OpenAI API", "Node.js"],
          linkLabel: "Demo placeholder",
        },
        {
          title: "Product Metrics Dashboard",
          description:
            "Responsive dashboard concept for tracking funnel health, usage trends, and operating metrics.",
          techStack: ["TypeScript", "Charts", "CSS Grid"],
          linkLabel: "Repo placeholder",
        },
      ],
    },
  },
  {
    id: "skills",
    title: "Skills Lab",
    shortLabel: "Skills Lab",
    interactionKey: "S",
    interactionCode: "KeyS",
    description:
      "A structured view of the technical toolkit behind product interfaces, AI workflows, and shipping discipline.",
    angle: Math.PI,
    rotationY: getDistrictDestination("skills").rotationY,
    position: districtPosition("skills"),
    ...destinationFields("skills"),
    themeColor: getDistrictDestination("skills").themeColor,
    icon: {
      name: "Wrench",
      type: "lab",
    },
    content: {
      groups: {
        frontend: ["React", "JavaScript", "TypeScript", "CSS", "Responsive UI"],
        backend: ["Node.js", "REST APIs", "Auth flows", "Databases"],
        "AI/ML": ["Prompting", "LLM app patterns", "Embeddings", "Evaluation basics"],
        tools: ["Git", "Vite", "Figma", "Playwright", "Deployment workflows"],
      },
    },
  },
  {
    id: "experience",
    title: "Experience Hall",
    shortLabel: "Experience Hall",
    interactionKey: "E",
    interactionCode: "KeyE",
    description:
      "A timeline of roles, projects, and practice areas that shaped the way Maan builds software.",
    angle: Math.PI / 2,
    rotationY: getDistrictDestination("experience").rotationY,
    position: districtPosition("experience"),
    ...destinationFields("experience"),
    themeColor: getDistrictDestination("experience").themeColor,
    icon: {
      name: "Briefcase",
      type: "hall",
    },
    content: {
      timeline: [
        {
          role: "Frontend Developer",
          organization: "Startup Placeholder",
          period: "2025 - Present",
          detail:
            "Built product screens, reusable UI pieces, and prototypes for customer-facing workflows.",
        },
        {
          role: "AI Product Builder",
          organization: "Independent Projects",
          period: "2024 - 2025",
          detail:
            "Explored LLM features, structured data flows, and lightweight interfaces for real user tasks.",
        },
        {
          role: "Student Developer",
          organization: "Campus / Personal Work",
          period: "2022 - 2024",
          detail:
            "Shipped small apps, learned delivery habits, and practiced turning ambiguous ideas into working software.",
        },
      ],
    },
  },
  {
    id: "socials",
    title: "Socials Gate",
    shortLabel: "Socials Gate",
    interactionKey: "L",
    interactionCode: "KeyL",
    description:
      "Contact routes for code, career presence, email, and personal work.",
    angle: 0,
    rotationY: getDistrictDestination("socials").rotationY,
    position: districtPosition("socials"),
    ...destinationFields("socials"),
    themeColor: getDistrictDestination("socials").themeColor,
    icon: {
      name: "Radio",
      type: "tower",
    },
    content: {
      links: [
        {
          label: "GitHub",
          value: "github.com/placeholder",
          href: "#",
        },
        {
          label: "LinkedIn",
          value: "linkedin.com/in/placeholder",
          href: "#",
        },
        {
          label: "Email",
          value: "hello@example.com",
          href: "mailto:hello@example.com",
        },
        {
          label: "Personal Site",
          value: "portfolio.example.com",
          href: "#",
        },
      ],
    },
  },
  {
    id: "interests",
    title: "About / Contact Center",
    shortLabel: "About / Contact",
    interactionKey: "I",
    interactionCode: "KeyI",
    description:
      "A quick read on routines and interests that influence Maan's taste, energy, and product judgment.",
    angle: -Math.PI / 2,
    rotationY: getDistrictDestination("interests").rotationY,
    position: districtPosition("interests"),
    ...destinationFields("interests"),
    themeColor: getDistrictDestination("interests").themeColor,
    icon: {
      name: "Sparkles",
      type: "lounge",
    },
    content: {
      interests: [
        {
          title: "Gym",
          detail: "Consistent training, progress tracking, and better daily energy.",
        },
        {
          title: "Music",
          detail: "Listening, discovery, and using music as a focus tool while building.",
        },
        {
          title: "Travel",
          detail: "Finding new places, observing product details, and collecting visual references.",
        },
        {
          title: "Gaming",
          detail: "Interactive systems, feedback loops, and world design inspiration.",
        },
        {
          title: "Building Products",
          detail: "Turning small ideas into working tools people can actually try.",
        },
      ],
    },
  },
];

export const SECTION_COUNT = SECTIONS.length;
export const NAVIGATION_SECTIONS = DESTINATION_ORDER.map((id) =>
  SECTIONS.find((section) => section.id === id)
).filter(Boolean);

export function polarPosition(radius, angle) {
  return new THREE.Vector3(
    Math.cos(angle) * radius,
    0,
    Math.sin(angle) * radius
  );
}

export function getSectionById(id) {
  return SECTIONS.find((section) => section.id === id);
}
