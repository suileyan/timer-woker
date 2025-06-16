type Config = {
  onError?: (error: Error) => void;
};

type TimerType = 'timeout' | 'interval';

interface WorkerMessageData {
  type: TimerType | 'error';
  id?: number;
  error?: {
    message: string;
    stack?: string;
  };
}

interface TimerCallback {
  fn: Function;
}

export class WorkerTimer {
  private readonly config: Required<Config>;
  private readonly worker: Worker;
  private readonly callbacks: Map<number, TimerCallback>;
  private idCounter: number;

  constructor(config: Config = {}) {
    this.config = {
      onError: config.onError ?? ((error) => console.error(error)),
    };
    this.worker = this.createWorker();
    this.callbacks = new Map();
    this.idCounter = 0;
    this.init();
  }

  private createWorker(): Worker {
    const workerCode = `
      const timers = new Map();
      
      self.onmessage = function(e) {
        try {
          const { type, id, delay, interval } = e.data;
          
          switch (type) {
            case 'setTimeout':
              timers.set(id, {
                type: 'timeout',
                ref: setTimeout(() => {
                  self.postMessage({ type: 'timeout', id });
                  timers.delete(id);
                }, delay)
              });
              break;
              
            case 'setInterval':
              timers.set(id, {
                type: 'interval',
                ref: setInterval(() => {
                  self.postMessage({ type: 'interval', id });
                }, interval)
              });
              break;
              
            case 'clear':
              if (timers.has(id)) {
                const timer = timers.get(id);
                timer.type === 'timeout' 
                  ? clearTimeout(timer.ref) 
                  : clearInterval(timer.ref);
                timers.delete(id);
              }
              break;
          }
        } catch (error) {
          self.postMessage({ 
            type: 'error',
            error: {
              message: error.message,
              stack: error.stack
            }
          });
        }
      };
    `;

    try {
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      return new Worker(URL.createObjectURL(blob));
    } catch (error) {
      this.handleError(error as Error);
      throw new Error('Web Worker 初始化失败');
    }
  }

  private init(): void {
    this.worker.onmessage = (e: MessageEvent<WorkerMessageData>) => {
      const { type, id, error } = e.data;

      if (type === 'error') {
        this.handleError(new Error(error?.message ?? 'Unknown worker error'));
        return;
      }

      if (id !== undefined && this.callbacks.has(id)) {
        const { fn } = this.callbacks.get(id)!;

        try {
          fn();
        } catch (callbackError) {
          this.handleError(callbackError as Error);
        }

        if (type === 'timeout') {
          this.callbacks.delete(id);
        }
      }
    };

    this.worker.onerror = (e: ErrorEvent) => {
      this.handleError(new Error(`Worker 运行时错误: ${e.message}`));
      return false;
    };
  }

  private handleError(error: Error): void {
    this.config.onError(error);
  }

  setTimeout(callback: Function, delay: number): number {
    const id = this.generateId();
    this.callbacks.set(id, { fn: callback });
    
    this.worker.postMessage({
      type: 'setTimeout',
      id,
      delay: Math.max(0, parseInt(delay.toString(), 10)) ?? 0
    });
    
    return id;
  }

  setInterval(callback: Function, interval: number): number {
    const id = this.generateId();
    this.callbacks.set(id, { fn: callback });
    
    this.worker.postMessage({
      type: 'setInterval',
      id,
      interval: Math.max(0, parseInt(interval.toString(), 10)) ?? 0
    });
    
    return id;
  }

  clear(id: number): void {
    if (typeof id !== 'number') {
      this.handleError(new Error(`clear() 需要传入数字型 ID，实际收到: ${typeof id}`));
      return;
    }

    if (this.callbacks.has(id)) {
      this.worker.postMessage({ type: 'clear', id });
      this.callbacks.delete(id);
    }
  }

  private generateId(): number {
    return ++this.idCounter;
  }

  destroy(): void {
    this.worker.terminate();
    this.callbacks.clear();
  }
}

export function createTimer(config: Config = {}): WorkerTimer {
  return new WorkerTimer(config);
}