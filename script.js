// Constants
const DAYS_ORDER = ["M", "T", "W", "TH", "F", "S"];
const DAY_NAMES = {
  M: "Monday",
  T: "Tuesday",
  W: "Wednesday",
  TH: "Thursday",
  F: "Friday",
  S: "Saturday",
};

// Main function to generate the schedule
function generateSchedule() {
  const input = document.getElementById("courseInput").value;
  try {
    const courses = parseInput(input);
    renderSchedule(courses);
  } catch (error) {
    console.error("Error generating schedule:", error);
    alert("Invalid input format. Please check your data.");
  }
}

// Parse input into course objects
function parseInput(input) {
  return input.split("\n").map((line) => {
    const [code, name, section, units, days, times, locations] =
      line.split("\t");
    if (!code || !days || !times || !locations) {
      throw new Error("Missing required fields in input.");
    }
    return {
      code,
      name,
      section,
      units,
      days: days.split("/").map((d) => d.trim()),
      times: times.split("/").map((t) => t.trim()),
      locations: locations.split("/").map((l) => l.trim()),
    };
  });
}
// Render the schedule grid and courses
function renderSchedule(courses) {
  const scheduleDiv = document.getElementById("schedule");
  scheduleDiv.innerHTML = "";

  const schedule = document.createElement("div");
  schedule.className = "schedule";

  createTimeColumn(schedule);
  createDayHeaders(schedule);
  createCourseBlocks(schedule, courses);

  scheduleDiv.appendChild(schedule);
}

// Create the time column (7:00 AM to 8:00 PM)
function createTimeColumn(schedule) {
  let currentRow = 2;
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const time12 = formatTime12Hour(time24);
      const timeSlot = document.createElement("div");
      timeSlot.className = "time-slot time-column";
      timeSlot.textContent = time12;
      timeSlot.dataset.row = currentRow;
      schedule.appendChild(timeSlot);
      currentRow++;
    }
  }
}
// Create day headers (Monday to Saturday)
function createDayHeaders(schedule) {
  DAYS_ORDER.forEach((day, index) => {
    const header = document.createElement("div");
    header.className = "day-header";
    header.textContent = DAY_NAMES[day];
    header.style.gridColumn = index + 2;
    header.style.gridRow = "1";
    schedule.appendChild(header);
  });
}

// Create course blocks and position them on the grid
function createCourseBlocks(schedule, courses) {
  courses.forEach((course) => {
    course.days.forEach((day, index) => {
      const dayIndex = DAYS_ORDER.indexOf(day);
      if (dayIndex === -1) return;

      const [startTime, endTime] = course.times[index].split("-");
      const { startRow, endRow } = calculateGridPosition(startTime, endTime);

      const block = document.createElement("div");
      block.className = "course-block";
      block.style.gridColumn = dayIndex + 2;
      block.style.gridRow = `${startRow} / ${endRow}`;

      // Add hover interactions
      block.addEventListener("mouseenter", () => {
        const rows = block.style.gridRow.split(" / ").map(Number);
        document.querySelectorAll(".time-slot").forEach((slot) => {
          const slotRow = parseInt(slot.dataset.row);
          if (slotRow >= rows[0] && slotRow < rows[1]) {
            slot.classList.add("highlighted-time");
          }
        });
      });

      block.addEventListener("mouseleave", () => {
        document.querySelectorAll(".time-slot").forEach((slot) => {
          slot.classList.remove("highlighted-time");
        });
      });

      block.innerHTML = `
                <div class="course-code">${course.code}</div>
                <div class="course-name" style="font-size: 0.8em;">${
                  course.name
                }</div>
                <div class="course-time">${formatTime12Hour(
                  startTime
                )} - ${formatTime12Hour(endTime)}</div>
                <div class="course-location">${course.locations[index]}</div>
            `;

      schedule.appendChild(block);
    });
  });
} 

// Calculate grid position based on time
function calculateGridPosition(startTime, endTime) {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  const startMinutes = start.hours * 60 + start.minutes;
  const endMinutes = end.hours * 60 + end.minutes;

  // Each row represents 30 minutes starting from 7:00 AM (row 2)
  const startRow = Math.floor((startMinutes - 420) / 30) + 2;
  const endRow = Math.ceil((endMinutes - 420) / 30) + 2;

  return { startRow, endRow };
}

// Parse time in 24-hour format (e.g., "14:30")
function parseTime(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid time format: ${timeString}`);
  }
  return { hours, minutes };
}

function formatTime12Hour(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}
