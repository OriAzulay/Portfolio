import "server-only";
import { visitsRepository } from "../repositories/visits.repository";

export function recordVisit(ipHash: string): Promise<void> {
  return visitsRepository.record(ipHash);
}

export function countUniqueVisitors(): Promise<number> {
  return visitsRepository.countUnique();
}
