export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0;
  let queued: any[] | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function invoke(args: any[]) {
    last = Date.now();
    // @ts-expect-error preserve this
    fn.apply(this, args);
  }

  return function (this: unknown, ...args: any[]) {
    const now = Date.now();
    const remaining = ms - (now - last);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      queued = null;
      invoke.call(this, args);
    } else {
      queued = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          if (queued) {
            const a = queued;
            queued = null;
            invoke.call(this, a);
          }
        }, remaining);
      }
    }
  } as T;
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, ms);
  } as T;
}