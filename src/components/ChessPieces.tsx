import React from "react";

interface PieceProps {
  color: "w" | "b";
  className?: string;
}

export const Pawn: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.5 9C24.433 9 26 7.433 26 5.5C26 3.567 24.433 2 22.5 2C20.567 2 19 3.567 19 5.5C19 7.433 20.567 9 22.5 9Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      <path
        d="M22.5 13C27.5 13 29.5 22 31.5 31.5C31.5 33 30 34 22.5 34C15 34 13.5 33 13.5 31.5C15.5 22 17.5 13 22.5 13Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 37.5C11.5 36.5 13.5 35.5 22.5 35.5C31.5 35.5 33.5 36.5 33.5 37.5C33.5 38.5 31.5 40 22.5 40C13.5 40 11.5 38.5 11.5 37.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Detail highlight */}
      <path
        d="M19 16C21 15.5 24 15.5 26 16"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M17 26C20 25.5 25 25.5 28 26"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Rook: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 39H36V42H9V39Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 36L14.5 17H30.5L33 36H12Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 11V16H15V13H20V16H25V13H30V16H35V11H10Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11 16H34V17H11V16Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Detail highlights */}
      <path
        d="M16 22H29"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15 30H30"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Knight: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M33 39.5C33 39.5 35.5 38 35.5 34C35.5 30 33.5 28 33.5 28C33.5 28 35.5 24 33.5 19.5C31.5 15 28 14.5 28 14.5C28 14.5 28 10 24 8.5C20 7 15 8.5 13.5 12C12 15.5 11 19 12.5 21C14 23 16.5 22 17 25C17.5 28 15.5 30 14.5 32C13.5 34 11 36.5 11 39.5C11 39.5 20.5 40.5 33 39.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 12C14.5 11 17 10 19 11.5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Mane details */}
      <path
        d="M28 14.5C29.5 16 30 18.5 30 21"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M31 22C32 23 32.5 25 32.5 27"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Eye */}
      <circle cx="17.5" cy="15.5" r="2" fill={stroke} />
      {/* Snout */}
      <path
        d="M11.5 21.5C10.5 22.5 9 24.5 11.5 25.5"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Base */}
      <path
        d="M9 41.5H36V43H9V41.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};

export const Bishop: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <path
        d="M11.5 40H33.5V42.5H11.5V40Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Body */}
      <path
        d="M22.5 10C27.5 10 29.5 18 29.5 27C29.5 31.5 27.5 37.5 22.5 37.5C17.5 37.5 15.5 31.5 15.5 27C15.5 18 17.5 10 22.5 10Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Mitre slice / slash */}
      <path
        d="M20 15L25 24"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* Small top cross/ball */}
      <circle cx="22.5" cy="5.5" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
      {/* Small collar */}
      <path
        d="M17 34.5C20.5 33.5 24.5 33.5 28 34.5"
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Visual outline decoration */}
      <path
        d="M22.5 14V30"
        stroke={accent}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const Queen: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <path
        d="M10 40.5H35V43H10V40.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Body */}
      <path
        d="M12.5 38.5C13 36.5 14.5 18.5 14.5 18.5L8.5 25L14 11L22.5 21L31 11L36.5 25L30.5 18.5C30.5 18.5 32 36.5 32.5 38.5H12.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Small coronet balls */}
      <circle cx="14" cy="11" r="2.5" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="22.5" cy="21" r="2.5" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="31" cy="11" r="2.5" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="8.5" cy="25" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
      <circle cx="36.5" cy="25" r="2" fill={fill} stroke={stroke} strokeWidth="1" />
      
      {/* Decorative details on gown */}
      <path
        d="M18.5 28C21 27 24 27 26.5 28"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16.5 33C20 31.5 25 31.5 28.5 33"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const King: React.FC<PieceProps> = ({ color, className = "w-full h-full" }) => {
  const fill = color === "w" ? "#FBFBFB" : "#2E2A27";
  const stroke = color === "w" ? "#4A3F35" : "#1A1512";
  const accent = color === "w" ? "#DCD1C4" : "#4A3F35";

  return (
    <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base */}
      <path
        d="M10 40.5H35V43H10V40.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
      />
      {/* Main body of the King */}
      <path
        d="M12.5 38.5C13.5 34.5 15.5 19.5 15.5 19.5L11 20.5V14.5L16.5 17.5L22.5 10.5L28.5 17.5L34 14.5V20.5L29.5 19.5C29.5 19.5 31.5 34.5 32.5 38.5H12.5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Top Cross */}
      <path
        d="M22.5 4V10"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M19.5 6H25.5"
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      {/* Girdle design */}
      <path
        d="M17 24C20.5 23 24.5 23 28 24"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M15.5 31C19.5 29.5 25.5 29.5 29.5 31"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ChessPiece: React.FC<{ type: string; color: "w" | "b"; className?: string }> = ({
  type,
  color,
  className,
}) => {
  switch (type.toLowerCase()) {
    case "p":
      return <Pawn color={color} className={className} />;
    case "r":
      return <Rook color={color} className={className} />;
    case "n":
      return <Knight color={color} className={className} />;
    case "b":
      return <Bishop color={color} className={className} />;
    case "q":
      return <Queen color={color} className={className} />;
    case "k":
      return <King color={color} className={className} />;
    default:
      return null;
  }
};
