'use strict';

import { initialState } from './data.js';
import { fetchImportState } from './import.js';
import {
  deleteStudent,
  addStudent,
  searchStudent,
  findStudent,
  updateStudent,
  deleteCourse,
  addCourse,
  updateCourse,
  findCourse,
  removeEnrolment,
  getEnrolmentDetails,
  getNextEnrolmentId,
  addEnrolment,
  searchCourse,
} from './state.js';

import { loadState, saveState } from './storage.js';

const studentList = document.querySelector('#student-list');
const studentEmptyMessage = document.querySelector('#student-empty-message');
const studentForm = document.querySelector('#add-student-form');
const studentSearchInput = document.querySelector('#student-search');
const studentSubmitBtn = studentForm.querySelector('input[data-action="add"]');
const studentCancelBtn = studentForm.querySelector('button[data-action="cancel"]');

const courseList = document.querySelector('#course-list');
const courseEmptyMessage = document.querySelector('#course-empty-message');
const courseForm = document.querySelector('#add-course-form');
const courseSearchInput = document.querySelector('#course-search');
const courseFeedback = document.querySelector('#course-feedback');
const courseSubmitBtn = courseForm.querySelector('button[data-action="add"]');
const courseCancelBtn = courseForm.querySelector('button[data-action="cancel"]');

const enrolmentList = document.querySelector('#enrolment-list');
const enrolmentEmptyMessage = document.querySelector('#enrolment-empty-message');
const enrolmentForm = document.querySelector('#add-enrolment-form');
const enrolmentFormErrors = document.querySelector('#enrolment-form-errors');
const enrolmentStudentDropdown = document.querySelector('#enrolment-student');
const enrolmentCourseDropdown = document.querySelector('#enrolment-course');
const enrolmentSubmitBtn = enrolmentForm.querySelector('button[data-action="add"]');

const storageFeedback = document.querySelector('#storage-feedback')
const importFeedback = document.querySelector('#import-feedback')
const loadSampleBtn = document.querySelector('#load-sample-button')

let state = initialState;
let studentEditingId = null;
let courseEditingId = null;

studentList.addEventListener('click', actionController);
studentForm.addEventListener('submit', submitController);
studentSearchInput.addEventListener('input', refreshStudents);
studentCancelBtn.addEventListener('click', actionController);

courseList.addEventListener('click', actionController);
courseForm.addEventListener('submit', submitController);
courseSearchInput.addEventListener('input', refreshCourses);
courseCancelBtn.addEventListener('click', actionController);

enrolmentList.addEventListener('click', actionController);
enrolmentForm.addEventListener('submit', submitController);

loadSampleBtn.addEventListener('click', loadSampleState)

function actionController(e) {
  const button = e.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  const domain = button.dataset.domain;

  switch (domain) {
    case 'student':
      handleStudentAction(id, action);
      break;
    case 'course':
      handleCourseAction(id, action);
      break;
    case 'enrolment':
      handleEnrolmentAction(id, action);
      break;
  }
}

function handleStudentAction(studentId, action) {
  switch (action) {
    case 'delete':
      state = deleteStudent(state, studentId);
      if (studentEditingId === studentId) resetStudentForm();
      refreshEnrolments();
      renderEnrolmentOptions();
      persistState();
      studentSearchInput.focus()
      break;
    case 'edit':
      setStudentEditing(studentId);
      break;
    case 'cancel':
      resetStudentForm();
      studentForm.elements.id.focus();
      break;
  }
  refreshStudents();
}

function handleCourseAction(courseId, action) {
  switch (action) {
    case 'delete':
      const newState = deleteCourse(state, courseId);
      if (newState === state) {
        courseFeedback.textContent = 'Cannot delete a course with enrolments';
        courseFeedback.hidden = false;
        return;
      }
      if (courseEditingId === courseId) resetCourseForm();
      courseFeedback.hidden = true;
      state = newState;
      refreshEnrolments();
      renderEnrolmentOptions();
      persistState();
      courseForm.elements.id.focus()
      break;
    case 'edit':
      setCourseEditing(courseId);
      break;
    case 'cancel':
      resetCourseForm();
      courseForm.elements.id.focus()
      break;
  }

  refreshCourses()
}

