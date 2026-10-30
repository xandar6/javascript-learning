export function saveState(state) {
  try {
    const JSONState = JSON.stringify(state);
    localStorage.setItem('enrolment-tracker-state', JSONState);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function loadState() {
  try {
    const JSONState = localStorage.getItem('enrolment-tracker-state');
    if (JSONState === null) return { state: null, error: null };
    const state = JSON.parse(JSONState);
    return isValidState(state)
      ? { state: state, error: null }
      : { state: null, error: 'Saved data has an invalid state' };
  } catch (error) {
    return { state: null, error: error.message };
  }
}

export function isValidState(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Array.isArray(value.students) &&
    Array.isArray(value.courses) &&
    Array.isArray(value.enrolments) &&
    value.students.every((student) => isValidStudent(student)) &&
    value.courses.every((course) => isValidCourse(course)) &&
    value.enrolments.every((enrolment) => isValidEnrolment(enrolment)) &&
    hasUniqueIds(value.students) &&
    hasUniqueIds(value.courses) &&
    hasUniqueIds(value.enrolments) &&
    value.enrolments.every((enrolment) =>
      value.students.some((student) => student.id === enrolment.studentId),
    ) &&
    value.enrolments.every((enrolment) =>
      value.courses.some((course) => course.id === enrolment.courseId),
    ) &&
    hasUniqueEnrolmentPairs(value.enrolments)
  );
}

export function isValidStudent(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0 &&
    typeof value.email === 'string' &&
    value.email.trim().length > 0
  );
}

export function isValidCourse(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0
  );
}

export function isValidEnrolment(value) {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Number.isInteger(value.id) &&
    value.id > 0 &&
    Number.isInteger(value.studentId) &&
    value.studentId > 0 &&
    Number.isInteger(value.courseId) &&
    value.courseId > 0
  );
}

export function hasUniqueIds(records) {
  return new Set(records.map((record) => record.id)).size === records.length
}

export function hasUniqueEnrolmentPairs(enrolments) {
  return new Set(enrolments.map(
    (enrolment) => `${enrolment.studentId} : ${enrolment.courseId}`)
  ).size === enrolments.length
}
