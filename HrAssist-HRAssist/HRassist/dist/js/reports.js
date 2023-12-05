function openTab(tabName) {
    // Hide all tab content
    var tabs = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].style.display = "none";
    }
  
    // Deactivate all tabs
    var tabButtons = document.getElementsByClassName("tab");
    for (var i = 0; i < tabButtons.length; i++) {
      tabButtons[i].style.backgroundColor = "";
    }
  
    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";
  
    // Activate the clicked tab
    event.currentTarget.style.backgroundColor = "#068e6b";
  }
   // Function to redirect to applicantprof.html
   function redirectToApplicantProf() {
    window.location.href = 'Applicant Profile/applicantprof.html';
}
