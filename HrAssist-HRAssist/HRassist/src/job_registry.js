import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import {
    getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
    createUserWithEmailAndPassword, updateProfile
} from "firebase/auth";

import {
    getFirestore, collection, onSnapshot,
    addDoc, deleteDoc, doc,
    query, where,
    orderBy, serverTimestamp,
    getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { FetchCurrentUser } from './fetch_current_user.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const auth = getAuth();

const storage = getStorage(app);


function AddApplicantForm() {

    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);
    // Get the values of the customDocId and id parameters
    const jobDetailsURL = urlParams.get('id');


    console.log(jobDetailsURL, 'hello')

    const JobcolRef = collection(db, 'Applicant Information');

    let customDocId;

    const btnId = document.getElementById("inputJobSubmit")

    const addApplicantForm = document.querySelector("#applicant_info_form")

    let applicantCurrentMaxID;
    let userUID;

    FetchCurrentUser().then((currentUserUID) => {
        userUID = currentUserUID;

        const que = query(TestcolRef, where("userID", "==", userUID));
    })

    FetchApplicantIDData().then((maxID) => {
        applicantCurrentMaxID = maxID
    })

    addApplicantForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const applicantID = applicantCurrentMaxID + 1;

        const applicantJobForm = {
            ApplicantStatus: "Pending",
            ApplicationProgess: 1,
            ApplicantID: applicantID,
            createdAt: serverTimestamp(),
            ApplicantStatus: "Pending",
            userID: userUID,
            jobDetailsURL: jobDetailsURL,
            ApplicantID: applicantID,
            Personal_Information: {
                FirstName: addApplicantForm.inputFirstName.value,
                MiddleName: addApplicantForm.inputMiddleName.value,
                LastName: addApplicantForm.inputLastName.value,
                ExName: addApplicantForm.inputExName.value,
                Gender: addApplicantForm.gender.value,
                CivilStatus: addApplicantForm.inputState.value,
                Birthdate: addApplicantForm.birthday.value,
                PlaceBirth: addApplicantForm.inputplacebirth.value,
                Phone: addApplicantForm.phone.value,
                Email: addApplicantForm.inputemail.value,
                Address: addApplicantForm.inputaddress.value,
                Message: addApplicantForm.message.value
            }
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Job details will be saved",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Saved!",
                    text: "Your job details added successfully...",
                    icon: "success"
                }).then(() => {
                    // Add data to Firestore
                    return addDoc(JobcolRef, applicantJobForm);
                }).then((docRef) => {
                    customDocId = docRef.id;
                    // Update the document with the custom ID
                    return setDoc(doc(JobcolRef, customDocId), { documentID: customDocId }, { merge: true });
                }).then(() => {
                    const storageRef = ref(storage, "Applicant/Profile");

                    // Access the file input field
                    const fileInput = document.getElementById('applicantPic');
                    const selectedFiles = fileInput.files;
                    const firstSelectedFile = selectedFiles[0];  // Access the first file

                    // Generate a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    // Upload the file to Firebase Storage
                    return uploadBytes(fileRef, firstSelectedFile);
                }).then((snapshot) => {
                    // File upload completed successfully
                    const fileRef = snapshot.ref;

                    // Get the download URL
                    return getDownloadURL(fileRef);
                }).then((downloadURL) => {
                    // Update Firestore document with the download URL
                    console.log(downloadURL);
                    return setDoc(doc(JobcolRef, customDocId), { ProfilePicURL: downloadURL }, { merge: true });
                }).then(() => {
                    const storageRef = ref(storage, "Applicant/Profile");

                    // Access the file input field
                    const fileInput = document.getElementById('cvFile');
                    const selectedFiles = fileInput.files;
                    const firstSelectedFile = selectedFiles[0];  // Access the first file

                    // Generate a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    // Upload the file to Firebase Storage
                    return uploadBytes(fileRef, firstSelectedFile);
                }).then((snapshot) => {
                    // File upload completed successfully
                    const fileRef = snapshot.ref;

                    // Get the download URL
                    return getDownloadURL(fileRef);
                }).then((downloadURL) => {
                    // Update Firestore document with the download URL
                    console.log(downloadURL);
                    return setDoc(doc(JobcolRef, customDocId), { CVURL: downloadURL }, { merge: true });
                })

                    .catch((error) => {
                        // Handle any errors that occurred during the process
                        console.error("Error:", error);
                    })
                    .then(() => {
                        console.log("hereee: ", customDocId)
                        // Reset the form
                        //addDataSheetForm.reset();
                        console.log("Added job details successfully...");
                        //window.location.href = 'Education-21Files.html';
                        //window.location.href = `applicant-congrats.html`;
                        window.location.href = `applicant-congrats.html?customDocId=${encodeURIComponent(customDocId)}`;
                    })
                    .catch(error => console.error('Error adding job details document:', error));
            }
        });



    })

}

