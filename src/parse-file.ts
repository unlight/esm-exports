import { parse } from './parse';
import { Entry } from './entry';
import { findFile, readFile } from './utils';

export type ParseFileOptions = {
	dirname?: string;
	module?: string;
};

export function parseFile(file: string, options: ParseFileOptions): Promise<Entry[]> {
	const { dirname, module } = options;
	let filepath: string;
	return findFile(file, dirname)
		.then(file => {
			if (!file) return Promise.reject(undefined);
			filepath = file;
			return readFile(filepath, 'utf8');
		})
		.then((sourceText: string) => {
			return parse(sourceText, { filepath, module });
		})
		.catch(err => {
			return Promise.resolve([]);
		});
}