import type { ReactNode, RefObject } from "react";

export type Province = {
  id: string;
  name: string;
  desc: string;
  icon: ReactNode;
};

export type BudgetOption = {
  value: string;
  label: string;
  icon: ReactNode;
  desc: string;
};

export type SearchFieldProps = {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  innerRef?: RefObject<HTMLDivElement | null>;
  onClick?: () => void;
};

export type DropdownContentProps = {
  show: boolean;
  children: ReactNode;
  className?: string;
};
