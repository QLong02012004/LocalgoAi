import React from "react";
import { Waves, Buildings, HouseLine, Money, TrendUp, Crown } from "phosphor-react";
import type { Province, BudgetOption } from "./Hero.types";

export const VIETNAM_PROVINCES: Province[] = [
  { id: "2", name: "Đà Nẵng", desc: "Thành phố của những cây cầu", icon: <Waves color="#0ea5e9" weight="bold" /> },
  { id: "1", name: "Thừa Thiên Huế", desc: "Cố đô cổ kính, trầm mặc", icon: <Buildings color="#a855f7" weight="bold" /> },
  { id: "3", name: "Quảng Nam", desc: "Phố cổ Hội An & Mỹ Sơn", icon: <HouseLine color="#f59e0b" weight="bold" /> },
];

export const BUDGET_OPTIONS: BudgetOption[] = [
  { value: "Dưới 5 triệu", label: "Tiết kiệm", icon: <Money color="#22c55e" />, desc: "Dưới 5 triệu VNĐ" },
  { value: "5 - 10 triệu", label: "Tiêu chuẩn", icon: <TrendUp color="#3b82f6" />, desc: "Từ 5 - 10 triệu VNĐ" },
  { value: "10 - 20 triệu", label: "Thoải mái", icon: <TrendUp color="#8b5cf6" />, desc: "Từ 10 - 20 triệu VNĐ" },
  { value: "Trên 20 triệu", label: "Cao cấp", icon: <Crown color="#f59e0b" />, desc: "Trên 20 triệu VNĐ" },
];
