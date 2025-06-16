export class WorkerTimer {
    constructor(config = {}) {
        this.config = {
            onError: config.onError ?? ((error) => console.error(error)),
        };
        this.worker = this.createWorker();
        this.callbacks = new Map();
        this.idCounter = 0;
        this.init();
    }
    createWorker() {
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
        }
        catch (error) {
            this.handleError(error);
            throw new Error('Web Worker 初始化失败');
        }
    }
    init() {
        this.worker.onmessage = (e) => {
            const { type, id, error } = e.data;
            if (type === 'error') {
                this.handleError(new Error(error?.message ?? 'Unknown worker error'));
                return;
            }
            if (id !== undefined && this.callbacks.has(id)) {
                const { fn } = this.callbacks.get(id);
                try {
                    fn();
                }
                catch (callbackError) {
                    this.handleError(callbackError);
                }
                if (type === 'timeout') {
                    this.callbacks.delete(id);
                }
            }
        };
        this.worker.onerror = (e) => {
            this.handleError(new Error(`Worker 运行时错误: ${e.message}`));
            return false;
        };
    }
    handleError(error) {
        this.config.onError(error);
    }
    setTimeout(callback, delay) {
        const id = this.generateId();
        this.callbacks.set(id, { fn: callback });
        this.worker.postMessage({
            type: 'setTimeout',
            id,
            delay: Math.max(0, parseInt(delay.toString(), 10)) ?? 0
        });
        return id;
    }
    setInterval(callback, interval) {
        const id = this.generateId();
        this.callbacks.set(id, { fn: callback });
        this.worker.postMessage({
            type: 'setInterval',
            id,
            interval: Math.max(0, parseInt(interval.toString(), 10)) ?? 0
        });
        return id;
    }
    clear(id) {
        if (typeof id !== 'number') {
            this.handleError(new Error(`clear() 需要传入数字型 ID，实际收到: ${typeof id}`));
            return;
        }
        if (this.callbacks.has(id)) {
            this.worker.postMessage({ type: 'clear', id });
            this.callbacks.delete(id);
        }
    }
    generateId() {
        return ++this.idCounter;
    }
    destroy() {
        this.worker.terminate();
        this.callbacks.clear();
    }
}
export function createTimer(config = {}) {
    return new WorkerTimer(config);
}