window.addEventListener('load', AddApplicantForm)


function Test() {
    const JobcolRef = collection(db, 'Job Information');

    let customDocId;

    const btnId = document.getElementById("inputJobVacancySubmitBtn")


    btnId.addEventListener('click', (e) => {
        e.preventDefault();


        const jobDetailsData = {
            createdAt: serverTimestamp(),
            JobStatus: 'Ongoing',
            JobTitle: document.getElementById("inputJobTitle").value,
            JobType: document.getElementById("inputJobType").value,
            SalaryAmount: document.getElementById("inputSalaryAmount").value,
            DueDate: document.getElementById("inputDate").value,
            JobDesc: document.getElementById("inputJobDesc").value,
            JobRes: document.getElementById("inputJobResponsibility").value,
            Qualification: document.getElementById("inputJobQuality").value,
            NumVacancy: document.getElementById("inputJobVacancy").value,
            Office: document.getElementById("officeSelector").value,
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Job details will be saved",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Saved!",
                    text: "Your job details added successfully...",
                    icon: "success"
                }).then(() => {
                    // Add data to Firestore
                    return addDoc(JobcolRef, jobDetailsData);
                }).then((docRef) => {
                    customDocId = docRef.id;
                    // Update the document with the custom ID
                    return setDoc(doc(JobcolRef, customDocId), { documentID: customDocId }, { merge: true });
                })/*.then(() => {
                    const storageRef = ref(storage, "Job Hiring/Logo");

                    // Access the file input field
                    const fileInput = document.getElementById('inputJobLogo');
                    const selectedFiles = fileInput.files;
                    const firstSelectedFile = selectedFiles[0];  // Access the first file

                    // Generate a unique filename using timestamp
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    // Upload the file to Firebase Storage
                    return uploadBytes(fileRef, firstSelectedFile);
                }).then((snapshot) => {
                    // File upload completed successfully
                    const fileRef = snapshot.ref;

                    // Get the download URL
                    return getDownloadURL(fileRef);
                }).then((downloadURL) => {
                    // Update Firestore document with the download URL
                    console.log(downloadURL);
                    return setDoc(doc(JobcolRef, customDocId), { JobLogo: downloadURL }, { merge: true });
                }).catch((error) => {
                    // Handle any errors that occurred during the process
                    console.error("Error:", error);
                })*/
                    .then(() => {
                        // Add a delay of 3 seconds before redirecting
                        setTimeout(() => {
                            window.location.href = `admin_job_vacancy_view.html?data=${encodeURIComponent(customDocId)}`;
                        }, 3000);

                    })
                    .catch(error => console.error('Error adding job details document:', error));
            }
        });



    })

}
window.addEventListener('load', Test)



window.addEventListener('load', () => {
    FetchCurrentUser().then((result) => {
        if (result) {
            console.log(result, "oh");
        } else {
            console.log("This page is for admin only.")
        }
    });
});


