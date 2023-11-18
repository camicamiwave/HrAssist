const body = document.querySelector("body");
const darkLight = document.querySelector("#darkLight");
const sidebar = document.querySelector(".sidebar");
const submenuItems = document.querySelectorAll(".submenu_item");
const sidebarOpen = document.querySelector("#sidebarOpen");
const sidebarClose = document.querySelector(".collapse_sidebar");
const sidebarExpand = document.querySelector(".expand_sidebar");
const mainContent = document.querySelector("#main");

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


let uploadButton = document.getElementById("upload-button");
let chosenImage = document.getElementById("chosen-image");
let fileName = document.getElementById("file-name");

uploadButton.onchange = () => {
    let reader = new FileReader();
    reader.readAsDataURL(uploadButton.files[0]);
    reader.onload = () => {
        chosenImage.setAttribute("src",reader.result);
    }
    fileName.textContent = uploadButton.files[0].name;
}
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