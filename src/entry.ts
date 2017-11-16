type EntryConstructor = {
    name?: string;
    module?: string;
    filepath?: string;
    specifier?: string;
    isDefault?: boolean;
};

export class Entry {
	/**
	 * Export name.
	 */
    name?: string;
	/**
	 * Canonicalized absolute pathname.
	 */
    filepath?: string;
	/**
	 * [specifier description]
	 */
    specifier?: string;
	/**
	 * Node module name.
	 */
    module?: string;

	/**
	 * Flag indicates export default.
	 */
    isDefault: boolean;

    constructor({ name, filepath, specifier, module, isDefault }: EntryConstructor) {
        this.name = name;
        this.specifier = specifier;
        this.isDefault = Boolean(isDefault);
        this.module = module;
        this.filepath = filepath;
    }

    hash() {
        return `${this.name}/${this.module ? this.module : this.filepath}`;
    }
}
