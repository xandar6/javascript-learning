import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState } from './data.js';
import { isValidState } from './storage.js';

test('Successfully test invalid saved-data relationships', () => {
  const stateSnapshot = structuredClone(initialState)
  const enrolment = { id: 999, studentId: 999, courseId: 10 }

  stateSnapshot.enrolments.push(enrolment)

  assert.deepStrictEqual(isValidState(stateSnapshot), false)
  assert.deepStrictEqual(isValidState(initialState), true)
})
