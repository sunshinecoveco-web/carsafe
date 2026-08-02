import test from 'node:test';
import assert from 'node:assert/strict';

import { buildVehicleFlagInsertPayload } from './vehicle-flags';

test('buildVehicleFlagInsertPayload preserves mock-auth string insurer ids', () => {
  const payload = buildVehicleFlagInsertPayload(
    '00000000-0000-0000-0000-000000000001',
    '032bccbd-e329-45e7-8f22-fc27692704c2',
    'External review request'
  );

  assert.equal(payload.vehicle_id, '00000000-0000-0000-0000-000000000001');
  assert.equal(payload.insurer_id, '032bccbd-e329-45e7-8f22-fc27692704c2');
  assert.equal(payload.flag_type, 'Fraud Indicator');
  assert.equal(payload.visibility, 'external');
});
