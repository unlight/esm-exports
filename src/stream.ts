/// <reference types="node" />

import { Readable } from 'stream';

export class Stream extends Readable {

	constructor() {
		super({ objectMode: true });
	}

}