
# timer-worker
[English document](./README_en.md)

timer-worker 是一个基于 Web Worker 的定时器工具，提供 setTimeout 和 setInterval 的实现，减少主线程阻塞，提高性能。

## 安装

```sh
npm install timer-worker
```

或使用 yarn:

```sh
yarn add timer-worker
```

## 使用方法

### 引入

```ts
import { createTimer } from 'timer-worker';
```

### 创建定时器实例

```ts
const timer = createTimer({
  onError: (error) => console.error('定时器错误:', error),
});
```

### 使用 setTimeout

```ts
const timeoutId = timer.setTimeout(() => {
  console.log('定时器触发');
}, 1000);
```

### 使用 setInterval

```ts
const intervalId = timer.setInterval(() => {
  console.log('间隔定时器触发');
}, 1000);
```

### 清除定时器

```ts
timer.clear(timeoutId);
timer.clear(intervalId);
```

### 销毁定时器实例

```ts
timer.destroy();
```

## API 说明

### `createTimer(config?: Config): WorkerTimer`
创建一个新的 `WorkerTimer` 实例。

**配置选项：**
- `onError?: (error: Error) => void` - 错误处理回调函数。

### `WorkerTimer` 方法

#### `setTimeout(callback: Function, delay: number): number`
创建一个 `delay` 毫秒后执行 `callback` 的定时器，返回唯一 ID。

#### `setInterval(callback: Function, interval: number): number`
创建一个每 `interval` 毫秒执行 `callback` 的循环定时器，返回唯一 ID。

#### `clear(id: number): void`
清除指定 `id` 对应的定时器。

#### `destroy(): void`
终止 Web Worker 并清除所有定时器。

## 许可协议

MIT

