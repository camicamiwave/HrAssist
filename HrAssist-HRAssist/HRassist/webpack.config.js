const path = require('path');

module.exports = {
    mode: 'development',
    entry: {
        main: './src/server.js', 
        auth: './src/auth.js', 
        cloud_storage: './src/cloud.js', 
        firestore_storage: './src/firestore.js', 
        firestore_add: './src/add_firestore.js',
        firestore_retrieve: './src/retrieve_firestore.js',
        page_verification: './src/page_restriction.js',
        login_authentication: './src/login_auth.js', 
        request_proc: './src/request_process.js', 
        employee_registry: './src/employee_registry.js',
        applicant_registry: './src/applicant_registry.js',
        admin_registry: './src/admin_registry.js',
        navbar: './src/navbar.js',
        fetch_current_user: './src/fetch_current_user.js',
        PDS: './src/PDS.js',
        job_registry: './src/job_registry.js',
        employee_interface: './src/employee_interface.js',
        employee_signin: './src/employee_signin.js',
        employee_appointment: './src/employee_appointment.js',
        file201: './src/201file.js',
        fetch_employee_info: './src/fetch_employee_info.js',
        employee_attachments: './src/employee_attachments.js',
        employee_leavecredit: './src/employee_leavecredit.js',
        signout_account: './src/signout_account.js'
        
    },
    output: {
        path: path.resolve(__dirname, 'dist/bundles'),
        filename: '[name].bundle.js',
    },
    watch: true,
};
