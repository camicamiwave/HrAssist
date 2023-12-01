const calendar = document.querySelector(".calendar"),
  date = document.querySelector(".date"),
  daysContainer = document.querySelector(".days"),
  prev = document.querySelector(".prev"),
  next = document.querySelector(".next"),
  todayBtn = document.querySelector(".btnToday"),
  gotoBtn = document.querySelector(".btnGo"),
  dateInput = document.querySelector(".date-input"),
  eventDay = document.querySelector(".event-day"),
  eventDate = document.querySelector(".event-date"),
  eventsContainer = document.querySelector(".events"),
  addEventBtn = document.querySelector(".add-event"),
  addEventWrapper = document.querySelector(".add-event-wrapper "),
  addEventCloseBtn = document.querySelector(".close "),
  addEventTitle = document.querySelector(".event-name "),
  addEventFrom = document.querySelector(".event-time-from "),
  addEventTo = document.querySelector(".event-time-to "),
  addEventSubmit = document.querySelector(".add-event-btn ");

let today = new Date();
let activeDay;
let month = today.getMonth();
let year = today.getFullYear();

const months = [
"January",
"February",
"March",
"April",
"May",
"June",
"July",
"August",
"September",
"October",
"November",
"December",
];

//function to add days 
function initCalendar() {
    //Get prev Month days, Current month days and remainings Next month days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const prevDays = prevLastDay.getDate();
    const lastDate = lastDay.getDate();
    const day = firstDay.getDay();
    const nextDays = 7 - lastDay.getDay() - 1;

    //update current date on top of calendar
    date.innerHTML = months[month] + " " + year;

    //adding days
    let days = "";

    //prev month days
    for (let x = day; x > 0; x--) {
        days += `<div class="day prev-date">${prevDays - x + 1}</div>`;
    }

    //current month days
    for (let i = 1; i <= lastDate; i++) {
        if (
            i === new Date().getDate() &&
            year === new Date().getFullYear() &&
            month === new Date().getMonth()
          ) {
            days += `<div class="day today">${i}</div>`;
          }
          else {
            days += `<div class="day">${i}</div>`;
          }
    }

    for (let j = 1; j <= nextDays; j++) {
        days += `<div class="day next-date">${j}</div>`;
    }
    daysContainer.innerHTML = days;
}    

//function to add month and year on prev button
function prevMonth() {
    month--;
    if (month < 0) {
      month = 11;
      year--;
    }
    initCalendar();
}

//function to add month and year on next button
function nextMonth() {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    initCalendar();
}

prev.addEventListener("click", prevMonth);
next.addEventListener("click", nextMonth);
initCalendar();

//function Today button
todayBtn.addEventListener("click", () => {
    today = new Date();
    month = today.getMonth();
    year = today.getFullYear();
    initCalendar();
});

//function Date Textbox
dateInput.addEventListener("input", (e) => {
    dateInput.value = dateInput.value.replace(/[^0-9/]/g, "");
    if (dateInput.value.length === 2) {
      dateInput.value += "/";
    }
    if (dateInput.value.length > 7) {
      dateInput.value = dateInput.value.slice(0, 7);
    }
    if (e.inputType === "deleteContentBackward") {
      if (dateInput.value.length === 3) {
        dateInput.value = dateInput.value.slice(0, 2);
      }
    }
});

gotoBtn.addEventListener("click", gotoDate);

//function to go entered Date
function gotoDate() {
  console.log("here");
  const dateArr = dateInput.value.split("/");
  if (dateArr.length === 2) {
    if (dateArr[0] > 0 && dateArr[0] < 13 && dateArr[1].length === 4) {
      month = dateArr[0] - 1;
      year = dateArr[1];
      initCalendar();
      return;
    }
  }
  alert("Invalid Date");
}

// function for the modal add Event form
document.getElementById('btnAddEvent').addEventListener('click', 
function(){
    document.querySelector('.bg-modal').style.display = 'flex';
});

document.querySelector('.close').addEventListener('click', 
function(){
    document.querySelector('.bg-modal').style.display = 'none';
});

// function for the dropdown menu

// Get all dropdowns
var dropdowns = document.querySelectorAll('.dropdown');

// Add click event listener to each dropdown
dropdowns.forEach(function (dropdown) {
    var input = dropdown.querySelector('.selected');
    var menu = dropdown.querySelector('.menu');

    // Toggle dropdown menu visibility
    input.addEventListener('click', function () {
        menu.classList.toggle('show');
    });

    // Close the dropdown menu if the user clicks outside of it
    window.addEventListener('click', function (event) {
        if (!event.target.matches('.dropdown')) {
            var openDropdown = document.querySelector('.menu.show');
            if (openDropdown && !openDropdown.contains(event.target)) {
                openDropdown.classList.remove('show');
            }
        }
    });

    // Set the selected option
    var options = menu.querySelectorAll('li');
    options.forEach(function (option) {
        option.addEventListener('click', function () {
            input.value = option.textContent;
            menu.classList.remove('show');
        });
    });
});
