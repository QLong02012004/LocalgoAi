import type { ReactNode } from "react";

export interface AuthFeature {
  icon: ReactNode;
  text: string;
}

export interface AuthModeConfig {
  title: ReactNode;
  description: string;
  features: AuthFeature[];
}

export interface AuthConfig {
  register: AuthModeConfig;
  login: AuthModeConfig;
}
