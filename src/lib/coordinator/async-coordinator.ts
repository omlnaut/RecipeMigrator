type AsyncVoidFunction = () => Promise<void>;

export async function runAsync(
  funcs: AsyncVoidFunction[],
  maxWorkers: number,
): Promise<void> {
  const tasks = funcs.entries();

  async function makeWorker() {
    for (const [_, task] of tasks) {
      await task();
    }
  }

  const nWorkers = Math.min(maxWorkers, funcs.length);

  const pool: Promise<void>[] = [];
  for (let i = 0; i < nWorkers; i++) {
    pool.push(makeWorker());
  }

  await Promise.all(pool);
}
