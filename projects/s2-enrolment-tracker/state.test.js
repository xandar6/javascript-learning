import test from 'node:test';
import assert from 'node:assert/strict';
import { addEnrolment, deleteCourse, deleteStudent } from './state.js';
import { initialState } from './data.js';

test('rejects a duplicate student-course enrolment', () => {
  const enrolment = {
    id: 999,
    studentId: 1,
    courseId: 10
  };
  const updatedState = addEnrolment(initialState, enrolment)
  assert.strictEqual(updatedState, initialState)
});

test('Successfully enrol student 2 in course 20', () => {
  const enrolment = {
    id: 999,
    studentId: 2,
    courseId: 20
  }
  const originalEnrolmentsSnapshot = structuredClone(initialState.enrolments)
  const updatedState = addEnrolment(initialState, enrolment)
  // - The returned state is a different object (reference check)
  assert.notStrictEqual(updatedState, initialState)
  // - Enrolments array has one extra entry
  assert.strictEqual(updatedState.enrolments.length, originalEnrolmentsSnapshot.length + 1)
  // - Its final entry matches the new enrolment (deep content check)
  assert.deepStrictEqual(updatedState.enrolments.at(-1), enrolment)
  // - The original enrolments remain unchanged
  assert.deepStrictEqual(initialState.enrolments, originalEnrolmentsSnapshot)
})

test('Successfully delete a student', () => {
  const studentToBeDeleted = 1
  const originalStateSnapshop = structuredClone(initialState)

  const updatedState = deleteStudent(initialState, studentToBeDeleted)

  const remainingStudents = updatedState.students.map((student) => student.id)
  assert.deepStrictEqual(remainingStudents, [2])

  const remainingEnrolments = updatedState.enrolments.map((enrolment) => enrolment.id)
  assert.deepStrictEqual(remainingEnrolments, [103])

  assert.strictEqual(updatedState.courses, initialState.courses)
  assert.deepStrictEqual(initialState, originalStateSnapshop)
})

test('Successfully test a course which has enrolments cannot be deleted', () => {
  const originalStateSnapshop = structuredClone(initialState)
  const updatedState = deleteCourse(initialState, 10)
  assert.strictEqual(updatedState, initialState)
  assert.deepStrictEqual(initialState, originalStateSnapshop)
})
