import path from "path";
import ts from "typescript";

// TransformerConfig interface to store the configuration for the transformer
export interface TransformerConfig {
    showFileExtension: string
    showPath: string
    showLine: boolean
    logLevel: number
}

// Helper class to store the program, context, and config
export class TransformContext {
    public factory: ts.NodeFactory

    constructor(
        public program: ts.Program, 
        public context: ts.TransformationContext, 
        public config: TransformerConfig
    ) {
        this.factory = context.factory

        // Set default values for the config if they are not provided
        config.showFileExtension = config.showFileExtension ?? "full"
        config.showPath = config.showPath ?? "full"
        config.showLine = config.showLine ?? true
        config.logLevel = config.logLevel ?? Infinity
    }

    // Transforms the children of the specified node
    transform<T extends ts.Node>(node: T): T {
        return ts.visitEachChild(node, (child) =>  visitNode(this, child), this.context)
    }
}

// Will format the message based on the config and emit the print call
function formatMessage(context: TransformContext, node: ts.CallExpression, mode: "print" | "warn" | "error") {

    // Get the source file of the node
    const sourceFile = node.getSourceFile()

    // Create empty strings for the formatted name and line
    let formatedName, formatedLine = ""

    // console.log("Sourcefile name:", sourceFile.fileName)
    // Check the showPath setting
    if (context.config.showPath === "full") {
        // Get the relative path of the source file to the project directory
        // console.log("Current working directory:", process.cwd())
        // console.log("Path to file relative to cwd:", path.relative(process.cwd(), sourceFile.fileName))
        // console.log("Corrected path:", path.relative(process.cwd(), sourceFile.fileName).replace(/\\/g, "/"))
        // console.log()

        formatedName = path.relative(process.cwd(), sourceFile.fileName).replace(/\\/g, "/")
    } else if (context.config.showPath === "short") {
        // This would do the same as above but only inlude the file name and the parent directory to declutter the output (src/server/main.server.ts -> server/main.server.ts)
        
        // Get the relative path of the source file to the project directory
        const relativePath = path.relative(process.cwd(), sourceFile.fileName).replace(/\\/g, "/");
        // Split the relative path into segments
        const pathSegments = relativePath.split("/");
        // Get the last two segments (parent directory and file name)
        const lastSegments = pathSegments.slice(-2);
        // Join them back to form the short path
        formatedName = lastSegments.join("/");
    } else if (context.config.showPath === "off") {
        // This would only include the file name in the output
        // console.log("Actual filename:", path.basename(sourceFile.fileName))
        // console.log()

        formatedName = path.basename(sourceFile.fileName)
    } else {
        // If the showPath setting is invalid, throw an error
        throw new Error("Invalid showPath setting")
    }

    // Check the showFileExtension setting
    if (context.config.showFileExtension === "full") {
        // Do nothing if the setting is full, yes this is redundant but it's here for clarity
    } else if (context.config.showFileExtension === "short") {
        // Remove the file extension from the file name
        // console.log("Short fileExtension:", formatedName.replace(".ts", ""))
        // console.log()

        formatedName = formatedName.replace(".ts", "")
    } else if (context.config.showFileExtension === "off") {
        // Remove the ENTIRE file extension from the file name (main.server.ts -> main, instead of main.server)
        // console.log("No fileExtension:", formatedName.split(".")[0])
        // console.log()

        formatedName = formatedName.split(".")[0]
    } else {
        // If the showFileExtension setting is invalid, throw an error
        throw new Error("Invalid showFileExtension setting")
    }

    // Check the showLine setting
    if (context.config.showLine) {
        // console.log("Line and character position:", sourceFile.getLineAndCharacterOfPosition(node.getStart()))
        // console.log("Correct line position:", sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1)
        // console.log()

        // Get the line and character position of the node in the source file
        const linePos = sourceFile.getLineAndCharacterOfPosition(node.getStart())
        // Line position has to be incremented by 1 because it's 0-based
        formatedLine = `:${linePos.line + 1}`
    }

    // Check if the CallExpression has a message argument
    if (node.arguments.length === 0) {
        // console.log("No message argument provided")
        // console.log("Final result:", `[${formatedName}${formatedLine}]`)
        // console.log("\n")

        // If so, only print the prefix of the output
        return context.factory.createCallExpression(
            context.factory.createIdentifier(mode),
            undefined,
            [context.factory.createStringLiteral(`[${formatedName}${formatedLine}]`)]
        )
    } else {
        // console.log("Message argument provided")
        // console.log("Final result:", `[${formatedName}${formatedLine}]`, node.arguments[0].getText())
        // console.log("\n")

        // If the CallExpression has a message argument, print the prefix and the message
        return context.factory.createCallExpression(
            context.factory.createIdentifier(mode),
            undefined,
            [
                context.factory.createStringLiteral(`[${formatedName}${formatedLine}]`),
                node.arguments[0]
            ]
        )
    }
}

function visitCallExpression(context: TransformContext, node: ts.CallExpression): ts.CallExpression | ts.NotEmittedStatement {

    // Check if the CallExpression is a $print call
    if (node.expression.getText() === "$print" || node.expression.getText() === "$warn") { // Add "|| node.expression.getText() === "$error"" when properly implemented
        // console.log("Is $print call")

        // If nothing or only message provided, format and emit the print call immediately
        if (node.arguments.length <= 1) {
            // console.log("Arguments length <= 1")
            // console.log()

            const mode =  
                node.expression.getText() === "$print" ? "print" :
                node.expression.getText() === "$warn" ? "warn" :
                node.expression.getText() === "$error" ? "error" :
                "print"

            // console.log("Call:", node.expression.getText())
            // console.log("Mode:", mode)

            return formatMessage(context, node, mode)
        } 
        // If log level provided, check if it should be emitted
        else if (node.arguments.length === 2) {
            // console.log("Arguments length === 2 (log level provided)")

            // Ensure log level is a number
            if (!ts.isNumericLiteral(node.arguments[1])) {
                throw new Error("Invalid log level, expected number")
            }

            // Parse logLevel string to number ("1" -> 1)
            const logLevel = parseInt(node.arguments[1].getText())
            // console.log("Log level:", logLevel)
            // console.log("Config log level:", context.config.logLevel)

            // Check if print's log level is less than or equal to the config log level
            if (logLevel <= context.config.logLevel) {
                // If so, format the message
                // console.log("print log level is <= to config log level, emitting")
                // console.log()

                const mode =  
                    node.expression.getText() === "$print" ? "print" :
                    node.expression.getText() === "$warn" ? "warn" :
                    node.expression.getText() === "$error" ? "error" :
                    "print"

                // console.log("Call:", node.expression.getText())
                // console.log("Mode:", mode)

                return formatMessage(context, node, mode)
            } else {
                // If not, return a NotEmittedStatement (nothing will be emitted)
                // console.log("print log level is > to config log level, not emitting")
                // console.log()

                return context.factory.createNotEmittedStatement(node)
            }
        } else {
            // If more than 2 arguments are provided, throw an error
            throw new Error("Invalid number of arguments, expected 0-2")
        }
    }

    // If the CallExpression is not $print, return the original node
    return context.transform(node)
}

function visitNode(context: TransformContext, node: ts.Node): ts.Node {

    // Check if the node is a CallExpression (function call)
    if (ts.isCallExpression(node)) {
        // console.log("Is CallExpression", node.expression.getText())

        // If it is, call visitCallExpression
        return visitCallExpression(context, node)
    }
    
    // If the node is not a CallExpression, return the original node
    return context.transform(node)
}