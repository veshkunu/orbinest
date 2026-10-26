import { daysFromToday } from "./dates";

const templates = [
  ["Follow up with Sunrise Bakery on bulk order", "Call to confirm quantities and delivery date for the Diwali order.", "dep-sales"],
  ["Prepare monthly sales summary", "Total sales by product line and compare with last month.", "dep-sales"],
  ["Update price list for new season", "Apply the new rates shared by the supplier and send to the team.", "dep-sales"],
  ["Send quote to Green Leaf Cafe", "Quote for 40 units of the standard pack with delivery.", "dep-sales"],
  ["Reply to pending support emails", "Clear the support inbox. Escalate anything about refunds.", "dep-support"],
  ["Call back customers with delivery complaints", "Three customers reported late deliveries last week.", "dep-support"],
  ["Update FAQ page with return policy", "Add the new 14-day return window and how to request a return.", "dep-support"],
  ["Review customer feedback forms", "Summarise the top three issues from this week's feedback.", "dep-support"],
  ["Reconcile bank statement", "Match last month's transactions with the ledger.", "dep-finance"],
  ["Process staff reimbursements", "Approve travel claims submitted before the 20th.", "dep-finance"],
  ["Send overdue invoice reminders", "Email the four clients with invoices older than 30 days.", "dep-finance"],
  ["Prepare GST filing documents", "Collect purchase and sales invoices for the quarter.", "dep-finance"],
  ["Count stock in warehouse B", "Full count of shelves 1–12. Note any damaged items.", "dep-ops"],
  ["Schedule van maintenance", "Book the service centre for both delivery vans.", "dep-ops"],
  ["Plan delivery routes for next week", "Group orders by area to cut travel time.", "dep-ops"],
  ["Order packing supplies", "Boxes, tape and labels. Check current stock first.", "dep-ops"],
  ["Fix shelf labels in store", "Several labels in aisle 3 are missing or wrong.", "dep-ops"],
  ["Draft festive offer social posts", "Five posts for Instagram and Facebook with photos.", "dep-marketing"],
  ["Write product descriptions for new range", "Short, friendly descriptions for the 8 new items.", "dep-marketing"],
  ["Plan email newsletter", "Pick the stories and offers for next month's newsletter.", "dep-marketing"],
  ["Take photos of new products", "Plain white background, three angles per product.", "dep-marketing"],
  ["Update team contact sheet", "Make sure every phone number and email is current.", "dep-ops"],
  ["Onboard new sales intern", "Walk through the price list, CRM and daily routine.", "dep-sales"],
  ["Collect timesheets for the week", "Remind anyone who hasn't submitted by Friday noon.", "dep-ops"],
];

const comments = [
  "Started on this, will update by end of day.",
  "Waiting on a reply from the client.",
  "Done with the first half. Need the latest numbers to finish.",
  "Can we move the due date by two days?",
  "Thanks, looks good.",
  "Shared the draft in the team folder.",
];

