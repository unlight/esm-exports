import { parse } from './parse';
import { Entry } from './entry';
import { findFile, readFile } from './utils';
import { resolve } from 'path';

export type ParseFileOptions = {
	dirname?: string;
	module?: string;
};

export function parseFile(file: string, options: ParseFileOptions): Promise<Entry[]> {
	const { dirname, module } = options;
	let filepath: string;
	return findFile(file, dirname)
		.then(file2 => {
			if (file2) return file2;
			return findFile('index', resolve(dirname, file));
		})
		.then(file3 => {
			if (!file3) return Promise.reject(undefined);
			filepath = file3;
			return readFile(filepath, 'utf8');
		})
		.then((sourceText: string) => {
			return parse(sourceText, { filepath, module });
		})
		.catch(err => {
			return Promise.resolve([]);
		});
}