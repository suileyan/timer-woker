type Config = {
    onError?: (error: Error) => void;
};
export declare class WorkerTimer {
    private config;
    private worker;
    private callbacks;
    private idCounter;
    constructor(config?: Config);
    private createWorker;
    private init;
    private handleError;
    setTimeout(callback: Function, delay: number): number;
    setInterval(callback: Function, interval: number): number;
    clear(id: number): void;
    private generateId;
    destroy(): void;
}
export declare function createTimer(config?: Config): WorkerTimer;
export {};
