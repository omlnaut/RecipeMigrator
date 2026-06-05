export type AsyncVoidFunction = () => Promise<void>;

export async function runAsync(
  funcs: AsyncVoidFunction[],
  maxWorkers: number,
): Promise<void> {
  const tasks = funcs[Symbol.iterator]();

  async function makeWorker() {
    for (const task of tasks) {
      await task();
    }
  }

  const nWorkers = Math.min(maxWorkers, funcs.length);

  const pool = Array.from({ length: nWorkers }).map(() => makeWorker());

  await Promise.all(pool);
}
