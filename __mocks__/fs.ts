import { beforeEach } from 'vitest';
import { mockClear, mockDeep } from 'vitest-mock-extended';

import type fs from 'fs';

const mFs = mockDeep<typeof fs>();

export default mFs;

beforeEach(() => {
  mockClear(mFs);
});
