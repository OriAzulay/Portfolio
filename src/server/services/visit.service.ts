import "server-only";
import { visitsRepository } from "../repositories/visits.repository";

export function recordVisit(ipHash: string): void {
  visitsRepository.record(ipHash);
}

export function countUniqueVisitors(): number {
  return visitsRepository.countUnique();
}
