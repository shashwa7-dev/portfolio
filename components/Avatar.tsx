"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface MousePosition {
  x: number;
  y: number;
}

interface EyePosition {
  x: number;
  y: number;
}

const Avatar = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });
  const [leftEyePos, setLeftEyePos] = useState<EyePosition>({ x: 0, y: 0 });
  const [rightEyePos, setRightEyePos] = useState<EyePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initial load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (!isHovering) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [isHovering]);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Eye movement calculation
  const calculateEyePosition = useCallback(
    (eyeCenterX: number, eyeCenterY: number): EyePosition => {
      if (isHovering || !svgRef.current) return { x: 0, y: 0 };

      const svgRect = svgRef.current.getBoundingClientRect();
      const actualEyeCenterX =
        svgRect.left + (eyeCenterX / 200) * svgRect.width;
      const actualEyeCenterY =
        svgRect.top + (eyeCenterY / 200) * svgRect.height;

      const angle = Math.atan2(
        mousePos.y - actualEyeCenterY,
        mousePos.x - actualEyeCenterX
      );
      const distance = Math.min(
        8,
        Math.sqrt(
          Math.pow(mousePos.x - actualEyeCenterX, 2) +
            Math.pow(mousePos.y - actualEyeCenterY, 2)
        ) / 100
      );

      return {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance * 0.5,
      };
    },
    [mousePos, isHovering]
  );

  // Update eye positions
  useEffect(() => {
    setLeftEyePos(calculateEyePosition(85.5, 78.5));
    setRightEyePos(calculateEyePosition(114.5, 78.5));
  }, [calculateEyePosition]);

  const handleAvatarHover = (hovering: boolean) => {
    setIsHovering(hovering);
    if (hovering) {
      setLeftEyePos({ x: 0, y: 0 });
      setRightEyePos({ x: 0, y: 0 });
    }
  };

  return (
    <div
      ref={avatarRef}
      className={`relative transition-all duration-300`}
      onMouseEnter={() => handleAvatarHover(true)}
      onMouseLeave={() => handleAvatarHover(false)}
    >
      {/* Original SVG Avatar */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 200 200"
      >
        <defs>
          <circle id="armMaskPath" cx="100" cy="100" r="100" />
        </defs>
        <clipPath id="armMask">
          <use xlinkHref="#armMaskPath" overflow="visible" />
        </clipPath>

        {/* Background circle with theme colors */}
        <circle
          cx="100"
          cy="100"
          r="100"
          fill={isDarkMode ? "hsl(0, 0%, 18%)" : "#a9ddf3"}
          className="transition-colors duration-500"
        />

        {/* Body */}
        <g className="body">
          <path
            className="bodyBGchanged"
            style={{ display: "none" }}
            fill="#FFFFFF"
            d="M200,122h-35h-14.9V72c0-27.6-22.4-50-50-50s-50,22.4-50,50v50H35.8H0l0,91h200L200,122z"
          />
          <path
            id="bodyBGnormal"
            stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
            d="M200,158.5c0-20.2-14.8-36.5-35-36.5h-14.9V72.8c0-27.4-21.7-50.4-49.1-50.8c-28-0.5-50.9,22.1-50.9,50v50 H35.8C16,122,0,138,0,157.8L0,213h200L200,158.5z"
            className="transition-colors duration-500"
          />
          <path
            fill={isDarkMode ? "hsl(0, 0%, 30%)" : "#DDF1FA"}
            d="M100,156.4c-22.9,0-43,11.1-54.1,27.7c15.6,10,34.2,15.9,54.1,15.9s38.5-5.8,54.1-15.9 C143,167.5,122.9,156.4,100,156.4z"
            className="transition-colors duration-500"
          />
        </g>

        {/* Left Ear */}
        <g className="earL">
          <g
            id="outerEar"
            fill={isDarkMode ? "hsl(0, 0%, 30%)" : "#ddf1fa"}
            stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
            strokeWidth="2.5"
            className="transition-colors duration-500"
          >
            <circle cx="47" cy="83" r="11.5" />
            <path
              d="M46.3 78.9c-2.3 0-4.1 1.9-4.1 4.1 0 2.3 1.9 4.1 4.1 4.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g className="earHair">
            <rect
              x="51"
              y="64"
              fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
              width="15"
              height="35"
              className="transition-colors duration-500"
            />
            <path
              d="M53.4 62.8C48.5 67.4 45 72.2 42.8 77c3.4-.1 6.8-.1 10.1.1-4 3.7-6.8 7.6-8.2 11.6 2.1 0 4.2 0 6.3.2-2.6 4.1-3.8 8.3-3.7 12.5 1.2-.7 3.4-1.4 5.2-1.9"
              fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#fff"}
              stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-500"
            />
          </g>
        </g>

        {/* Right Ear */}
        <g className="earR">
          <g className="outerEar">
            <circle
              fill={isDarkMode ? "hsl(0, 0%, 30%)" : "#DDF1FA"}
              stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
              strokeWidth="2.5"
              cx="153"
              cy="83"
              r="11.5"
              className="transition-colors duration-500"
            />
            <path
              fill={isDarkMode ? "hsl(0, 0%, 30%)" : "#DDF1FA"}
              stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M153.7,78.9 c2.3,0,4.1,1.9,4.1,4.1c0,2.3-1.9,4.1-4.1,4.1"
              className="transition-colors duration-500"
            />
          </g>
          <g className="earHair">
            <rect
              x="134"
              y="64"
              fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
              width="15"
              height="35"
              className="transition-colors duration-500"
            />
            <path
              fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
              stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M146.6,62.8 c4.9,4.6,8.4,9.4,10.6,14.2c-3.4-0.1-6.8-0.1-10.1,0.1c4,3.7,6.8,7.6,8.2,11.6c-2.1,0-4.2,0-6.3,0.2c2.6,4.1,3.8,8.3,3.7,12.5 c-1.2-0.7-3.4-1.4-5.2-1.9"
              className="transition-colors duration-500"
            />
          </g>
        </g>

        {/* Chin */}
        <path
          id="chin"
          d="M84.1 121.6c2.7 2.9 6.1 5.4 9.8 7.5l.9-4.5c2.9 2.5 6.3 4.8 10.2 6.5 0-1.9-.1-3.9-.2-5.8 3 1.2 6.2 2 9.7 2.5-.3-2.1-.7-4.1-1.2-6.1"
          fill="none"
          stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-colors duration-500"
        />

        {/* Face */}
        <path
          id="face"
          fill={isDarkMode ? "hsl(0, 0%, 30%)" : "#DDF1FA"}
          d="M134.5,46v35.5c0,21.815-15.446,39.5-34.5,39.5s-34.5-17.685-34.5-39.5V46"
          className="transition-colors duration-500"
        />

        {/* Hair */}
        <path
          id="hair"
          fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
          stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M81.457,27.929 c1.755-4.084,5.51-8.262,11.253-11.77c0.979,2.565,1.883,5.14,2.712,7.723c3.162-4.265,8.626-8.27,16.272-11.235 c-0.737,3.293-1.588,6.573-2.554,9.837c4.857-2.116,11.049-3.64,18.428-4.156c-2.403,3.23-5.021,6.391-7.852,9.474"
          className="transition-colors duration-500"
        />

        {/* Eyebrow */}
        <g className="eyebrow">
          <path
            fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
            d="M138.142,55.064c-4.93,1.259-9.874,2.118-14.787,2.599c-0.336,3.341-0.776,6.689-1.322,10.037 c-4.569-1.465-8.909-3.222-12.996-5.226c-0.98,3.075-2.07,6.137-3.267,9.179c-5.514-3.067-10.559-6.545-15.097-10.329 c-1.806,2.889-3.745,5.73-5.816,8.515c-7.916-4.124-15.053-9.114-21.296-14.738l1.107-11.768h73.475V55.064z"
            className="transition-colors duration-500"
          />
          <path
            fill={isDarkMode ? "hsl(0, 0%, 25%)" : "#FFFFFF"}
            stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M63.56,55.102 c6.243,5.624,13.38,10.614,21.296,14.738c2.071-2.785,4.01-5.626,5.816-8.515c4.537,3.785,9.583,7.263,15.097,10.329 c1.197-3.043,2.287-6.104,3.267-9.179c4.087,2.004,8.427,3.761,12.996,5.226c0.545-3.348,0.986-6.696,1.322-10.037 c4.913-0.481,9.857-1.34,14.787-2.599"
            className="transition-colors duration-500"
          />
        </g>

        {/* Left Eye */}
        <g className="eyeL">
          <circle
            cx={85.5 + leftEyePos.x}
            cy={78.5 + leftEyePos.y}
            r={isBlinking || isHovering ? "0.3" : "3.5"}
            fill={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
            className="transition-all duration-200"
          />
          <circle
            cx={84 + leftEyePos.x}
            cy={76 + leftEyePos.y}
            r={isBlinking || isHovering ? "0" : "1"}
            fill="#fff"
            className="transition-all duration-200"
          />
        </g>

        {/* Right Eye */}
        <g className="eyeR">
          <circle
            cx={114.5 + rightEyePos.x}
            cy={78.5 + rightEyePos.y}
            r={isBlinking || isHovering ? "0.3" : "3.5"}
            fill={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
            className="transition-all duration-200"
          />
          <circle
            cx={113 + rightEyePos.x}
            cy={76 + rightEyePos.y}
            r={isBlinking || isHovering ? "0" : "1"}
            fill="#fff"
            className="transition-all duration-200"
          />
        </g>

        {/* Mouth */}
        <g className="mouth">
          <path
            id="mouthBG"
            fill={isDarkMode ? "hsl(45, 49%, 60%)" : "#617E92"}
            d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
            className="transition-colors duration-500"
          />

          <defs>
            <path
              id="mouthMaskPath"
              d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
            />
          </defs>
          <clipPath id="mouthMask">
            <use xlinkHref="#mouthMaskPath" overflow="visible" />
          </clipPath>
          <g clipPath="url(#mouthMask)">
            <g className="tongue">
              <circle cx="100" cy="107" r="8" fill="#cc4a6c" />
              <ellipse
                className="tongueHighlight"
                cx="100"
                cy="100.5"
                rx="3"
                ry="1.5"
                opacity=".1"
                fill="#fff"
              />
            </g>
          </g>
          <path
            clipPath="url(#mouthMask)"
            className="tooth"
            fill="#FFFFFF"
            d="M106,97h-4c-1.1,0-2-0.9-2-2v-2h8v2C108,96.1,107.1,97,106,97z"
          />
          <path
            id="mouthOutline"
            fill="none"
            stroke={isDarkMode ? "hsl(45, 49%, 80%)" : "#3A5E77"}
            strokeWidth="2.5"
            strokeLinejoin="round"
            d="M100.2,101c-0.4,0-1.4,0-1.8,0c-2.7-0.3-5.3-1.1-8-2.5c-0.7-0.3-0.9-1.2-0.6-1.8 c0.2-0.5,0.7-0.7,1.2-0.7c0.2,0,0.5,0.1,0.6,0.2c3,1.5,5.8,2.3,8.6,2.3s5.7-0.7,8.6-2.3c0.2-0.1,0.4-0.2,0.6-0.2 c0.5,0,1,0.3,1.2,0.7c0.4,0.7,0.1,1.5-0.6,1.9c-2.6,1.4-5.3,2.2-7.9,2.5C101.7,101,100.5,101,100.2,101z"
            className="transition-colors duration-500"
          />
        </g>

        {/* Nose */}
        <path
          id="nose"
          d="M97.7 79.9h4.7c1.9 0 3 2.2 1.9 3.7l-2.3 3.3c-.9 1.3-2.9 1.3-3.8 0l-2.3-3.3c-1.3-1.6-.2-3.7 1.8-3.7z"
          fill={isDarkMode ? "hsl(45, 49%, 80%)" : "#3a5e77"}
          className="transition-colors duration-500"
        />

        {/* Blush effect when hovering */}
        {isHovering && (
          <>
            <circle
              cx="65"
              cy="95"
              r="8"
              fill="rgba(255, 182, 193, 0.4)"
              className="animate-pulse"
            />
            <circle
              cx="135"
              cy="95"
              r="8"
              fill="rgba(255, 182, 193, 0.4)"
              className="animate-pulse"
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default Avatar;
