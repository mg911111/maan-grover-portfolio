import { CuboidCollider } from "@react-three/rapier";
import { KitModel } from "../assets/KitModel";
import {
  COMMERCIAL_KIT,
  INDUSTRIAL_KIT,
  MODULAR_BUILDING_KIT,
  NATURE_KIT,
  SUBURBAN_KIT,
} from "../../data/kitAssets";
import { WORLD_COLORS } from "../../data/districtMap";
import { BuildingLabel } from "./BuildingLabel";
import { GlowStrip, MeshBox } from "./GlowStrip";

const BUILDING_COLLIDERS = {
  projects: [
    { name: "main", position: [0, 3.15, -2.0], args: [13.2, 3.15, 5.9] },
    { name: "west-wing", position: [-16.4, 2.45, -0.4], args: [3.6, 2.45, 3.9] },
    { name: "east-wing", position: [16.4, 2.45, -0.4], args: [3.6, 2.45, 3.9] },
  ],
  skills: [
    { name: "main", position: [0, 2.45, -0.6], args: [5.2, 2.45, 4.3] },
  ],
  experience: [
    { name: "main", position: [0, 2.8, -0.9], args: [4.6, 2.8, 4.0] },
  ],
  resume: [
    { name: "main", position: [0, 2.2, -0.6], args: [3.6, 2.2, 3.2] },
  ],
  socials: [
    { name: "main", position: [0, 5.2, -0.8], args: [2.2, 5.0, 2.2] },
  ],
  interests: [
    { name: "main", position: [0, 2.25, -0.35], args: [4.0, 2.25, 3.5] },
  ],
};

const BUILDING_GRADE = {
  color: "#33404a",
  colorStrength: 0.38,
  roughness: 0.62,
  metalness: 0.08,
};

const DETAIL_GRADE = {
  color: "#27343d",
  colorStrength: 0.46,
  roughness: 0.56,
  metalness: 0.12,
};

function BuildingColliders({ id }) {
  return (
    <>
      {(BUILDING_COLLIDERS[id] || []).map(({ name, position, args }) => (
        <CuboidCollider
          key={`${id}-${name}`}
          args={args}
          position={position}
          friction={1.1}
          restitution={0.025}
        />
      ))}
    </>
  );
}

function FacadeAccent({ width, position, accent, warm = false }) {
  const color = warm ? WORLD_COLORS.amber : accent;

  return (
    <group position={position}>
      <MeshBox
        position={[0, 0, -0.035]}
        args={[width, 0.68, 0.06]}
        color={WORLD_COLORS.signGlass}
        emissive={color}
        emissiveIntensity={0.035}
        metalness={0.18}
        roughness={0.32}
        opacity={0.76}
      />
      <GlowStrip
        position={[0, -0.42, 0.005]}
        args={[width * 0.82, 0.05, 0.04]}
        color={color}
        intensity={0.24}
        opacity={0.74}
      />
    </group>
  );
}

function RoofMast({ position, accent, height = 2.4 }) {
  return (
    <group position={position}>
      <MeshBox position={[0, height * 0.5, 0]} args={[0.14, height, 0.14]} color="#182631" metalness={0.26} roughness={0.42} />
      <mesh position={[0, height + 0.22, 0]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.68} roughness={0.3} />
      </mesh>
    </group>
  );
}

function SideBush({ position, accent = WORLD_COLORS.cyan }) {
  return (
    <group position={position}>
      <KitModel asset={NATURE_KIT.bushDetailed} position={[0, 0.04, 0]} scale={[1.8, 1.8, 1.8]} shadows="all" />
    </group>
  );
}

