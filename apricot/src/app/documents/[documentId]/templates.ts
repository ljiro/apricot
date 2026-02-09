export const TEMPLATE_CONTENT: Record<string, string> = {
  blank: "<p></p>",
  resume: `
    <h1>Your Name</h1>
    <p>Email | Phone | Location</p>
    <h2>Experience</h2>
    <h3>Job Title, Company</h3>
    <p><em>Dates</em></p>
    <p>Description of responsibilities and achievements.</p>
    <h3>Job Title, Company</h3>
    <p><em>Dates</em></p>
    <p>Description of responsibilities and achievements.</p>
    <h2>Education</h2>
    <h3>Degree, Institution</h3>
    <p><em>Year</em></p>
    <p></p>
  `,
  letter: `
    <p style="text-align: right">Your address<br>City, State, ZIP<br>Date</p>
    <p>Recipient name<br>Title<br>Company<br>Address</p>
    <p>Dear [Recipient],</p>
    <p>Opening paragraph.</p>
    <p>Body paragraph.</p>
    <p>Closing paragraph.</p>
    <p>Sincerely,<br>Your name</p>
  `,
  meeting: `
    <h1>Meeting: [Topic]</h1>
    <p><strong>Date:</strong> [Date] | <strong>Attendees:</strong> [Names]</p>
    <h2>Agenda</h2>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
    <h2>Notes</h2>
    <p></p>
    <h2>Action items</h2>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Action 1</p></div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Action 2</p></div></li>
    </ul>
  `,
  todo: `
    <h1>To-do list</h1>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 1</p></div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 2</p></div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Task 3</p></div></li>
    </ul>
  `,
};
