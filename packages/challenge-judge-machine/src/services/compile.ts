import { Singleton } from '../utils/singleton.js';
import ts from 'typescript';

export class CompileService extends Singleton {
   static get instance() {
      return this.getInstance<CompileService>();
   }

   transpileTS(code: string) {
      return ts.transpileModule(code, {
         compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2020,
         },
      }).outputText;
   }

   extractDefaultExport(code: string) {
      const sourceFile = ts.createSourceFile(
         'temp.ts',
         code,
         ts.ScriptTarget.Latest,
         true
      );
      let exportExpression: ts.Node | undefined;

      ts.forEachChild(sourceFile, (node) => {
         if (ts.isExportAssignment(node)) {
            exportExpression = node;
         }
      });

      if (exportExpression) {
         const printer = ts.createPrinter();
         const code = printer.printNode(
            ts.EmitHint.Unspecified,
            exportExpression,
            sourceFile
         );
         return this.transpileTS(code);
      }

      return null;
   }
}
