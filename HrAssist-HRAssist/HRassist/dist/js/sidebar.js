
    // Function to update the href attribute
    function updateHrefById(elementId, newHref) {
        var element = document.getElementById(elementId);
        if (element) {
            element.href = newHref;
        } else {
            console.error("Element with ID '" + elementId + "' not found.");
        }
    }
    // Update href for each anchor tag
updateHrefById('dashboard', 'admin_dashboard.html');
updateHrefById('addemployee', 'admin_201file_account.html');
updateHrefById('employeelist', 'admin_employee_registry_list.html');
updateHrefById('editemployee', 'admin_search_employee_view.html');
updateHrefById('searchemployee', 'admin_search_employee_view.html');
updateHrefById('applicantlist', 'admin_manage_applicant_view.html');
updateHrefById('addapplicant', 'admin_add_applicant.html');
updateHrefById('searchapplicant', 'admin_search_applicant.html');

// Update href for other anchor tags as needed
updateHrefById('employeePerformance', 'employee_performance.html');
updateHrefById('employeeIPCRF', 'admin-IPCRF-search.html');
updateHrefById('rewards', 'admin_rewards.html');
updateHrefById('trainingSeminar', 'admin_training_seminars.html');
updateHrefById('office', 'admin-offices.html');
updateHrefById('accounts', 'admin_accounts_view.html');
updateHrefById('calendar', 'calendar.html');
updateHrefById('leaveManagement', 'admin_leave_management.html');
updateHrefById('dtr', 'admin_dtr_form.html'); 
updateHrefById('LeaveCreditBtn', 'admin_dtr_form.html'); 
    

