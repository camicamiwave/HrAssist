// add hovered class to selected list item
let list = document.querySelectorAll(".navigation li");

function activeLink() {
  list.forEach((item) => {
    item.classList.remove("hovered");
  });
  this.classList.add("hovered");
}

list.forEach((item) => item.addEventListener("mouseover", activeLink));

// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");

};

         /**
   * Prompt request form
   */

document.addEventListener('DOMContentLoaded', function() {
const requestLeaveButton = document.querySelector('.button1');
const leaveRequestForm = document.querySelector('.leave-request');
const requestLocatorButton = document.querySelector('.button2');
const locatorRequestForm = document.querySelector('.locator-request');

let leaveFormVisible = false;
let locatorFormVisible = false;

requestLeaveButton.addEventListener('click', function() {
  if (!leaveFormVisible) {
    leaveRequestForm.style.display = 'block';
    locatorRequestForm.style.display = 'none';
    leaveFormVisible = true;
    locatorFormVisible = false;
  } else {
    leaveRequestForm.style.display = 'none';
    leaveFormVisible = false;
  }
});

requestLocatorButton.addEventListener('click', function() {
  if (!locatorFormVisible) {
    locatorRequestForm.style.display = 'block';
    leaveRequestForm.style.display = 'none';
    locatorFormVisible = true;
    leaveFormVisible = false;
  } else {
    locatorRequestForm.style.display = 'none';
    locatorFormVisible = false;
  }
});

document.addEventListener('click', function(event) {
  if (!event.target.closest('.leave-request') && !event.target.closest('.button1')) {
    leaveRequestForm.style.display = 'none';
    leaveFormVisible = false;
  }
  if (!event.target.closest('.locator-request') && !event.target.closest('.button2')) {
    locatorRequestForm.style.display = 'none';
    locatorFormVisible = false;
  }
});
});
      
