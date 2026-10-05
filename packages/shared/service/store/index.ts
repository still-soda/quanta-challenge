import type { IStore } from './i-store';
import { LocalStore } from './local-store';

const store = new LocalStore();

export const useStore = (): IStore => {
   return store;
};

// 统一 local_store 路径解析，见 utils/local-store-path.ts 的说明。
// 判题调度器与 Web 应用必须用同一个目录，否则调度器写出的封面 Web 端读不到。
export {
   resolveLocalStorePath,
   describeLocalStorePath,
} from '../../utils/local-store-path';