function handleEnrolmentAction(enrolmentId, action) {
  switch (action) {
    case 'delete':
      const newState = removeEnrolment(state, enrolmentId);
      if (newState === state) return;
      state = newState;
      persistState()
      enrolmentForm.elements.studentId.focus()
      break;
  }
  refreshEnrolments();
}

function submitController(e) {
  e.preventDefault();

  const form = e.currentTarget;
  const domain = form.dataset.domain;
  const formData = Object.fromEntries(new FormData(form));
  const { isValid, errors, sanitisedObject } = validateFormData(domain, formData)

  if (!isValid) {
    showFormErrors(form, errors);
    return;
  }
  hideFormErrors(form);

  switch (domain) {
    case 'student':
      handleStudentformSubmit(sanitisedObject, form)
      break;
    case 'course':
      handleCourseformSubmit(sanitisedObject, form)
      break
    case 'enrolment':
      handleEnrolmentformSubmit(sanitisedObject, form)
      break
  }
}

function handleStudentformSubmit(student, form) {
  if (studentEditingId !== null) {
    state = updateStudent(state, studentEditingId, student);
  } else {
    const newState = addStudent(state, student);
    if (newState === state) {
      showFormErrors(form, ['A student with this ID already exists']);
      return;
    }
    state = newState;
  }
  hideFormErrors(form)
  resetStudentForm();
  refreshStudents();
  refreshEnrolments();
  renderEnrolmentOptions();
  persistState()
}

function handleCourseformSubmit(course, form) {
  if (courseEditingId !== null) {
    state = updateCourse(state, courseEditingId, course);
  } else {
    const newState = addCourse(state, course);
    if (newState === state) {
      showFormErrors(form, ['A course with this ID already exists']);
      return;
    }
    state = newState;
  }
  hideFormErrors(form)
  refreshCourses()
  resetCourseForm();
  refreshEnrolments();
  renderEnrolmentOptions();
  persistState()
}

function handleEnrolmentformSubmit(enrolment, form) {
  const newEnrolment = {
    id: getNextEnrolmentId(state.enrolments),
    studentId: Number(enrolment.studentId),
    courseId: Number(enrolment.courseId),
  };
  const newState = addEnrolment(state, newEnrolment);
  if (newState === state) {
    showFormErrors(form, ['Student has already been enrolled in this course']);
    return;
  }
  state = newState;
  hideFormErrors(form)
  resetEnrolmentForm();
  refreshEnrolments();
  persistState()
}

function validateFormData(domain, formData) {
  const errors = [];
  const sanitisedData = {};

  switch (domain) {
    case 'student':
      const studentId = Number(formData.id);
      const name = formData.name?.trim();
      const email = formData.email?.trim();
      if (!studentId || Number.isNaN(studentId) || studentId <= 0) {
        errors.push('A valid positive ID is required.');
      }
      if (!name) {
        errors.push('Name cannot be empty.');
      }
      sanitisedData.sanitisedObject = { id: studentId, name, email };
      break;
    case 'course':
      const courseId = Number(formData.id);
      const title = formData.title?.trim();
      if (!courseId || Number.isNaN(courseId) || courseId <= 0) {
        errors.push('A valid positive ID is required.');
      }
      if (!title) {
        errors.push('Title cannot be empty.');
      }
      sanitisedData.sanitisedObject = { id: courseId, title };
      break
    case 'enrolment':
      const enrolStudentId = Number(formData.studentId);
      const enrolCourseId = Number(formData.courseId)
      if (!enrolStudentId || Number.isNaN(enrolStudentId) || enrolStudentId <= 0) {
        errors.push('A valid positive ID is required.');
      }
      if (!enrolCourseId || Number.isNaN(enrolCourseId) || enrolCourseId <= 0) {
        errors.push('A valid positive ID is required.');
      }
      sanitisedData.sanitisedObject = { studentId: enrolStudentId, courseId: enrolCourseId };
      break
  }

  sanitisedData.isValid = errors.length === 0;
  sanitisedData.errors = errors;
  return sanitisedData
}

