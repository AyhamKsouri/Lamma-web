// src/components/StarRating.tsx
import React, { FC } from "react";
import { Star as StarIcon } from "lucide-react";
import clsx from "clsx";

interface StarRatingProps {
  /** 0–5 filled stars */
  value: number;
  /** called when user clicks a star (1–5) */
  onChange?: (newValue: number) => void;
  /** disable interactivity */
  readOnly?: boolean;
  /** size of the icon in px */
  size?: number;
}

const StarRating: FC<StarRatingProps> = ({
  value,
  onChange,
  readOnly = false,
  size = 24,
}) => {
  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <StarIcon
            key={i}
            size={size}
            className={clsx(
              "transition-transform duration-200 ease-in-out",
              readOnly ? "cursor-default" : "cursor-pointer hover:scale-110",
              filled
                // → gradient fill + glow
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500 drop-shadow-md"
                // → light gray outline
                : "text-gray-300"
            )}
            onClick={() => {
              if (!readOnly && onChange) onChange(i + 1);
            }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;