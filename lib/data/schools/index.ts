import undergraduateSchools from "./undergraduate.json";
import lawSchools from "./law.json";
import transferSchools from "./transfer.json";
import type { StaticSchool, ApplicationType } from "@/types";

export const schoolsByType: Record<ApplicationType, StaticSchool[]> = {
  undergraduate: undergraduateSchools as unknown as StaticSchool[],
  law_school: lawSchools as unknown as StaticSchool[],
  transfer: transferSchools as unknown as StaticSchool[],
};

export const allSchools: StaticSchool[] = [
  ...(undergraduateSchools as unknown as StaticSchool[]),
  ...(lawSchools as unknown as StaticSchool[]),
  ...(transferSchools as unknown as StaticSchool[]),
];

export function searchSchools(
  query: string,
  type?: ApplicationType
): StaticSchool[] {
  const pool = type ? schoolsByType[type] : allSchools;
  const q = query.toLowerCase();
  return pool.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q)
  );
}
