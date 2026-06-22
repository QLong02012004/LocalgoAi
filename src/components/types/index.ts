/**
 * Thư mục này dùng để định nghĩa các TypeScript Interfaces/Types 
 * dùng chung cho các UI Components trong dự án TravelAi.
 */

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IconProps {
  size?: number | string;
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}
