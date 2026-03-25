import type { MuscleGroup } from '@fitin/core';

interface ExerciseSVGProps {
  muscleGroup: MuscleGroup;
  className?: string;
}

function DumbbellSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="20" y="70" width="30" height="60" rx="4" fill="#22c55e" stroke="#000" strokeWidth="3"/>
      <rect x="150" y="70" width="30" height="60" rx="4" fill="#22c55e" stroke="#000" strokeWidth="3"/>
      <rect x="10" y="80" width="15" height="40" rx="3" fill="#16a34a" stroke="#000" strokeWidth="3"/>
      <rect x="175" y="80" width="15" height="40" rx="3" fill="#16a34a" stroke="#000" strokeWidth="3"/>
      <rect x="50" y="92" width="100" height="16" rx="4" fill="#FFD803" stroke="#000" strokeWidth="3"/>
      <circle cx="100" cy="40" r="12" fill="#FF6B9D" stroke="#000" strokeWidth="2.5">
        <animate attributeName="cy" values="40;32;40" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <text x="100" y="44" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">
        <animate attributeName="y" values="44;36;44" dur="1.5s" repeatCount="indefinite"/>
        GO!
      </text>
    </svg>
  );
}

function BenchPressSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="30" y="140" width="140" height="12" rx="3" fill="#374151" stroke="#000" strokeWidth="3"/>
      <rect x="50" y="120" width="8" height="40" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="142" y="120" width="8" height="40" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="20" y="82" width="160" height="10" rx="3" fill="#FFD803" stroke="#000" strokeWidth="3">
        <animate attributeName="y" values="82;72;82" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="5" y="76" width="22" height="22" rx="4" fill="#22c55e" stroke="#000" strokeWidth="3">
        <animate attributeName="y" values="76;66;76" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="173" y="76" width="22" height="22" rx="4" fill="#22c55e" stroke="#000" strokeWidth="3">
        <animate attributeName="y" values="76;66;76" dur="2s" repeatCount="indefinite"/>
      </rect>
      <ellipse cx="100" cy="110" rx="28" ry="12" fill="#FF6B9D" stroke="#000" strokeWidth="2.5"/>
      <line x1="100" y1="98" x2="100" y2="60" stroke="#000" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="y2" values="60;50;60" dur="2s" repeatCount="indefinite"/>
      </line>
      <circle cx="90" cy="55" r="4" fill="#000">
        <animate attributeName="cy" values="55;45;55" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="110" cy="55" r="4" fill="#000">
        <animate attributeName="cy" values="55;45;55" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

function SquatSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="30" r="18" fill="#FFD803" stroke="#000" strokeWidth="3"/>
      <circle cx="94" cy="27" r="2.5" fill="#000"/>
      <circle cx="106" cy="27" r="2.5" fill="#000"/>
      <path d="M93 35 Q100 40 107 35" stroke="#000" strokeWidth="2" fill="none"/>
      <rect x="88" y="48" width="24" height="50" rx="8" fill="#22c55e" stroke="#000" strokeWidth="3">
        <animate attributeName="height" values="50;40;50" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="82" y="98" width="16" height="40" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="3" transform="rotate(-5 82 98)">
        <animate attributeName="height" values="40;50;40" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="102" y="98" width="16" height="40" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="3" transform="rotate(5 102 98)">
        <animate attributeName="height" values="40;50;40" dur="1.8s" repeatCount="indefinite"/>
      </rect>
      <rect x="78" y="138" width="20" height="10" rx="3" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="102" y="138" width="20" height="10" rx="3" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="60" y="50" width="80" height="8" rx="3" fill="#FFD803" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="50;58;50" dur="1.8s" repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}

function PullUpSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="20" y="20" width="160" height="10" rx="3" fill="#374151" stroke="#000" strokeWidth="3"/>
      <rect x="20" y="20" width="10" height="30" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="170" y="20" width="10" height="30" fill="#374151" stroke="#000" strokeWidth="2"/>
      <circle cx="100" cy="65" r="16" fill="#FFD803" stroke="#000" strokeWidth="3">
        <animate attributeName="cy" values="65;50;65" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="95" cy="62" r="2" fill="#000">
        <animate attributeName="cy" values="62;47;62" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="105" cy="62" r="2" fill="#000">
        <animate attributeName="cy" values="62;47;62" dur="2s" repeatCount="indefinite"/>
      </circle>
      <rect x="88" y="81" width="24" height="45" rx="8" fill="#A855F7" stroke="#000" strokeWidth="3">
        <animate attributeName="y" values="81;66;81" dur="2s" repeatCount="indefinite"/>
      </rect>
      <line x1="88" y1="85" x2="70" y2="40" stroke="#000" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="y1" values="85;70;85" dur="2s" repeatCount="indefinite"/>
      </line>
      <line x1="112" y1="85" x2="130" y2="40" stroke="#000" strokeWidth="3" strokeLinecap="round">
        <animate attributeName="y1" values="85;70;85" dur="2s" repeatCount="indefinite"/>
      </line>
      <rect x="82" y="126" width="14" height="35" rx="4" fill="#00B4D8" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="126;111;126" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="104" y="126" width="14" height="35" rx="4" fill="#00B4D8" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="126;111;126" dur="2s" repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}

function CurlSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="35" r="18" fill="#FFD803" stroke="#000" strokeWidth="3"/>
      <circle cx="94" cy="32" r="2.5" fill="#000"/>
      <circle cx="106" cy="32" r="2.5" fill="#000"/>
      <path d="M96 40 Q100 43 104 40" stroke="#000" strokeWidth="2" fill="none"/>
      <rect x="88" y="53" width="24" height="50" rx="8" fill="#FF6B9D" stroke="#000" strokeWidth="3"/>
      <line x1="88" y1="65" x2="70" y2="95" stroke="#000" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="70" y1="95" x2="62" y2="72" stroke="#000" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="y2" values="72;60;72" dur="1.2s" repeatCount="indefinite"/>
      </line>
      <rect x="55" y="65" width="14" height="14" rx="3" fill="#22c55e" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="65;53;65" dur="1.2s" repeatCount="indefinite"/>
      </rect>
      <line x1="112" y1="65" x2="130" y2="95" stroke="#000" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="130" y1="95" x2="138" y2="72" stroke="#000" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="y2" values="72;60;72" dur="1.2s" repeatCount="indefinite" begin="0.6s"/>
      </line>
      <rect x="131" y="65" width="14" height="14" rx="3" fill="#22c55e" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="65;53;65" dur="1.2s" repeatCount="indefinite" begin="0.6s"/>
      </rect>
      <rect x="82" y="103" width="16" height="45" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="2.5"/>
      <rect x="102" y="103" width="16" height="45" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="2.5"/>
    </svg>
  );
}

function CoreSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="50" y="150" width="100" height="10" rx="3" fill="#374151" stroke="#000" strokeWidth="2"/>
      <circle cx="100" cy="50" r="18" fill="#FFD803" stroke="#000" strokeWidth="3">
        <animate attributeName="cy" values="50;38;50" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="94" cy="47" r="2.5" fill="#000">
        <animate attributeName="cy" values="47;35;47" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="106" cy="47" r="2.5" fill="#000">
        <animate attributeName="cy" values="47;35;47" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <rect x="85" y="68" width="30" height="40" rx="8" fill="#FF8C42" stroke="#000" strokeWidth="3">
        <animate attributeName="y" values="68;56;68" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="height" values="40;48;40" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <line x1="90" y1="75" x2="110" y2="75" stroke="#000" strokeWidth="2" opacity="0.3">
        <animate attributeName="y1" values="75;65;75" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="75;65;75" dur="1.5s" repeatCount="indefinite"/>
      </line>
      <line x1="90" y1="83" x2="110" y2="83" stroke="#000" strokeWidth="2" opacity="0.3">
        <animate attributeName="y1" values="83;73;83" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="y2" values="83;73;83" dur="1.5s" repeatCount="indefinite"/>
      </line>
      <rect x="80" y="108" width="16" height="42" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="108;96;108" dur="1.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="104" y="108" width="16" height="42" rx="5" fill="#00B4D8" stroke="#000" strokeWidth="2.5">
        <animate attributeName="y" values="108;96;108" dur="1.5s" repeatCount="indefinite"/>
      </rect>
    </svg>
  );
}

function GenericExerciseSVG() {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="40" r="20" fill="#FFD803" stroke="#000" strokeWidth="3"/>
      <circle cx="94" cy="37" r="3" fill="#000"/>
      <circle cx="106" cy="37" r="3" fill="#000"/>
      <path d="M93 46 Q100 52 107 46" stroke="#000" strokeWidth="2.5" fill="none"/>
      <rect x="85" y="60" width="30" height="55" rx="10" fill="#22c55e" stroke="#000" strokeWidth="3"/>
      <line x1="85" y1="75" x2="55" y2="100" stroke="#000" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="x2" values="55;50;55" dur="1s" repeatCount="indefinite"/>
      </line>
      <line x1="115" y1="75" x2="145" y2="100" stroke="#000" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="x2" values="145;150;145" dur="1s" repeatCount="indefinite"/>
      </line>
      <rect x="78" y="115" width="18" height="45" rx="6" fill="#00B4D8" stroke="#000" strokeWidth="3"/>
      <rect x="104" y="115" width="18" height="45" rx="6" fill="#00B4D8" stroke="#000" strokeWidth="3"/>
      <rect x="74" y="155" width="22" height="12" rx="4" fill="#374151" stroke="#000" strokeWidth="2"/>
      <rect x="104" y="155" width="22" height="12" rx="4" fill="#374151" stroke="#000" strokeWidth="2"/>
      <text x="100" y="178" textAnchor="middle" fontSize="11" fontWeight="900" fill="#000" className="uppercase">LET'S GO!</text>
    </svg>
  );
}

const SVG_MAP: Partial<Record<MuscleGroup, () => JSX.Element>> = {
  chest: BenchPressSVG,
  back: PullUpSVG,
  shoulders: DumbbellSVG,
  biceps: CurlSVG,
  triceps: DumbbellSVG,
  legs: SquatSVG,
  glutes: SquatSVG,
  calves: SquatSVG,
  core: CoreSVG,
  forearms: CurlSVG,
};

export default function ExerciseSVG({ muscleGroup, className = '' }: ExerciseSVGProps) {
  const SVGComponent = SVG_MAP[muscleGroup] || GenericExerciseSVG;
  return (
    <div className={className}>
      <SVGComponent />
    </div>
  );
}