function ProjectsGarage({ accent }) {
  return (
    <group>
      <KitModel asset={INDUSTRIAL_KIT.buildingK} position={[0, 0.18, -2.4]} scale={[12.8, 7.4, 8.6]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={INDUSTRIAL_KIT.buildingH} position={[-16.4, 0.16, -0.4]} rotation={[0, 0.05, 0]} scale={[7.8, 5.8, 8.0]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={INDUSTRIAL_KIT.buildingH} position={[16.4, 0.16, -0.4]} rotation={[0, -0.05, 0]} scale={[7.8, 5.8, 8.0]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.overhangWide} position={[0, 4.85, 6.65]} scale={[19.5, 8.2, 6.2]} shadows="all" materialGrade={DETAIL_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.awningWide} position={[-9.6, 2.64, 6.82]} scale={[8.0, 5.3, 4.8]} shadows="all" materialGrade={DETAIL_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.awningWide} position={[9.6, 2.64, 6.82]} scale={[8.0, 5.3, 4.8]} shadows="all" materialGrade={DETAIL_GRADE} />
      <FacadeAccent width={17.2} position={[0, 2.48, 6.92]} accent={accent} />
      <BuildingLabel text="PROJECTS GARAGE" position={[0, 4.55, 7.04]} width={9.8} fontSize={0.46} accent={accent} />
      {[-13.4, 13.4].map((x) => (
        <mesh key={`garage-roof-fin-${x}`} position={[x, 7.45, -2.1]} castShadow>
          <boxGeometry args={[0.18, 2.1, 0.18]} />
          <meshStandardMaterial color="#17232c" emissive={accent} emissiveIntensity={0.08} metalness={0.32} roughness={0.36} />
        </mesh>
      ))}
    </group>
  );
}

function SkillsLab({ accent }) {
  return (
    <group>
      <KitModel asset={COMMERCIAL_KIT.buildingI} position={[0, 0.15, -0.5]} scale={[9.6, 5.2, 7.6]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={MODULAR_BUILDING_KIT.towerB} position={[-6.1, 0.14, -1.6]} rotation={[0, 0.08, 0]} scale={[4.8, 3.9, 4.8]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.awningWide} position={[0, 2.82, 4.86]} scale={[7.2, 4.5, 4.0]} shadows="all" materialGrade={DETAIL_GRADE} />
      <FacadeAccent width={8.8} position={[0, 1.88, 5.02]} accent={accent} />
      <BuildingLabel text="SKILLS LAB" position={[0, 3.05, 4.94]} width={7.4} fontSize={0.46} accent={accent} />
      <MeshBox position={[5.25, 4.45, -2.55]} args={[0.16, 2.1, 0.16]} color="#87959b" metalness={0.5} roughness={0.28} />
      <mesh position={[5.25, 5.7, -2.55]}>
        <sphereGeometry args={[0.25, 12, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.72} roughness={0.3} />
      </mesh>
      <RoofMast position={[4.2, 5.25, -2.4]} accent={accent} height={2.0} />
    </group>
  );
}

function ExperienceHall({ accent }) {
  return (
    <group>
      <KitModel asset={COMMERCIAL_KIT.buildingK} position={[0, 0.16, -0.7]} scale={[8.4, 5.8, 8.2]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={SUBURBAN_KIT.buildingK} position={[-5.8, 0.14, -2.4]} rotation={[0, 0.16, 0]} scale={[4.9, 4.6, 5.1]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={SUBURBAN_KIT.buildingK} position={[5.8, 0.14, -2.4]} rotation={[0, -0.16, 0]} scale={[4.9, 4.6, 5.1]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.overhangWide} position={[0, 3.64, 4.9]} scale={[9.0, 4.6, 4.2]} shadows="all" materialGrade={DETAIL_GRADE} />
      <FacadeAccent width={9.6} position={[0, 1.74, 5.0]} accent={accent} warm />
      <BuildingLabel text="EXPERIENCE HALL" position={[0, 2.86, 5.05]} width={8.6} fontSize={0.42} accent={accent} />
    </group>
  );
}

function ResumeArchive({ accent }) {
  return (
    <group>
      <KitModel asset={COMMERCIAL_KIT.buildingN} position={[0, 0.17, -0.6]} scale={[6.5, 4.1, 5.3]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.buildingD} position={[-6.6, 0.14, -1.8]} scale={[4.8, 3.8, 4.8]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.buildingD} position={[6.6, 0.14, -1.8]} scale={[4.8, 3.8, 4.8]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.overhang} position={[0, 3.3, 4.8]} scale={[8.8, 4.7, 4.4]} shadows="all" materialGrade={DETAIL_GRADE} />
      <FacadeAccent width={7.4} position={[0, 1.34, 5.0]} accent={accent} warm />
      <BuildingLabel text="ABOUT STUDIO" position={[0, 3.12, 5.02]} width={7.4} fontSize={0.42} accent={accent} />
    </group>
  );
}

function SocialsTower({ accent }) {
  return (
    <group>
      <KitModel asset={COMMERCIAL_KIT.buildingE} position={[0, 0.14, 0]} scale={[5.4, 4.6, 5.2]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={COMMERCIAL_KIT.skyscraperA} position={[0, 1.35, -0.8]} scale={[4.2, 4.8, 4.2]} shadows="all" materialGrade={BUILDING_GRADE} />
      <BuildingLabel text="CONTACT CORNER" position={[0, 2.05, 4.42]} width={8.2} fontSize={0.38} accent={accent} />
      <mesh position={[0, 9.4, -0.8]} castShadow>
        <cylinderGeometry args={[0.2, 0.36, 9.0, 16]} />
        <meshStandardMaterial color="#21333f" metalness={0.3} roughness={0.38} />
      </mesh>
      {[5.4, 7.2, 9.0, 10.8, 12.6].map((y, index) => (
        <group key={y} rotation={[0, index * Math.PI * 0.5, 0]}>
          <GlowStrip position={[0, y, -0.8]} args={[6.4 - index * 0.54, 0.11, 0.11]} color={accent} intensity={0.42} />
          <mesh position={[3.25 - index * 0.26, y, -0.8]}>
            <sphereGeometry args={[0.21, 12, 8]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.66} roughness={0.3} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 14.28, -0.8]}>
        <sphereGeometry args={[0.56, 18, 10]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.9} roughness={0.28} />
      </mesh>
    </group>
  );
}

function InterestsLounge({ accent }) {
  return (
    <group>
      <KitModel asset={SUBURBAN_KIT.buildingF} position={[0, 0.16, -0.4]} scale={[7.1, 4.8, 6.5]} shadows="all" materialGrade={BUILDING_GRADE} />
      <KitModel asset={MODULAR_BUILDING_KIT.houseC} position={[5.8, 0.14, -1.9]} rotation={[0, -0.12, 0]} scale={[4.4, 3.5, 4.2]} shadows="all" materialGrade={BUILDING_GRADE} />
      <BuildingLabel text="PLAYGROUND" position={[0, 1.68, 5.54]} width={7.2} fontSize={0.42} accent={accent} />
      <SideBush position={[-7.4, 0, -1.6]} accent={WORLD_COLORS.cyan} />
      <SideBush position={[7.4, 0, -1.6]} accent={WORLD_COLORS.amber} />
      <SideBush position={[-6.4, 0, -4.4]} accent={WORLD_COLORS.amber} />
      <SideBush position={[6.4, 0, -4.4]} accent={WORLD_COLORS.cyan} />
    </group>
  );
}

function BuildingStructure({ id, accent }) {
  if (id === "projects") return <ProjectsGarage accent={accent} />;
  if (id === "skills") return <SkillsLab accent={accent} />;
  if (id === "experience") return <ExperienceHall accent={accent} />;
  if (id === "resume") return <ResumeArchive accent={accent} />;
  if (id === "socials") return <SocialsTower accent={accent} />;
  return <InterestsLounge accent={accent} />;
}

export function LandmarkBuilding({ section, active, discovered, districtDestination }) {
  const accent = districtDestination?.accent || section.themeColor;
  const hero = section.id === "projects";
  const buildingPosition = districtDestination?.buildingPosition || section.buildingPosition || [0, 0];

  return (
    <group
      position={[buildingPosition[0], 0, buildingPosition[1]]}
      rotation={[0, section.rotationY ?? 0, 0]}
    >
      <BuildingStructure id={section.id} accent={accent} />
      <BuildingColliders id={section.id} />
      {(active || discovered) && (
        <GlowStrip
          position={[0, 0.22, -7.2]}
          args={[hero ? 18 : 10.5, 0.07, 0.14]}
          color={accent}
          intensity={0.3}
        />
      )}
    </group>
  );
}
