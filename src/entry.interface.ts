export interface Entry {
	name: string;
	module: string;
	dirname?: string;
	relative?: string;
	exact?: string;
	specifier?: string;
	exportAll?: boolean;
}