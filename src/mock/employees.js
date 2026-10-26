import { daysFromToday } from "./dates";

/** Every demo account signs in with this password. */
export const DEMO_PASSWORD = "orbinest";

export const DEMO_ACCOUNTS = {
  admin: "priya.raman@orbinest.app",
  staff: "arjun.mehta@orbinest.app",
};

const people = [
  ["Priya", "Raman", "admin", "Founder & Managing Director", "dep-ops", "active", -1460],
  ["Daniel", "Okafor", "admin", "Operations Manager", "dep-ops", "active", -980],
  ["Arjun", "Mehta", "staff", "Sales Executive", "dep-sales", "active", -420],
  ["Meera", "Nair", "staff", "Customer Support Lead", "dep-support", "active", -760],
  ["Sofia", "Alvarez", "staff", "Marketing Coordinator", "dep-marketing", "active", -300],
  ["Rahul", "Verma", "staff", "Accountant", "dep-finance", "active", -640],
  ["Aisha", "Khan", "staff", "Support Associate", "dep-support", "on_leave", -210],
  ["Kiran", "Rao", "staff", "Warehouse Supervisor", "dep-ops", "active", -1100],
  ["Lena", "Fischer", "staff", "Sales Executive", "dep-sales", "active", -150],
  ["Vikram", "Singh", "staff", "Delivery Coordinator", "dep-ops", "active", -520],
  ["Ananya", "Iyer", "staff", "Content Writer", "dep-marketing", "active", -95],
  ["Tomás", "Silva", "staff", "Support Associate", "dep-support", "active", -380],
  ["Fatima", "Sheikh", "staff", "Billing Specialist", "dep-finance", "active", -270],
  ["Rohan", "Das", "staff", "Inventory Associate", "dep-ops", "active", -60],
  ["Grace", "Lee", "staff", "Account Manager", "dep-sales", "on_leave", -890],
  ["Nikhil", "Joshi", "staff", "Sales Intern", "dep-sales", "active", -30],
  ["Divya", "Pillai", "staff", "Social Media Executive", "dep-marketing", "active", -180],
  ["Samuel", "Mensah", "staff", "Store Assistant", "dep-ops", "inactive", -700],
];

export function createEmployees() {
  return people.map(([firstName, lastName, role, jobTitle, departmentId, status, joinedOffset], i) => {
    const n = String(i + 1).padStart(2, "0");
    const digits = String(9845000000 + i * 1173571);
    return {
      id: `emp-${n}`,
      firstName,
      lastName,
      email: `${firstName}.${lastName}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") + "@orbinest.app",
      phone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      role,
      jobTitle,
      departmentId,
      status,
      joinedAt: daysFromToday(joinedOffset),
      location: i % 3 === 0 ? "Bengaluru" : i % 3 === 1 ? "Kochi" : "Remote",
    };
  });
}
