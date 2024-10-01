### Installation:
```
npm i rbxts-transform-print
```

In your `tsconfig.json` add only the `"transform"` entry is required, but you can configure the transformer by including the other entries:
```
"compilerOptions": {
	...
	"plugins": [
		{
			"transform": "rbxts-transform-print",
			"showFileExtension": "full",
			"showPath": "full",
			"showLine": true,
			"logLevel": 1
		}
	],
}
```

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
