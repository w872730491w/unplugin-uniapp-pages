import * as vite from 'vite';
import { Options } from './types.cjs';

declare const _default: (options?: Options | undefined) => vite.Plugin<any> | vite.Plugin<any>[];

export = _default;