function setStudentEditing(studentId) {
  hideFormErrors(studentForm);
  studentEditingId = studentId;
  const student = findStudent(state.students, studentId);

  studentForm.elements.id.value = studentId;
  studentForm.elements.id.readOnly = true;
  studentForm.elements.name.value = student.name;
  studentForm.elements.email.value = student.email;

  studentSubmitBtn.value = 'Edit';
  studentCancelBtn.hidden = false;

  studentForm.elements.name.focus()
}

function setCourseEditing(courseId) {
  hideFormErrors(courseForm);
  courseEditingId = courseId;
  const course = findCourse(state.courses, courseId);

  courseForm.elements.id.value = courseId;
  courseForm.elements.id.readOnly = true;
  courseForm.elements.title.value = course.title;

  courseSubmitBtn.textContent = 'Edit Course';
  courseCancelBtn.hidden = false;
  courseForm.elements.title.focus()
}

async function loadSampleState() {
  loadSampleBtn.disabled = true
  importFeedback.dataset.status = 'loading'
  showFeedback(importFeedback, 'Loading sample data...')
  try {
    const { state: importedState, error } = await fetchImportState('./sample-import.json')

    if (error) {
      importFeedback.dataset.status = 'error'
      showFeedback(importFeedback, error)
      return
    }

    importFeedback.dataset.status = 'success'
    showFeedback(importFeedback, 'Sample data is ready')

    const confirmed = confirm('Replace all current data with the sample dataset?')
    if (!confirmed) {
      showFeedback(importFeedback, 'Import cancelled')
      return
    }
    state = importedState
    resetUI()
    refreshStudents()
    refreshCourses()
    refreshEnrolments();
    renderEnrolmentOptions();
    persistState()
    showFeedback(importFeedback, 'Sample data imported')


  } catch (error) {
    importFeedback.dataset.status = 'error'
    showFeedback(importFeedback, error.message)
  } finally {
    loadSampleBtn.disabled = false
  }
}

function resetStudentForm() {
  studentEditingId = null;
  studentForm.reset();
  studentForm.elements.id.readOnly = false;
  // studentForm.elements.id?.focus();
  studentSubmitBtn.value = 'Add';
  studentCancelBtn.hidden = true;
}

function resetCourseForm() {
  courseEditingId = null;
  courseForm.reset();
  courseForm.elements.id.readOnly = false;
  // courseForm.elements.id?.focus();
  courseSubmitBtn.textContent = 'Add';
  courseCancelBtn.hidden = true;
}

function resetEnrolmentForm() {
  enrolmentForm.reset();
}

function refreshStudents() {
  const query = studentSearchInput.value.trim().toLowerCase();
  const matches = searchStudent(state, query);
  renderStudents(matches);
}

function refreshCourses() {
  const query = courseSearchInput.value.trim().toLowerCase();
  const matches = searchCourse(state, query);
  renderCourses(matches)
}

function refreshEnrolments() {
  renderEnrolments(getEnrolmentDetails(state));
}