export function FetchApplicantIDData() {
    return new Promise((resolve, reject) => {
        const TestcolRef = collection(db, 'Applicant Information');
        const querySnapshot = query(TestcolRef);

        onSnapshot(querySnapshot, (snapshot) => {
            let maxApplicantIDNum = 0;

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const applicantIDNum = data.ApplicantID;

                if (applicantIDNum > maxApplicantIDNum) {
                    maxApplicantIDNum = applicantIDNum;
                }
            });

            resolve(maxApplicantIDNum);
        });
    });
}


// This section is for applicant hiring index.html
export function fetchApplicantHiring() {
    console.log("Hello")
    const jobInfoContainer = document.getElementById('tab-1'); // Assuming you have a container element in your HTML

    const colRef = collection(db, 'Job Information');
    //const q = query(colRef, orderBy('createdAt'));
    const q = query(colRef);

    onSnapshot(q, (snapshot) => {
        // Clear the existing content in the container
        jobInfoContainer.innerHTML = '';

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // Create the job item div
            const jobItemDiv = document.createElement('div');
            jobItemDiv.classList.add('job-item', 'p-4', 'mb-4');

            // Populate the job item div with data
            jobItemDiv.innerHTML = `
                <div class="row g-4">
                    <div class="col-sm-12 col-md-8 d-flex align-items-center">
                        <img class="flex-shrink-0 img-fluid border rounded" src="img/favicon.png" alt="" style="width: 80px; height: 80px;">
                        <div class="text-start ps-4">
                            <h5 class="mb-3" id="HiringJobTitleLabel">${data.JobTitle}</h5>
                            <span class="text-truncate me-3"><i class="fa fa-map-marker-alt text-primary me-2"></i>${data.Office}</span>
                            <span class="text-truncate me-3"><i class="far fa-clock text-primary me-2"></i>${data.JobType}</span>
                            <span class="text-truncate me-0"><i class="far fa-money-bill-alt text-primary me-2"></i>${data.SalaryAmount}</span>
                        </div>
                    </div>
                    <div class="col-sm-12 col-md-4 d-flex flex-column align-items-start align-items-md-end justify-content-center">
                        <div class="d-flex mb-3">
                            <a class="btn btn-light btn-square me-3" href=""><i class="far fa-heart text-primary"></i></a>
                            <a class="btn btn-primary apply-now" data-customdocid="${encodeURIComponent(data.documentID)}" data-id="${id}" href="#">Apply Now</a>
                        </div>
                        <small class="text-truncate"><i class="far fa-calendar-alt text-primary me-2"></i>Date Line: ${data.DueDate}</small>
                    </div>
                </div>
            `;

            // Append the job item div to the container
            jobInfoContainer.appendChild(jobItemDiv);
        });
        // Add event listener for "Apply Now" links
        document.querySelectorAll('.apply-now').forEach(link => {
            link.addEventListener('click', handleApplyNowClick);
        });
    });
}

// Handle click event for "Apply Now" links
function handleApplyNowClick(event) {
    event.preventDefault(); // Prevent the default behavior of the link

    const customDocId = event.target.getAttribute('data-customdocid');
    const id = event.target.getAttribute('data-id');

    // Log information about the clicked button
    console.log(`Button clicked with customDocId: ${customDocId}, id: ${id}`);

    // Redirect to the new URL with the customDocId and id as query parameters
    window.location.href = `job-detail-1.html?customDocId=${encodeURIComponent(customDocId)}&id=${id}`;
}

window.addEventListener('load', fetchApplicantHiring)

