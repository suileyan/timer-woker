# timer-worker

A Web Worker-based timer utility for setTimeout and setInterval, reducing main thread congestion and improving performance.

## Installation

```sh
npm install timer-worker
```

or using yarn:

```sh
yarn add timer-worker
```

## Usage

### Importing

```ts
import { createTimer } from 'timer-worker';
```

### Creating a Timer Instance

```ts
const timer = createTimer({
  onError: (error) => console.error('Timer error:', error),
});
```

### Using setTimeout

```ts
const timeoutId = timer.setTimeout(() => {
  console.log('Timeout triggered');
}, 1000);
```

### Using setInterval

```ts
const intervalId = timer.setInterval(() => {
  console.log('Interval triggered');
}, 1000);
```

### Clearing a Timer

```ts
timer.clear(timeoutId);
timer.clear(intervalId);
```

### Destroying the Timer Instance

```ts
timer.destroy();
```

## API

### `createTimer(config?: Config): WorkerTimer`
Creates a new `WorkerTimer` instance.

**Config Options:**
- `onError?: (error: Error) => void` - Error handler callback.

### `WorkerTimer` Methods

#### `setTimeout(callback: Function, delay: number): number`
Creates a timeout that executes `callback` after `delay` milliseconds. Returns a unique ID.

#### `setInterval(callback: Function, interval: number): number`
Creates an interval that executes `callback` every `interval` milliseconds. Returns a unique ID.

#### `clear(id: number): void`
Clears the timeout or interval associated with the given `id`.

#### `destroy(): void`
Terminates the Web Worker and clears all timers.

## License

MIT

