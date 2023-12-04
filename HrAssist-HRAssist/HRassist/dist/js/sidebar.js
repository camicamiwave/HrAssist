
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
updateHrefById('editemployee', 'admin_edit_employee.html');
updateHrefById('searchemployee', 'admin_search_employee_view.html');
updateHrefById('applicantlist', 'admin_manage_applicant_view.html');
updateHrefById('addapplicant', 'admin_add_applicant.html');
updateHrefById('searchapplicant', 'admin_search_applicant.html');

// Update href for other anchor tags as needed
updateHrefById('employeePerformance', 'admin-employee-performance.html');
updateHrefById('employeeIPCRF', 'admin-IPCRF-search.html');
updateHrefById('rewards', 'admin-employee-reward.html');
updateHrefById('trainingSeminar', 'admin_training_n_seminars_view.html');
updateHrefById('office', 'admin-offices.html');
updateHrefById('accounts', 'admin_accounts_view.html');
updateHrefById('calendar1', 'calendar.html');
updateHrefById('leaveManagement', 'admin_request.html');
updateHrefById('dtr', 'admin_dtr_form.html'); 
updateHrefById('LeaveCreditBtn', 'admin_dtr_form.html'); 
    