export function fetchJobDetails() {
    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);

    // Get the values of the customDocId and id parameters
    const customDocId = urlParams.get('customDocId');
    const id = urlParams.get('id');

    // Log or use the retrieved values
    console.log(`Custom Doc ID: ${customDocId}`);
    console.log(`ID: ${id}`);

    // Retrieve data
    const colRef = collection(db, 'Job Information');
    //const q = query(colRef, orderBy('createdAt')); 
    const que = query(colRef, where("documentID", "==", customDocId))

    const jobTitleText = document.getElementById("JobTitleLabel")
    const jobLocationText = document.getElementById("JobLocationLabel")
    const jobTypeText = document.getElementById("JobTypeLabel")
    const jobSalaryText = document.getElementById("JobSalaryLabel")
    const jobDescText = document.getElementById("JobDescLabel")
    const jobRespText = document.getElementById("JobRespLabel")
    const jobQualiText = document.getElementById("JobQualification")
    const jobLogoImg = document.getElementById("JobLogo")


    const jobCreatedText = document.getElementById("CreatedLabel")
    const jobPositioniText = document.getElementById("JobPositionLabel")
    const jobNatureText = document.getElementById("JobNatureLabel")
    const jobSalaryText1 = document.getElementById("JobSalaryLabel")
    const jobLocationText1 = document.getElementById("JobLocationLabel")
    const jobDueDateText = document.getElementById("JobDueDateLabel")


    const ApplyNowBtn = document.getElementById('Apply_Now_Btn')


    onSnapshot(que, (snapshot) => {

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            jobTitleText.innerHTML = data.JobTitle
            //jobLocationText.innerHTML = data.JobLocation
            jobTypeText.innerHTML = data.JobType
            jobSalaryText.innerHTML = data.SalaryAmount
            jobDescText.innerHTML = data.JobDesc
            jobRespText.innerHTML = data.JobRes
            jobQualiText.innerHTML = data.Qualification


            const timestamp = data.createdAt.toDate();

            // Format the date and time
            const formattedDate = timestamp.toLocaleDateString('en-US');
            const formattedTime = timestamp.toLocaleTimeString('en-US');

            jobCreatedText.innerHTML = formattedDate
            jobPositioniText.innerHTML = data.JobTitle
            jobNatureText.innerHTML = data.JobType
            jobSalaryText1.innerHTML = data.SalaryAmount
            //jobLocationText1.innerHTML = data.JobLocation
            jobDueDateText.innerHTML = data.DueDate


            ApplyNowBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log("hehehe")


                FetchCurrentUser().then((result) => {
                    if (result !== "None") {
                        console.log(result)
                        // Redirect to the new URL with the customDocId and id as query parameters
                        window.location.href = `job_form.html?customDocId=${encodeURIComponent(data.customDocId)}&id=${id}`;
                    } else {
                        window.location.href = `applicant-create.html`;
                    }
                });


                // Redirect to the new URL with the customDocId and id as query parameters
                //window.location.href = `job_form.html?customDocId=${encodeURIComponent(data.customDocId)}&id=${id}`;

            })


        })
    })



}


window.addEventListener('load', fetchJobDetails)



// ----------------------> get job vacancy table


