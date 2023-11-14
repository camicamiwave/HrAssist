function openTab(tabName) {
  // Hide all tabs
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
      tab.classList.remove('active');
  });

  // Show the selected tab
  var selectedTab = document.getElementById(tabName);
  selectedTab.classList.add('active');
}