
// Your completed chat functions, with exports added for use as a module.
export function deleteStudent(state, studentId) {
  const students = state.students.filter(
    (student) => student.id !== studentId
  );
  if (students.length === state.students.length) return { ...state };
  const enrolments = state.enrolments.filter(
    (enrolment) => enrolment.studentId !== studentId
  );
  return { ...state, students, enrolments };
}

export function deleteCourse(state, courseId) {
  const hasEnrolments = state.enrolments.some(
    (enrolment) => enrolment.courseId === courseId
  )
  if (hasEnrolments) return state
  const courses = state.courses.filter(
    (course) => course.id !== courseId
  );
  if (courses.length === state.courses.length) return state;
  return { ...state, courses }
}

export function removeEnrolment(state, enrolmentId) {
  const enrolments = state.enrolments.filter(
    (enrolment) => enrolment.id !== enrolmentId
  );
  if (enrolments.length === state.enrolments.length) return state;
  return { ...state, enrolments };
}

export function isEnrolled(enrolments, studentId, courseId) {
  return enrolments.some(
    (enrolment) =>
      enrolment.studentId === studentId &&
      enrolment.courseId === courseId
  );
}

export function addEnrolment(state, newEnrolment) {
  const { studentId, courseId } = newEnrolment;
  const studentExists = state.students.some(
    (student) => student.id === studentId
  );
  const courseExists = state.courses.some(
    (course) => course.id === courseId
  );
  const enrolled = isEnrolled(
    state.enrolments, newEnrolment.studentId, newEnrolment.courseId
  );
  return !studentExists || !courseExists || enrolled
    ? state
    : { ...state, enrolments: [...state.enrolments, newEnrolment] };
}

export function addStudent(state, newStudent) {
  const studentExists = state.students.some((student) => student.id === newStudent.id)
  if (studentExists) return state
  return { ...state, students: [...state.students, newStudent] }
}

export function addCourse(state, newCourse) {
  const courseExists = state.courses.some((course) => course.id === newCourse.id)
  if (courseExists) return state
  return { ...state, courses: [...state.courses, newCourse] }
}

export function searchStudent(state, query) {
  return state.students.filter(
    (student) => student.name.toLowerCase().includes(query)
  )
}

export function findStudent(students, studentId) {
  return students.find((student) => student.id === studentId)
}

export function findCourse(courses, courseId) {
  return courses.find((course) => course.id === courseId)
}

export function updateStudent(state, studentId, changes) {
  let studentFound = false;
  const updatedStudents = state.students.map((student) => {
    if (student.id === studentId) {
      studentFound = true
      return { ...student, ...changes, id: studentId }
    }
    return student
  })
  return studentFound ? { ...state, students: updatedStudents } : state
}

export function updateCourse(state, courseId, changes) {
  let courseFound = false;
  const updatedCourses = state.courses.map((course) => {
    if (course.id === courseId) {
      courseFound = true
      return { ...course, ...changes, id: courseId }
    }
    return course
  })
  return courseFound ? { ...state, courses: updatedCourses } : state
}



export function getEnrolmentDetails(state) {
  return state.enrolments.map((enrolment) => {
    const student = state.students.find((student) => student.id === enrolment.studentId)
    const course = state.courses.find((course) => course.id === enrolment.courseId)
    return {
      id: enrolment.id,
      studentName: student.name,
      courseTitle: course.title
    }
  })
}

export function getNextEnrolmentId(enrolments) {
  return Math.max(0, ...enrolments.map((enrolment) => enrolment.id)) + 1
}
