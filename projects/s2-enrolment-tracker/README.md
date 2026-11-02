# Student enrolment tracker

A learning project built with vanilla JavaScript, HTML and CSS. Manage fictional
students, courses and enrolments without a backend or framework.

## Features

- Add, edit and delete students and courses.
- Search students by name and courses by title, ignoring case and surrounding spaces.
- Keep active searches applied after adding, editing or deleting records.
- Enrol students in courses and remove enrolments.
- Save changes in the browser and restore them after reloading.
- Load a sample dataset with validation, loading feedback and confirmation.
- Use the app with a keyboard or on a narrow screen.

## Run locally

1. Open this folder in your editor.
2. Start a local HTTP server, such as the editor's Live Server extension.
3. Open `index.html` through that server.

Serve the files over HTTP rather than opening `index.html` directly: the app uses
JavaScript modules and fetches a JSON file. There is no build step and no npm
dependencies to install.

## Check JavaScript syntax

With Node.js and npm installed, run this from the tracker folder:

```sh
npm run check
```

This checks only the syntax of `app.js`, without executing it. It does not check
imported files or verify app behavior.

## Run automated tests

From the tracker folder, run:

```sh
npm test
```

This uses Node.js's built-in test runner. The five tests cover:

- Rejecting a duplicate student-course enrolment.
- Adding a valid enrolment without changing the original enrolments.
- Deleting a student and their enrolments while preserving courses and original state.
- Blocking deletion of a course with enrolments.
- Rejecting a dataset with an enrolment that references a missing student, while
  accepting the initial dataset.

These tests check data functions. Browser interactions, search, persistence and
import flows are checked manually; they are not covered by this automated suite.

## Saving and importing

Changes are saved in `localStorage` under `enrolment-tracker-state`. Data belongs
to the current browser profile and site origin; it is not shared across devices
or browsers. Clearing site data removes it. Use fictional data only: this app has
no authentication or server-side access control.

On startup, missing saved data uses the initial sample records. Invalid saved
data shows an error and falls back to those records. A valid empty dataset stays
empty. If saving fails, changes remain visible for the current session, and an
error explains that they could not be saved.

**Load sample data** fetches and validates `sample-import.json`. After loading,
the app asks before replacing all current students, courses and enrolments.
Cancelling preserves the current data and unfinished edits. Confirming resets
the forms and both searches, replaces the dataset, and attempts to save it. This is a
replacement, not a merge. A failed fetch or validation leaves current data intact.

## Data rules

- Student and course IDs are positive integers, unique within their respective
  collections. IDs stay unchanged when editing.
- Each enrolment connects an existing student and course. The same student cannot
  enrol in the same course twice.
- The app generates new enrolment IDs from the largest current ID plus one,
  starting at one when empty. Deleted IDs may be reused.
- Deleting a student also removes their enrolments, but preserves courses.
- A course cannot be deleted while it has enrolments.
- Unenrolling removes only the relationship, preserving the student and course.
- Data-update functions create updated state without mutating the original data.
- Saved and imported datasets are checked for record structure, duplicate IDs,
  duplicate enrolment pairs and missing student/course references.

## Files

| File                 | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| `index.html`         | Page structure, forms and feedback areas                |
| `style.css`          | Responsive layout, action styles and focus indicators   |
| `app.js`             | Event handling, rendering and app coordination          |
| `state.js`           | Data updates, searches and enrolment helpers            |
| `data.js`            | Initial fictional records                               |
| `storage.js`         | Browser storage and dataset validation                  |
| `state.test.js`      | Tests for enrolment and deletion rules                  |
| `storage.test.js`    | Test for dataset relationship validation                |
| `import.js`          | Fetching and validating imported data                   |
| `sample-import.json` | Replacement sample dataset                              |
| `package.json`       | Project metadata and npm scripts                        |
| `.gitignore`         | Excludes installed packages and local environment files |
