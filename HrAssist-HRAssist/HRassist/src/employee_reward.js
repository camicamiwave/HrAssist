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
import { fetchEmployeeInfo } from './fetch_employee_info.js';


// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore();
 

const auth = getAuth();

const storage = getStorage(app);

function fetchOfficeDesignation() {
    const officeColRef = collection(db, 'Office Information');
    const employeeColRef = collection(db, 'Employee Information');
    const file201ColRef = collection(db, '201File Information');

    const que = query(officeColRef, orderBy('createdAt'));

    const inputOffice = document.getElementById('officeSelecor');
    const positionSelector = document.getElementById('positionSelector');
    const employeeNameSelector = document.getElementById('employeeName');

    inputOffice.innerHTML = '<option>--- Select Office ---</option>';
    positionSelector.innerHTML = '<option>Select</option>';
    employeeNameSelector.innerHTML = '<option>Select</option>';

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

    // Add an event listener to detect changes in the office selection
    inputOffice.addEventListener('change', function () {
        const selectedOffice = inputOffice.value;

        if (selectedOffice) {
            fetchEmployeeInfo(officeColRef, selectedOffice, 'OfficeName')
                .then((dataRetrieved) => {
                    const designationData = dataRetrieved;

                    // Fetch and populate designations
                    const designationCollectionRef = collection(db, 'Office Information', designationData.officeDocumentID, 'Designations');
                    const designationQue = query(designationCollectionRef);

                    positionSelector.innerHTML = '<option>Select</option>';
                    employeeNameSelector.innerHTML = '<option>Select</option>';

                    onSnapshot(designationQue, (snapshot) => {
                        snapshot.docs.forEach((doc) => {
                            const data = doc.data();
                            const id = doc.id;

                            // Create an option element for each DesignationName and append it to the selector
                            const optionElement = document.createElement('option');
                            optionElement.value = data.DesignationName;
                            optionElement.textContent = data.DesignationName;
                            positionSelector.appendChild(optionElement);
                        });
                    });
                })
                .catch((error) => {
                    console.error('Error fetching office information:', error);
                });
        } else {
            console.log('No office selected');
        }
    });

    // Add an event listener to detect changes in the position selection
    positionSelector.addEventListener('change', function () {
        const selectedOffice = inputOffice.value;
        const selectedDesignation = positionSelector.value;

        if (selectedOffice && selectedDesignation) {
            
            fetchEmployeeInfo(file201ColRef, selectedOffice, 'Appointment_Details.Office')
                .then((dataRetrieved) => {
                    const appointmentData = dataRetrieved;
                    const appointmentDocumentID = appointmentData.employeeDocID


                    console.log(appointmentData, 'agss124w')
 
                            
                    fetchEmployeeInfo(employeeColRef, appointmentDocumentID, 'documentID')
                    .then((dataRetrieved) => {
                        const employeeData = dataRetrieved;
                        const employeeDocumentID = employeeData.documentID

                        console.log(employeeData, 'agss')
 
                        employeeNameSelector.innerHTML = '<option>--- Select ---</option>';
                        
                        const fullName = `${employeeData.Personal_Information.FirstName} ${employeeData.Personal_Information.MiddleName} ${employeeData.Personal_Information.SurName}`


                        const optionElement = document.createElement('option');
                        optionElement.value = fullName;
                        optionElement.textContent = fullName;
                        employeeNameSelector.appendChild(optionElement);

                    })         

                })
                .catch((error) => {
                    console.error('Error fetching office information:', error);
                });
        } else {
            console.log('No office or position selected');
        }
    });
}

// Call the function to initialize the selectors
fetchOfficeDesignation();





function AddReward() {
    const CalendarcolRef = collection(db, 'Reward Information');
    document.getElementById('addrewardbtn').addEventListener('click', () => {

        if (validateForm()) {

            const leaveFormData = {
                createdAt: serverTimestamp(),
                Reward_Details: {
                    Office: document.getElementById('officeSelecor').value.trim(),
                    Designation: document.getElementById('positionSelector').value.trim(),
                    FullName: document.getElementById('employeeName').value.trim(),
                    DateIssued: document.getElementById('dateIssued').value.trim(),
                    Reward: document.getElementById('rewardText').value.trim(),
                    Description: document.getElementById('descriptionText').value.trim(),
                    Reason: document.getElementById('reasonText').value.trim(),
                }
            };
    
    
            Swal.fire({
                title: 'Are you sure?',
                text: 'Employee will be recognized',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
            }).then((result) => {
                if (result.isConfirmed) {
                    return addDoc(CalendarcolRef, leaveFormData);
                } else {
                    return Promise.reject(new Error('User canceled'));
                }
            }).then((docRef) => {
                ReturnDocumentID(docRef) 
    
                Swal.fire({
                    title: 'Reward Added!',
                    text: "Employee's has been saved.",
                    icon: 'success',
                })
                    .then(() => {
                        const calendarForm = document.querySelector('#addrewardform')
                        calendarForm.reset()
                        // Redirect to the dashboard page
                        //window.location.href = `admin-employee-reward.html?data=${encodeURIComponent(docRef.id)}`;
                    });
            }).catch((error) => {
                if (error.message !== 'User canceled') {
                    console.error('Error occurred:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'An error occurred while processing your request. Please try again.',
                        icon: 'error',
                    });
                }
            });

        } else {
            console.log("Error");
        }

       
    });
}



function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Reward Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}


window.addEventListener('load', AddReward);



