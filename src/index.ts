import { TransformContext, TransformerConfig } from "./transformer";
import ts from "typescript";

// The transformer entry point
// This provides access to necessary resources and the user specified configuration
// It returns a transformer function that will be called for each file that is transformed which iterates over every node in the file
// The program and config arguments are passed by the compiler
export default function (program: ts.Program, config: TransformerConfig) {
	return (transformationContext: ts.TransformationContext): ((file: ts.SourceFile) => ts.Node) => {
		const context = new TransformContext(program, transformationContext, config)
		return (file) => context.transform(file)
	}
}