import React from 'react';
import { Star } from 'lucide-react';

export interface RatingStarsProps {
  rating: number; // 0 to 5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

/**
 * Molecule RatingStars Component
 * Displays or captures star ratings.
 */
export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(starValue)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} text-amber-400 focus:outline-none`}
          >
            <Star
              className={`${sizeStyles[size]} ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
            />
          </button>
        );
      })}
    </div>
  );
};
