export class Entry {
	/**
	 * Export name.
	 */
	name: string;
	/**
	 * Canonicalized absolute pathname.
	 */
	filepath: string;
	/**
	 * [specifier description]
	 */
	specifier: string;
	/**
	 * Node module name.
	 */
	module: string;
	
	constructor({name, filepath, specifier, module}) {
		this.name = name;
		this.filepath = filepath;
		this.specifier = specifier;
		this.module = module;
	}
	
	hash() {
		return JSON.stringify([this.name, this.filepath]);
	}
}