function fetchReward() {
    const IPCRFcolRef = collection(db, 'Reward Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const Employee201colRef = collection(db, '201File Information');
    const tableBody = document.getElementById('rewardTable').getElementsByTagName('tbody')[0];

    console.log("hello")

    const que = query(IPCRFcolRef, orderBy('createdAt'));


    onSnapshot(que, (snapshot) => {
        // Clear existing rows
        tableBody.innerHTML = '';

        let num = 1;

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const employeeID = data.employeeDocID;

            // Create a new row
            const row = tableBody.insertRow();

            // Create cells and set values
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            const cell3 = row.insertCell(2);
            const cell4 = row.insertCell(3);
            const cell5 = row.insertCell(4); 
            const cell6 = row.insertCell(5); 
            const cell7 = row.insertCell(6); 

            cell1.textContent = num;
            cell2.textContent = data.Reward_Details.FullName;
            cell3.textContent = data.Reward_Details.Office;
            cell4.textContent = data.Reward_Details.Designation;
            cell5.textContent = data.Reward_Details.DateIssued;
            cell6.textContent = data.Reward_Details.Reward;  

            const viewButton = document.createElement('button');
            const deleteButton = document.createElement('button');

            
            deleteButton.textContent = `Delete`;
            deleteButton.className = 'btn btn-danger';
            deleteButton.id = `viewbtn${num}`;
            deleteButton.type = 'button'
            deleteButton.style.height = '30%'
            deleteButton.style.fontSize = '12px'

            viewButton.textContent = `Edit`;
            viewButton.className = 'btn btn-primary';
            viewButton.id = `viewbtn${num}`;
            viewButton.type = 'button'
            viewButton.style.fontSize = '12px'
            viewButton.style.height = '30%'
            viewButton.style.marginRight = '3px'

            // Add an event listener to the button
            viewButton.addEventListener('click', function () {
                // Get the row index (subtracting 1 because row index starts from 0)
                const rowIndex = this.id.replace('viewbtn', '') - 1;

                // Get the data for the clicked row
                const clickedRowData = snapshot.docs[rowIndex].data();
 
                // Log or process the data as needed
                alert('Clicked row data:', clickedRowData);
 
            })

            // Add an event listener to the button
            deleteButton.addEventListener('click', function () {
                // Get the row index (subtracting 1 because row index starts from 0)
                const rowIndex = this.id.replace('viewbtn', '') - 1;

                // Get the data for the clicked row
                const clickedRowData = snapshot.docs[rowIndex].data();

                // Log or process the data as needed
                console.log('Clicked row data:', clickedRowData.documentID);

                
                Swal.fire({
                    title: "Are you sure?",
                    text: "Employee's locator slip will be lost",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Confirm"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // If the user clicks "Confirm"
                        console.log('Row ID clicked:', clickedRowData.documentID);
                                                 
                        const colRef = collection(db, 'Reward Information')

                        const docRef = doc(colRef, clickedRowData.documentID)

                        deleteDoc(docRef)
                            .then(() => {
                                Swal.fire({
                                    title: 'Deleted Successfully!',
                                    text: 'Reward has been deleted.',
                                    icon: 'success',
                                });
                            })

                    } else {
                        // Handle the case where the user cancels the action
                    }
                });

            })


            cell7.appendChild(viewButton);
            cell7.appendChild(deleteButton);
 
            num++;
        });
    });
}



// Call the fetchIPCRF function when the window is loaded
window.addEventListener('load', fetchReward);

function validateForm() {


    var OfficeSelector = document.getElementById('officeSelecor');
    var PositionSelector = document.getElementById('positionSelector');
    var EmployeeNameInput = document.getElementById('employeeName');
    var DateIssuedInput = document.getElementById('dateIssued');
    var RewardInput = document.getElementById('rewardText');
    var ReasonInput = document.getElementById('reasonText');
    var DescriptionInput = document.getElementById('descriptionText');
 
   
       if (OfficeSelector.value === '--- Select Office ---') {
           console.log('Please select an Office!');
           Swal.fire({
               title: 'Error',
               text: 'Please select an Office!',
               icon: 'error',
           });
           return false;
       }
   
       if (PositionSelector.value === 'Select') {
         console.log('Please select a position!');
         Swal.fire({
             title: 'Error',
             text: 'Please select a position!',
             icon: 'error',
         });
         return false;
     }

     if (EmployeeNameInput.value === '--- Select ---') {
        console.log('Please choose an employee!');
        Swal.fire({
            title: 'Error',
            text: 'Please choose an employee!',
            icon: 'error',
        });
        return false;
    }

    if (DateIssuedInput.value === '') {
        console.log('Please input a date');
        Swal.fire({
            title: 'Error',
            text: 'Please input a date!',
            icon: 'error',
        });
        return false;
    }

    if (!isValidString(RewardInput.value)) {
        console.log('Please fix your input in Rewards');
        Swal.fire({
            title: 'Error',
            text: 'Please fix your input in Rewards!',
            icon: 'error',
        });
        return false;
    }

    if (!isValidString(ReasonInput.value)) {
        console.log('Please fix your input in Reasons');
        Swal.fire({
            title: 'Error',
            text: 'Please fix your input in Reasons!',
            icon: 'error',
        });
        return false;
    }
   

       return true;
     
     
       
   }
   
   
   function isValidString(value) {
   
     return /^[a-zA-Z\s]*$/.test(value.trim());
   }
   
   function isValidNumber(value) {
   
     return /^[0-9]+$/.test(value.trim());
   }