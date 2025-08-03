export class Singleton {
   private static _instance: Singleton;

   constructor() {}

   static getInstance<T>(): T {
      if (!Singleton._instance) {
         Singleton._instance = new this();
      }
      return Singleton._instance as T;
   }
}