async function GetJobVacancyTable() {
    try {

        const jobcolRef = collection(db, 'Job Information')

        const q = query(jobcolRef, orderBy('createdAt'))

        // Assuming you have Firestore data in the 'employees' array
        const employeeTable = document.getElementById('jobVacancyTable');
        const tbody = employeeTable.querySelector('tbody');

        let idNum = 1;

        onSnapshot(q, (snapshot) => {
            // Clear the existing rows in the table body
            tbody.innerHTML = '';

            snapshot.docs.forEach((jobdoc) => {
                const data = jobdoc.data();
                const id = jobdoc.id;
                const row = document.createElement('tr');

                const idCell = document.createElement('td');
                idCell.textContent = idNum;

                const jobTitle = document.createElement('td');
                jobTitle.textContent = data.JobTitle;

                const jobType = document.createElement('td');
                jobType.textContent = data.JobType;

                const office = document.createElement('td');
                office.textContent = data.Office;
                const salary = document.createElement('td');
                salary.textContent = data.SalaryAmount;

                const jobPositionCell = document.createElement('td');
                jobPositionCell.textContent = data.DueDate;

                const jobVacancyCell = document.createElement('td');
                jobVacancyCell.textContent = data.NumVacancy;


                const jobStatusCell = document.createElement('td');
                jobStatusCell.textContent = data.JobStatus;

                // Create a single cell for both buttons
                const buttonsCell = document.createElement('td');

                // Create activation and deactivation buttons with classes
                const editButton = createButton('Edit', 'editJob');
                editButton.classList.add('btn', 'btn-primary');

                // Add click event listeners to the buttons
                editButton.addEventListener('click', () => {
                    // Implement activation logic here 
                    //alert(`Activate clicked for ID: ${data.JobTitle}`); 
                    //idNum = 1;

                    window.location.href = `admin_add_job.html?jobVacancyID=${encodeURIComponent(id)}`;

                    /*
                    const OfficeValue = document.getElementById("officeSelector");

                    inputJobTitle.value = data.JobTitle
                    inputSalaryAmount.value = data.SalaryAmount
                    inputDate.value = data.DueDate
                    inputJobVacancy.value = data.NumVacancy
                    OfficeValue.value = data.Office
                    inputJobDesc.value = data.JobDesc
                    inputJobResponsibility.value = data.JobRes
                    inputJobQuality.value = data.Qualification
                    applicationStatus.value = data.JobStatus 

                    $('#exampleModalCenter').modal('show');


                    updateBtn.addEventListener('click', (e) => { 
                     
                        const jobDetailsData = {
                            createdAt: serverTimestamp(),
                            JobStatus: document.getElementById('applicationStatus').value,
                            JobTitle: document.getElementById("inputJobTitle").value,
                            JobType: document.getElementById("inputJobType").value,
                            SalaryAmount: document.getElementById("inputSalaryAmount").value,
                            DueDate: document.getElementById("inputDate").value,
                            JobDesc: document.getElementById("inputJobDesc").value,
                            JobRes: document.getElementById("inputJobResponsibility").value,
                            Qualification: document.getElementById("inputJobQuality").value,
                            NumVacancy: document.getElementById("inputJobVacancy").value,
                            Office: document.getElementById("officeSelector").value, 
                        }
 
                        Swal.fire({
                            title: "Are you sure?",
                            text: "Your update will be recorded",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: "Saved!",
                                    text: "Update successfully...",
                                    icon: "success"
                                }).then(() => {
                                    // Add data to Firestore                        
                                    return setDoc(doc(jobcolRef, id), { jobDetailsData }, { merge: true }); 
                                }).then(() => { 
                                        // Reset the form
                                        //addDataSheetForm.reset();
                                        console.log("Added job details successfully...");
                                        //window.location.href = 'Education-21Files.html';
                                        window.location.href = `admin_job_vacancy_view.html`;
                                    })
                                    .catch(error => console.error('Error adding job details document:', error));
                            }
                        });
                

                    })*/

                });

                const deleteButton = createButton('Delete', 'deleteJob');
                deleteButton.classList.add('btn', 'btn-danger');

                deleteButton.addEventListener('click', () => {
                    // Implement deactivation logic here
                    //alert(`Activate clicked for ID: ${id}`);

                    $('#deleteModal').modal('show');

                    closeBtn.addEventListener('click', (e) => {
                        $('#deleteModal').modal('hide');
                    })

                    const deleteButtonModal = document.getElementById('deleteBtnModal')

                    deleteButtonModal.addEventListener('click', async (e) => {
                        console.log('asgsgs')
                        Swal.fire({
                            title: "Are you sure?",
                            text: "Record will be deleted",
                            icon: "info",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Yes, delete it"
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: "Saved!",
                                    text: "Deleted successfully...",
                                    icon: "success"
                                }).then(async () => {
                                    try {
                                        // Replace "cities" and "DC" with your actual collection name and document ID
                                        await deleteDoc(doc(jobcolRef, id));

                                        $('#deleteModal').modal('hide');
                                    } catch {
                                        alert("There's an error while deleting the record...");
                                    }
                                });
                            }
                        });
                    });




                });

                // Append buttons to the cell
                buttonsCell.appendChild(editButton);
                buttonsCell.appendChild(deleteButton);

                // Add cells to the row
                row.appendChild(idCell);
                row.appendChild(jobTitle);
                row.appendChild(jobType);
                row.appendChild(office);
                row.appendChild(salary);
                row.appendChild(jobVacancyCell);
                row.appendChild(jobPositionCell);
                row.appendChild(jobStatusCell);
                row.appendChild(buttonsCell); // Append the cell with buttons

                // Append the row to the table body
                tbody.appendChild(row);

                idNum++;
            });
        });
    } catch (error) {
        console.log('Error:', error.message);
    }
}

