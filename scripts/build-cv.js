const fs = require("fs");
const path = require("path");

const NAVY = "0.063 0.137 0.235";
const GOLD = "0.776 0.631 0.353";
const INK = "0.12 0.2 0.3";
const MUTED = "0.33 0.42 0.52";
const WHITE = "1 1 1";

function esc(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

const ops = [];
function fill(x, y, w, h, color) {
  ops.push(`${color} rg ${x} ${y} ${w} ${h} re f`);
}
function text(x, y, size, font, color, value) {
  ops.push(`BT ${color} rg /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${esc(value)}) Tj ET`);
}

fill(0, 718, 612, 74, NAVY);
fill(0, 714, 612, 4, GOLD);
text(48, 758, 26, "F2", WHITE, "PIXELFORGE");
text(48, 734, 11, "F1", "0.86 0.91 0.96", "Software Engineer  |  Kumasi, Ghana");
text(360, 758, 11, "F2", WHITE, "+233 244 031 014");
text(360, 736, 11, "F2", WHITE, "+233 200 446 906");

let y = 688;
function heading(label) {
  text(48, y, 11, "F2", NAVY, label);
  y -= 7;
  fill(48, y, 42, 2.2, GOLD);
  y -= 18;
}
function line(value, size = 10.5, font = "F1", color = INK, gap = 14) {
  text(48, y, size, font, color, value);
  y -= gap;
}
function space(amount = 8) {
  y -= amount;
}

heading("PROFILE");
line("Software engineer in Kumasi, Ghana. I design and build websites, web applications,");
line("and product interfaces that feel clear, calm, and carefully made.");
space(2);
line("I partner with businesses that want a modern presence and software people enjoy");
line("using, from the first sketch through launch and the care that follows.");
space(10);

heading("CAPABILITIES");
line("-  Business websites and brand experiences");
line("-  Web applications, dashboards, and internal tools");
line("-  Interface design, interaction, and thoughtful motion");
line("-  APIs, data, and mobile-ready front ends");
space(10);

heading("SKILLS");
line("JavaScript, TypeScript, React, Next.js, Node.js, Python, PostgreSQL,");
line("HTML, CSS, UI/UX design, REST APIs, Git, Figma, Tailwind CSS");
space(10);

heading("EXPERIENCE");
line("Present  -  Software Engineer, PixelForge, Kumasi, Ghana", 11, "F2", NAVY, 16);
line("Design and engineer websites, web apps, and digital products. Lead the work from");
line("structure and interface through build, launch, and refinement.");
space(8);
line("Ongoing  -  Product engineering with client teams", 11, "F2", NAVY, 16);
line("Dashboards, commerce flows, booking tools, and marketing sites, with care for");
line("accessibility, speed, and code that other people can maintain.");
space(8);
line("Foundation  -  Software engineering and interface craft", 11, "F2", NAVY, 16);
line("Continuous study and hands-on practice across design, frontend engineering,");
line("and backend development, applied on real builds.");
space(10);

heading("SELECTED WORK");
line("Kente Market  -  Multi-vendor marketplace. React, Node.js, PostgreSQL", 10.5, "F1", INK, 14);
line("ClinicFlow  -  Clinic appointments and reminders. Next.js, PostgreSQL", 10.5, "F1", INK, 14);
line("Ashanti Ledger  -  Shop finance snapshot. TypeScript, React", 10.5, "F1", INK, 14);
line("Campus Nest  -  Student housing finder. React, Maps, Node.js", 10.5, "F1", INK, 14);
line("Adinkra Studio  -  Editorial brand website. HTML, CSS, JavaScript", 10.5, "F1", INK, 14);
line("SwiftHaul  -  Delivery tracking for local logistics. React, Node.js, SMS", 10.5, "F1", INK, 14);
space(12);

heading("WORKING TOGETHER");
line("Discover the real problem. Shape a calm interface. Build it properly.");
line("Stay close after launch.");
space(16);
fill(48, y, 160, 2, GOLD);
y -= 16;
line("Kumasi, Ghana  |  Available for freelance and product collaborations.", 10, "F1", MUTED, 14);

const stream = ops.join("\n");
const objects = [];
function addObject(body) {
  objects.push(body);
  return objects.length;
}

addObject("<< /Type /Catalog /Pages 2 0 R >>");
addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
addObject("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>");
addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

let pdf = "%PDF-1.4\n";
const offsets = [0];
objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${offsets.length}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i < offsets.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

const out = path.join(__dirname, "..", "assets", "PixelForge-CV.pdf");
fs.writeFileSync(out, pdf);
console.log(`Wrote ${out} (${pdf.length} bytes), content baseline ${y}`);