/** Deterministic pseudo-random so the demo looks the same on every reset. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function createTasks(employees) {
  const random = seeded(42);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const assignable = employees.filter((e) => e.status !== "inactive");
  const admins = employees.filter((e) => e.role === "admin");
  const tasks = [];
  const turns = {};

  for (let i = 0; i < 60; i++) {
    const [title, description, departmentId] = templates[i % templates.length];
    const team = assignable.filter((e) => e.departmentId === departmentId && e.role === "staff");
    // Rotate through each department so every staff member, including the demo account, gets work
    turns[departmentId] = (turns[departmentId] ?? -1) + 1;
    const pool = team.length ? team : assignable;
    const assignee = pool[turns[departmentId] % pool.length];
    const creator = pick(admins);

    // Spread due dates from three weeks ago to three weeks ahead
    const dueOffset = Math.round(random() * 42) - 21;
    const createdOffset = dueOffset - 3 - Math.round(random() * 10);
    const roll = random();
    let status;
    if (dueOffset < -3) status = roll < 0.65 ? "done" : roll < 0.85 ? "in_progress" : "todo";
    else if (dueOffset < 2) status = roll < 0.35 ? "done" : roll < 0.7 ? "in_progress" : "todo";
    else status = roll < 0.1 ? "done" : roll < 0.4 ? "in_progress" : "todo";

    const priority = random() < 0.25 ? "high" : random() < 0.6 ? "medium" : "low";
    const id = `task-${String(i + 1).padStart(3, "0")}`;

    const taskComments = [];
    const commentCount = Math.floor(random() * 3);
    for (let c = 0; c < commentCount; c++) {
      const author = c % 2 === 0 ? assignee : creator;
      taskComments.push({
        id: `${id}-c${c + 1}`,
        authorId: author.id,
        body: pick(comments),
        createdAt: daysFromToday(Math.min(createdOffset + 1 + c, 0), 10 + c),
      });
    }

    tasks.push({
      id,
      title,
      description,
      assigneeId: assignee.id,
      createdById: creator.id,
      departmentId,
      priority,
      status,
      dueDate: daysFromToday(dueOffset, 18),
      createdAt: daysFromToday(createdOffset, 9),
      // About a quarter of finished work lands a day or three late
      completedAt:
        status === "done"
          ? daysFromToday(Math.min(dueOffset + (random() < 0.25 ? 1 + Math.round(random() * 2) : -Math.round(random() * 2)), 0), 16)
          : null,
      comments: taskComments,
    });
  }

  // Older finished work so 30- and 90-day reports have a history to compare against
  for (let i = 0; i < 90; i++) {
    const [title, description, departmentId] = templates[(i * 7) % templates.length];
    const team = assignable.filter((e) => e.departmentId === departmentId && e.role === "staff");
    turns[departmentId] = (turns[departmentId] ?? -1) + 1;
    const pool = team.length ? team : assignable;
    const assignee = pool[turns[departmentId] % pool.length];
    const dueOffset = -22 - Math.round(random() * 110);
    const lateBy = random() < 0.2 ? 1 + Math.round(random() * 3) : -Math.round(random() * 2);
    tasks.push({
      id: `task-${String(tasks.length + 1).padStart(3, "0")}`,
      title,
      description,
      assigneeId: assignee.id,
      createdById: pick(admins).id,
      departmentId,
      priority: random() < 0.25 ? "high" : random() < 0.6 ? "medium" : "low",
      status: "done",
      dueDate: daysFromToday(dueOffset, 18),
      createdAt: daysFromToday(dueOffset - 4 - Math.round(random() * 8), 9),
      completedAt: daysFromToday(dueOffset + lateBy, 16),
      comments: [],
    });
  }

  // Give the demo staff account a realistic day: something overdue, due today and in progress
  const demo = employees.find((e) => e.id === "emp-03");
  if (demo) {
    const demoTasks = [
      ["Chase payment from Lotus Traders", "They promised payment last week. Call and confirm the transfer date.", -2, "in_progress", "high"],
      ["Visit Hilltop Stores for new order", "Take the new catalogue and the updated price list.", 0, "todo", "high"],
      ["Log this week's customer calls in the CRM", "Add notes for every call so the team can follow up.", 0, "in_progress", "medium"],
      ["Send samples to Blue Door Cafe", "Two of each new item, with the price sheet.", 1, "todo", "medium"],
      ["Prepare pitch for the hotel chain meeting", "Short deck: products, bulk pricing and delivery options.", 4, "todo", "low"],
    ];
    demoTasks.forEach(([title, description, dueOffset, status, priority], i) => {
      tasks.push({
        id: `task-${String(tasks.length + 1).padStart(3, "0")}`,
        title,
        description,
        assigneeId: demo.id,
        createdById: admins[i % admins.length].id,
        departmentId: demo.departmentId,
        priority,
        status,
        dueDate: daysFromToday(dueOffset, 18),
        createdAt: daysFromToday(dueOffset - 6, 9),
        completedAt: null,
        comments: [],
      });
    });
  }

  return tasks;
}
