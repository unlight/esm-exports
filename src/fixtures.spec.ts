import * as assert from 'assert';
import { directory } from '.';
import { normalize } from 'path';

it.only('should take only file by findFileExtensions', async () => {
    const result = await directory(__dirname + '/../fixtures');
    assert(result);
    assert.equal(result.length, 1);
    assert.equal(result[0].name, 'DummyComponent');
    assert.equal(result[0].filepath, normalize(__dirname + '/../fixtures/dummy.component.ts'));
});
