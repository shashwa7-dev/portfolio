"use client";

import { useEffect, useState } from "react";

interface KeySequence {
  keys: string[];
  url: string;
}

const KeyboardNavigation: React.FC = () => {
  const [keySequence, setKeySequence] = useState<string[]>([]);

  const targetSequences: KeySequence[] = [
    {
      keys: ["ArrowUp", "ArrowDown", "ArrowRight"],
      url: "https://www.linkedin.com/in/shashwa7/",
    },
    {
      keys: ["ArrowLeft", "/", "ArrowRight"],
      url: "https://github.com/shashwa7-dev",
    },
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Add the new key to the sequence
      const updatedSequence = [...keySequence, event.key];

      // Keep only the last 3 keys pressed
      if (updatedSequence.length > 3) {
        updatedSequence.shift();
      }

      setKeySequence(updatedSequence);

      // Check if the sequence matches any of our target sequences
      for (const sequence of targetSequences) {
        if (JSON.stringify(updatedSequence) === JSON.stringify(sequence.keys)) {
          window.open(sequence.url, "_blank");
          break;
        }
      }
    };

    // Add event listener
    window.addEventListener("keydown", handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [keySequence]);

  return null;
};

export default KeyboardNavigation;
