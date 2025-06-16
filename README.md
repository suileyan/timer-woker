# timer-worker

timer-worker 是一个基于 Web Worker 的定时器工具，提供 setTimeout 和 setInterval 的实现，减少主线程阻塞，提高性能。

timer-worker is a timer utility based on Web Worker, providing implementations of setTimeout and setInterval to reduce main thread blocking and improve performance.

## 安装 | Installation

```sh
npm install timer-worker
```

或使用 yarn: | Or using yarn:

```sh
yarn add timer-worker
```

## 使用方法 | Usage

### 引入 | Import

```ts
import { createTimer } from 'timer-worker';
```

### 创建定时器实例 | Create Timer Instance

```ts
const timer = createTimer({
  onError: (error) => console.error('定时器错误:', error), // Timer error
});
```

### 使用 setTimeout | Using setTimeout

```ts
const timeoutId = timer.setTimeout(() => {
  console.log('定时器触发'); // Timer triggered
}, 1000);
```

### 使用 setInterval | Using setInterval

```ts
const intervalId = timer.setInterval(() => {
  console.log('间隔定时器触发'); // Interval timer triggered
}, 1000);
```

### 清除定时器 | Clear Timer

```ts
timer.clear(timeoutId);
timer.clear(intervalId);
```

### 销毁定时器实例 | Destroy Timer Instance

```ts
timer.destroy();
```

## API 说明 | API Documentation

### `createTimer(config?: Config): WorkerTimer`

创建一个新的 `WorkerTimer` 实例。

Create a new `WorkerTimer` instance.

**配置选项 | Configuration Options:**

- `onError?: (error: Error) => void` - 错误处理回调函数。 | Error handling callback function.

### `WorkerTimer` 方法 | Methods

#### `setTimeout(callback: Function, delay: number): number`

创建一个 `delay` 毫秒后执行 `callback` 的定时器，返回唯一 ID。

Creates a timer that executes `callback` after `delay` milliseconds, returning a unique ID.

#### `setInterval(callback: Function, interval: number): number`

创建一个每 `interval` 毫秒执行 `callback` 的循环定时器，返回唯一 ID。

Creates a looping timer that executes `callback` every `interval` milliseconds, returning a unique ID.

#### `clear(id: number): void`

清除指定 `id` 对应的定时器。

Clears the timer corresponding to the specified `id`.

#### `destroy(): void`

终止 Web Worker 并清除所有定时器。

Terminates the Web Worker and clears all timers.

## 许可协议 | License

MIT

## 修复日志 / Changelog

### [1.1.1] - 2025-06-16

### 修复 / Fixed

- 为 `config`、`worker` 和 `callbacks` 添加 `readonly` 修饰符，防止构造后误改动  
  *Added `private readonly` to `config`, `worker`, and `callbacks` to prevent reassignment.*
- 将默认值逻辑从 `||` 替换为 `??`，仅在 `null` 或 `undefined` 时生效  
  *Replaced `||` with `??` for safer defaulting only on nullish values.*
- 增加 Worker 端消息字段类型与范围校验，拒绝非法或恶意消息  
  *Added comprehensive validation for `type`, `id`, `delay`, and `interval` in the Worker.*
- 缓存并使用原始 `postMessage`，防止方法被篡改  
  *Cached original `self.postMessage` in the Worker to guard against tampering.*
- 错误消息中包含 `id`，主线程接收后清理对应回调以防内存泄漏  
  *Error messages now include the related `id`, and callbacks are deleted on error.*
- 在 `clear(id)` 传入无效 ID 时，通过 `onError` 上报错误  
  *`clear(id)` reports an error via `onError` when given an invalid ID.*
  