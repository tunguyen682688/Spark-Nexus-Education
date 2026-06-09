import { sharedLibs } from './shared-libs.js';

describe('sharedLibs', () => {
  it('should work', () => {
    expect(sharedLibs()).toEqual('shared-libs');
  });
});
