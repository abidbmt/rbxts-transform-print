### NOTE: Make sure that this transformer is ran before other transformers!

#### Syntax:
```
$print()
```
```
$print(message: unknown)
```
```
$print(message: unknown, logLevel: number)
```

If the provided loglevel is higher than the transformer's configured logLevel, then the print will not be emitted
