type EntryConstructor = {
    name?: string;
    module?: string;
    filepath?: string;
    specifier?: string;
    isDefault?: boolean;
};

/**
 * Class represents import item.
 */
export class Entry {

    private static count = 1;

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
    private readonly counter: number;

    constructor({ name, filepath, specifier, module, isDefault }: EntryConstructor) {
        this.name = name;
        this.specifier = specifier;
        this.isDefault = Boolean(isDefault);
        this.module = module;
        this.filepath = (!module) ? filepath : undefined;
        Object.defineProperty(this, 'counter', {
            enumerable: false,
            value: Entry.count++
        });
    }

    id() {
        return `${this.name || this.counter}${this.isDefault ? '*' : ''}/${this.module ? this.module : this.filepath}`;
    }
}
