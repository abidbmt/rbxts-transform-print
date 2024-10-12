export function $print(): void
export function $print(message: unknown): void
export function $print(message: unknown, logLevel: number): void

export function $warn(): void
export function $warn(message: unknown): void
export function $warn(message: unknown, logLevel: number): void

// Will be implemented in the future
// export function $error(): void
// export function $error(message: string): void
// export function $error(message: string, stackDepth: number): void
// export function $error(message: string, stackDepth: number, logLevel: number): void

// Will be implemented in the future
// export function $print(logLevel: number, ...args: unknown[]): void