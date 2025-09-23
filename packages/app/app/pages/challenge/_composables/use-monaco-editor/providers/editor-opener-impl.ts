import type * as monaco from 'monaco-editor';
import type { MonacoEditor } from '..';

export class CustomCodeEditorOpener implements monaco.editor.ICodeEditorOpener {
   constructor(
      private readonly monaco: MonacoEditor,
      private readonly instance: monaco.editor.IStandaloneCodeEditor
   ) {}

   openCodeEditor(
      _: monaco.editor.ICodeEditor,
      resource: monaco.Uri,
      selectionOrPosition?: monaco.IRange | monaco.IPosition
   ): boolean | Promise<boolean> {
      const uri = resource.path;
      const model = this.monaco.editor.getModel(this.monaco.Uri.file(uri));
      if (!model) return false;
      this.instance.setModel(model);
      if (selectionOrPosition) {
         const range = this.monaco.Range.isIRange(selectionOrPosition)
            ? selectionOrPosition
            : new this.monaco.Range(
                 selectionOrPosition.lineNumber,
                 selectionOrPosition.column,
                 selectionOrPosition.lineNumber,
                 selectionOrPosition.column
              );
         // 进入视图
         this.instance.revealRange(range);
         // 设置光标
         this.monaco.Range.isIRange(selectionOrPosition)
            ? this.instance.setSelection(selectionOrPosition)
            : this.instance.setPosition(selectionOrPosition);
      }
      this.notifyChange(uri.slice(1)); // 删除 / 前缀
      return true;
   }

   private subscriptions: Set<(path: string) => void> = new Set();

   public subscribeChange(callback: (path: string) => void) {
      this.subscriptions.add(callback);
   }

   private notifyChange(path: string) {
      this.subscriptions.forEach((callback) => callback(path));
   }
}
