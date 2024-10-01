# $print Transformer for roblox-ts

A TypeScript AST transformer for [roblox-ts](https://roblox-ts.com/) that enhances debugging by replacing `$print` calls with formatted `print` statements, including file names, line numbers, and configurable log levels.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Examples](#examples)
- [License](#license)

## Installation

Install the transformer via npm:

```bash
npm install --save-dev rbxts-transform-print
```

## Usage

To use the transformer in your roblox-ts project, you need to add it to your `tsconfig.json` file under the `plugins` section:

```json
{
  "compilerOptions": {
    // ... other compiler options ...
    "plugins": [
      {
        "transform": "rbxts-transform-print",
        "showFileExtension": "full",
        "showPath": "full",
        "showLine": true,
        "logLevel": 0
      }
    ]
  }
}
```

## Configuration

The transformer supports the following configuration options:

- **showFileExtension**: Controls how the file extension is displayed.
  - `"full"` (default): Includes the full file extension.
  - `"short"`: Removes the extension from the file name (e.g. `file.server.ts` becomes `file.server`).
  - `"off"`: Removes the entire file extension (e.g. `file.server.ts` becomes `file`).

- **showPath**: Controls how the file path is displayed.
  - `"full"` (default): Displays the full path relative to the project root (e.g. `[src/server/file.ts]`).
  - `"short"` (NOT IMPLEMENTED): Displays only the parent directory and file name (e.g. `[server/file.ts]`).
  - `"off"`: Displays only the file name (e.g. `[file.ts]`).

- **showLine**: Includes the line number in the output.
  - `true` (default): Includes the line number.
  - `false`: Omits the line number.

- **logLevel**: Sets the maximum log level for `$print` statements to be included.
  - `number` (default: `Infinity`): Only `$print` calls with a `logLevel` less than or equal to this value will be emitted.
  - **NOTE:** Not providing a log level to a `$print` call will force the `$print` call to be emitted!

## Examples

### Basic Usage

In your TypeScript code, use `$print` instead of `print`:

```typescript
$print("Hello, world!");
```

After transformation, this will become:

```lua
print("[src/server/main.server.ts:1]", "Hello, world!")
```

### Using Log Levels

You can control whether a `$print` statement is included based on its log level:

```typescript
$print("This is a message", 1);
$print("This is another message", 0);
```

If your `logLevel` in the configuration is set to `0`, only the second message will be printed.

### Configuration Options

#### showFileExtension

- **full**:

  ```lua
  print("[src/server/main.server.ts:1]", "Message")
  ```

- **short**:

  ```lua
  print("[src/server/main.server:1]", "Message")
  ```

- **off**:

  ```lua
  print("[src/server/main:1]", "Message")
  ```

#### showPath

- **full**:

  ```lua
  print("[src/server/main.server.ts:1]", "Message")
  ```

- **short**:

  ```lua
  print("[server/main.server.ts:1]", "Message")
  ```

- **off**:

  ```lua
  print("[main.server.ts:1]", "Message")
  ```

#### showLine

- **true**:

  ```lua
  print("[src/server/main.server.ts:1]", "Message")
  ```

- **false**:

  ```lua
  print("[src/server/main.server.ts]", "Message")
  ```

## License

This project is licensed under the MPL-2.0 License. See the [LICENSE](https://github.com/abidbmt/rbxts-transform-print/blob/main/LICENSE) file for details.