// Helper function to create a button with text and class
function createButton(text, className) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(className);
    button.style.color = '#fff';
    button.style.width = '60px';
    button.style.fontSize = '12px'
    return button;
}

window.addEventListener('load', GetJobVacancyTable);


function officeSelector() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));

    const inputOffice = document.getElementById('officeSelector');
    inputOffice.innerHTML = '<option>Select</option>';

    onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // Create an option element for each OfficeName and append it to the selector
            const optionElement = document.createElement('option');
            optionElement.value = data.OfficeName;
            optionElement.textContent = data.OfficeName;
            inputOffice.appendChild(optionElement);
        });
    });
}

window.addEventListener('load', officeSelector);


function JobVacancyFormPopulate() {
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('jobVacancyID');

    const TrainingColRef = collection(db, 'Job Information');

    try {
 
            fetchEmployeeInfo(TrainingColRef, receivedStringData, "documentID").then((dataRetrieved) => {
                const data = dataRetrieved;
        
                console.log(data)
        
                const officeSelected = document.getElementById('officeSelector')
        
                if (data !== "none") {
        
                    inputJobVacancySubmitBtn.style.display = 'none'
                    updateJob.style.display = 'block'
        
        
        
                    inputJobTitle.value = data.JobTitle
                    inputSalaryAmount.value = data.SalaryAmount
                    inputDate.value = data.DueDate
                    inputJobVacancy.value = data.NumVacancy
                    inputJobType.value = data.JobType
                    officeSelected.value = data.Office
                    inputJobDesc.value = data.JobDesc
                    inputJobResponsibility.value = data.JobRes
                    inputJobQuality.value = data.Qualification
                    applicationStatus.value = data.JobStatus
        
                    updateJob.addEventListener('click', (e) => {
        
                        const jobDetailsData = {
                            createdAt: serverTimestamp(),
                            JobStatus: document.getElementById('applicationStatus').value,
                            JobTitle: document.getElementById("inputJobTitle").value,
                            JobType: document.getElementById("inputJobType").value,
                            SalaryAmount: document.getElementById("inputSalaryAmount").value,
                            DueDate: document.getElementById("inputDate").value,
                            JobDesc: document.getElementById("inputJobDesc").value,
                            JobRes: document.getElementById("inputJobResponsibility").value,
                            Qualification: document.getElementById("inputJobQuality").value,
                            NumVacancy: document.getElementById("inputJobVacancy").value,
                            Office: document.getElementById("officeSelector").value,
                        };
        
                        Swal.fire({
                            title: "Are you sure?",
                            text: "Your update will be recorded",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    title: "Saved!",
                                    text: "Update successfully...",
                                    icon: "success",
                                    timer: 2000, // Set the timer in milliseconds (2 seconds in this example)
                                    showConfirmButton: false
                                }).then(() => {
                                    const jobcolRef = collection(db, 'Job Information');
                                    const docRef = doc(jobcolRef, receivedStringData);
        
                                    // Update data in Firestore                        
                                    return updateDoc(docRef, jobDetailsData)
                                        .then(() => {
                                            // Reset the form if needed
                                            // addDataSheetForm.reset();
        
                                            console.log("Updated job details successfully...");
        
                                            // Redirect after the specified delay
                                            setTimeout(() => {
                                                window.location.href = 'admin_job_vacancy_view.html';
                                            }, 2000); // Set the delay in milliseconds (2 seconds in this example)
                                        })
                                        .catch(error => console.error('Error updating job details document:', error));
                                });
                            }
                        });
        
        
                    })
        
                }
        
        
            })
        
    
    

    } catch {
        console.log("there was an error...")
    }


}
window.addEventListener('load', JobVacancyFormPopulate);

