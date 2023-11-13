const body = document.querySelector("body");
const darkLight = document.querySelector("#darkLight");
const sidebar = document.querySelector(".sidebar");
const submenuItems = document.querySelectorAll(".submenu_item");
const sidebarOpen = document.querySelector("#sidebarOpen");
const sidebarClose = document.querySelector(".collapse_sidebar");
const sidebarExpand = document.querySelector(".expand_sidebar");
const mainContent = document.querySelector("#main");

const dropdowns = document.querySelectorAll('.dropdown')

sidebarOpen.addEventListener("click", () => {
    sidebar.classList.toggle("close");
    mainContent.classList.toggle("close");
});

sidebarClose.addEventListener("click", () => {
    sidebar.classList.add("close", "hoverable");
    mainContent.classList.add("close");
});

sidebarExpand.addEventListener("click", () => {
    sidebar.classList.remove("close", "hoverable");
    sidebar.classList.add("expand");
    mainContent.classList.remove("close");
});

sidebar.addEventListener("mouseenter", () => {
    if (sidebar.classList.contains("hoverable")) {
        sidebar.classList.remove("close");
        mainContent.classList.remove("close");
    }
});

sidebar.addEventListener("mouseleave", () => {
    if (sidebar.classList.contains("hoverable") && !sidebar.classList.contains("expand")) {
        sidebar.classList.add("close");
        mainContent.classList.add("close");
    }
});

darkLight.addEventListener("click", () => {
    body.classList.toggle("dark");
    if (body.classList.contains("dark")) {
        darkLight.classList.replace("bx-sun", "bx-moon");
    } else {
        darkLight.classList.replace("bx-moon", "bx-sun");
    }
});

if (window.innerWidth < 768) {
    sidebar.classList.add("close");
    mainContent.classList.add("close");
} else {
    sidebar.classList.remove("close");
    mainContent.classList.remove("close");
}

// Loop through all dropdown elements
dropdowns.forEach(dropdown => {
    //Get inner elements from each dropdown
    const select = dropdown.querySelector('.select');
    const caret = dropdown.querySelector('.caret');
    const menu = dropdown.querySelector('.menu');
    const options = dropdown.querySelector('.menu li');
    const selected = dropdown.querySelector('.selected');
    
    //Add a click event to the select element
    select.addEventListener('click', () => {
        //Add the clicked select styles to the select element
        select.classList.toggle('select-clicked');
        //Add the rotate styles to the caret element
        caret.classList.toggle('caret=rotate');
        //add the open styles to the menu element
        menu.classList.toggle('menu-open');
    });

    //Loop through all option elements
    options/forEach(option => {
        //Add a click event to the option element
        option.addEventListener('click', () => {
            //Change selected inner text to clicked option inner text
            selected.innerText = option.innerText;
            //Add the clicked select styles to the select element
            select.classList.remove('select-clicked');
        })
    })
})

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