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
