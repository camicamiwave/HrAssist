function openTab(tabName) {
    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }

    // Remove 'active-tab' class from all tabs
    var tabs = document.getElementsByClassName("tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("active-tab");
    }

    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";

    // Add 'active-tab' class to the selected tab
    event.currentTarget.classList.add("active-tab");
}