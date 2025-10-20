export interface Scheduler {
  every(ms: number, task: () => void): { stop(): void }
}