# S2 student enrolment tracker

## Current task: render students (S2.2)

Complete only `renderStudents(students)` in `app.js`.

- Clear the previous list before rendering.
- Display one list item per student: `Alex — alex@example.com`.
- Show `No students yet.` only when the supplied array is empty.
- Use the supplied parameter; do not change the data.

The directory is intentionally blank until you implement the function.

Check with the sample array, then `[]`, then the sample array again.
Confirm the empty message toggles and list items do not accumulate.
Restore the sample-data call afterward. Say "check my answer" when ready.

## Opening the page

Use your editor's local web server (such as Live Server) to open `index.html`.
Serve it over HTTP; opening the file directly does not reliably load ES modules.

## Files

- `app.js`: current learner task and DOM interaction.
- `data.js`: supplied fictional sample records.
- `state.js`: your previously completed functions, with module exports added.
- `index.html` and `style.css`: supplied UI starter.

## Agreed rules

- An enrolment connects an existing student and course by ID.
- Reject duplicate student/course pairs. New enrolment IDs are currently assumed unique.
- Deleting a student removes their enrolments, preserves other records and courses.
- Block course deletion while related enrolments exist; student records remain.
- State updates must not mutate the original data.

Further features will be introduced one task at a time. Persistence, validation
messages, ID generation and course deletion are not implemented yet.