function renderStudents(students) {
  studentList.replaceChildren();
  studentEmptyMessage.hidden = true;

  if (students.length === 0) {
    studentEmptyMessage.textContent =
      state.students.length === 0 ? 'No students yet' : 'No matching students';
    studentEmptyMessage.hidden = false;
    return;
  }

  const fragment = document.createDocumentFragment();

  students.forEach((student) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = `${student.name} — ${student.email}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.domain = 'student';
    deleteBtn.dataset.id = student.id;
    deleteBtn.setAttribute('aria-label', `Delete student ${student.name}`)

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.domain = 'student';
    editBtn.dataset.id = student.id;
    editBtn.setAttribute('aria-label', `Edit student ${student.name}`)

    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(editBtn, deleteBtn);
    li.append(span, actions);
    fragment.append(li);
  });

  studentList.append(fragment);
}

function renderCourses(courses) {
  courseList.replaceChildren();
  courseEmptyMessage.hidden = true;

  if (courses.length === 0) {
    courseEmptyMessage.textContent = state.courses.length === 0
      ? 'No courses yet'
      : 'No matching courses'
    courseEmptyMessage.hidden = false;
    return;
  }

  const fragment = document.createDocumentFragment();

  courses.forEach((course) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = `${course.title}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.domain = 'course';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = course.id;
    deleteBtn.setAttribute('aria-label', `Delete course ${course.title}`)

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.textContent = 'Edit';
    editBtn.dataset.domain = 'course';
    editBtn.dataset.action = 'edit';
    editBtn.dataset.id = course.id;
    editBtn.setAttribute('aria-label', `Edit course ${course.title}`)

    const actions = document.createElement('div');
    actions.className = 'row-actions';
    actions.append(editBtn, deleteBtn);
    li.append(span, actions);
    fragment.append(li);
  });

  courseList.append(fragment);
}

function renderEnrolments(enrolments) {
  enrolmentList.replaceChildren();
  enrolmentEmptyMessage.hidden = true;

  if (enrolments.length === 0) {
    enrolmentEmptyMessage.textContent = 'No enrolments yet';
    enrolmentEmptyMessage.hidden = false;
    return;
  }

  const fragment = document.createDocumentFragment();

  enrolments.forEach((enrolment) => {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = `${enrolment.studentName} — ${enrolment.courseTitle}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Unenrol';
    deleteBtn.dataset.domain = 'enrolment';
    deleteBtn.dataset.action = 'delete';
    deleteBtn.dataset.id = enrolment.id;
    deleteBtn.setAttribute(
      'aria-label',
      `Unenrol ${enrolment.studentName} from ${enrolment.courseTitle}`
    )

    li.append(span, deleteBtn);
    fragment.append(li);
  });

  enrolmentList.append(fragment);
}

function renderEnrolmentOptions() {
  enrolmentSubmitBtn.disabled = !(state.students.length > 0 && state.courses.length > 0);
  populateDropdown(enrolmentStudentDropdown, state.students, 'Choose a student', 'id', 'name');
  populateDropdown(enrolmentCourseDropdown, state.courses, 'Choose a course', 'id', 'title');
}

function populateDropdown(element, items, defaultText, valueKey, labelKey) {
  const options = [
    new Option(defaultText, '', true),
    ...items.map((item) => new Option(item[labelKey], item[valueKey])),
  ];
  element.replaceChildren(...options);
}

function showFormErrors(form, errors) {
  const errorElement = form.querySelector('.form-errors')
  errorElement.innerHTML = errors.map((error) => `<div>${error}</div>`).join('');
  errorElement.hidden = false;
}

function hideFormErrors(form) {
  const errorElement = form.querySelector('.form-errors')
  errorElement.replaceChildren();
  errorElement.hidden = true;
}

function persistState() {
  hideFeedback(storageFeedback)
  const savedState = saveState(state)

  if (savedState.error !== null) {
    showFeedback(storageFeedback, 'Changes could not be saved: ' + savedState.error)
  }
}

function initializeState() {
  hideFeedback(storageFeedback)
  const loadedState = loadState()

  if (loadedState.state !== null) {
    state = loadedState.state
  } else if (loadedState.state === null && loadedState.error !== null) {
    showFeedback(storageFeedback, loadedState.error)
  }
}

function showFeedback(element, feedback) {
  element.textContent = feedback
  element.hidden = false
}

function hideFeedback(element) {
  element.textContent = ''
  element.hidden = true
}

function resetUI() {
  hideFormErrors(studentForm)
  hideFormErrors(courseForm)
  hideFormErrors(enrolmentForm)
  hideFeedback(courseFeedback)
  resetStudentForm()
  resetCourseForm()
  resetEnrolmentForm()
  studentSearchInput.value = ''
  courseSearchInput.value = ''
}

initializeState()
refreshStudents();
refreshCourses()
refreshEnrolments();
renderEnrolmentOptions();
