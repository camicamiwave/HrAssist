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
import { UserLoginChecker } from './page_restriction.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()


export function SearchEmployee() {
    // Assuming you have an HTML form with id="employeeDataSheet"
    const SearchEmployeeForm = document.querySelector("#RewardsForm");
    const EmployeecolRef = collection(db, 'Employee Information');

    const searchbtn = document.getElementById('searchEmployeeBtn')

    const searchEmployeeFname = document.getElementById('searchEmployeeFname')
    const searchEmployeeMname = document.getElementById('searchEmployeeMname')
    const searchEmployeeLname = document.getElementById('searchEmployeeLname')
    const searchEmployeeExName = document.getElementById('searchEmployeeExName')

    // Event listener for the form submission
    searchbtn.addEventListener('click', (e) => {
        e.preventDefault();

        console.log("heheehe")

        const FirstName = searchEmployeeFname.value
        const MiddleName = searchEmployeeMname.value
        const LastName = searchEmployeeLname.value
        const ExtName = searchEmployeeExName.value

        console.log(`Fullname:${FirstName}${MiddleName}${LastName}${ExtName}`)

        try {

            const conditions = [
                where("Personal_Information.FirstName", "==", FirstName.trim()),
                where("Personal_Information.MiddleName", "==", MiddleName.trim()),
                where("Personal_Information.SurName", "==", LastName.trim())
            ];

            if (ExtName !== "") {
                conditions.push(where("Personal_Information.ExName", "==", ExtName.trim()));
            }

            const que = query(EmployeecolRef, ...conditions);

            // for retrieving the current user
            onSnapshot(que, (snapshot) => {
                if (!snapshot.empty) {
                    snapshot.docs.forEach((docData) => {
                        const data = docData.data();
                        const employeeDocID = data.documentID;

                        console.log(data);
                        alert("A record was retrieved.");
                        //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Assuming you want to add the employeeDocID to the URL without reloading
                        const url = `admin_add_Rewards.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);


                        SearchEmployeeForm.style.display = 'block'
                        searchbtn.style.display = 'none'

                    });
                } else {
                    alert("No record retrieved.");
                    console.log("No record retrieved.");
                }
            });


        } catch {

            alert("No record retrieved.");
        }

    })

}

window.addEventListener('load', SearchEmployee)


function fetchAppointment() {

    try {
        const EmployeecolRef = collection(db, '201File Information');
        const RewardscolRef = collection(db, 'Rewards Information');

        const RewardsForm = document.querySelector('#RewardsForm')
        const RewardsaveBtn = document.getElementById('RewardsaveBtn')

        const searchbtn = document.getElementById('searchEmployeeBtn')

        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');

        if (receivedStringData) {
            fetchEmployeeInfo(EmployeecolRef, receivedStringData, 'employeeDocID').then((dataRetrieved) => {
                const File201Data = dataRetrieved;

                RewardsForm.officeSelecor.value = File201Data.Appointment_Details.Office
                RewardsForm.designationSelecor.value = File201Data.Appointment_Details.PositionTitle

                RewardsaveBtn.addEventListener('click', (e) => {

                    const RewardsDetails = {
                        createdAt: serverTimestamp(),
                        employeeDocID: receivedStringData,
                        Rewards_Details: {
                            EmployeeDesignation: RewardsForm.designationSelecor.value,
                            EmployeeOffice: RewardsForm.officeSelecor.value,
                            DateIssued: RewardsForm.dateIssued.value,
                            Token: RewardsForm.tokenInput.value,
                            Description: RewardsForm.descriptionInput.value
                        }
                    }


                    Swal.fire({
                        title: "Are you sure?",
                        text: "Rewards will be saved on the system",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Confirm"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Add a document to the nested collection and get the document reference
                            return addDoc(RewardscolRef, RewardsDetails)
                                .then((docRef) => {
                                    const EmpcustomDocId = docRef.id;
                                    // Assuming downloadURLs is defined somewhere
                                    return setDoc(doc(RewardscolRef, EmpcustomDocId), { RewardsDocID: EmpcustomDocId }, { merge: true });

                                }).then(() => {
                                    Swal.fire({
                                        title: 'Saved successfully!',
                                        text: 'Rewards has been saved.',
                                        icon: 'success',
                                    });

                                    RewardsForm.reset()

                                    RewardsForm.style.display = 'none'
                                    searchbtn.style.display = 'block'


                                })
                                .catch((error) => {
                                    console.error('Error adding document:', error);
                                });

                        } else {
                            // If the user clicks "Cancel", return a resolved promise
                            return Promise.resolve();
                        }
                    }).catch((error) => {
                        console.error("Error occurred:", error);
                        // You can handle the error here, e.g., show a custom error message to the user
                        Swal.fire({
                            title: 'Error',
                            text: 'An error occurred while processing your transaction. Please try again.',
                            icon: 'error',
                        });
                    });
                })
            })
        }

    } catch {
        console.log("No employee appointment found...")
    }

}

window.addEventListener('load', fetchAppointment)




async function GetEmployeeTable() {

    const RewardscolRef = collection(db, 'Rewards Information');
    const EmployeecolRef = collection(db, 'Employee Information');
    const q = query(RewardscolRef, orderBy('createdAt'));

    try {
        const employeeTable = document.getElementById('RewardsTable');
        const tbody = employeeTable.querySelector('tbody');

        let num = 0;
  
      onSnapshot(q, async (snapshot) => {
        tbody.innerHTML = '';
  
        if (!snapshot.empty) {
          for (const doc of snapshot.docs) {
            const data = doc.data();
            const id = doc.id; 
  
            const EmployeeID = data.employeeDocID

  
            const row = document.createElement('tr');
  
            // Get designation from another collection
            try {
              const dataRetrieved = await fetchEmployeeInfo(EmployeecolRef, EmployeeID, "documentID");
  
              const idCell = document.createElement('td');
              idCell.textContent = num + 1;

            
               console.log(dataRetrieved, 'asfas')
  
              const retrievefullName = `${dataRetrieved.Personal_Information.FirstName} ${dataRetrieved.Personal_Information.SurName}`;
              
              const nameCell = document.createElement('td');
              nameCell.textContent = retrievefullName;
  
              //const officeCell = document.createElement('td');
              //officeCell.textContent = data.Rewards_Details.EmployeeOffice;
  
              const designationCell = document.createElement('td');
              designationCell.textContent = data.Rewards_Details.EmployeeDesignation;
  
              const tokenCell = document.createElement('td');
              tokenCell.textContent = data.Rewards_Details.Token

              const dataIssueCell = document.createElement('td');
              dataIssueCell.textContent = data.Rewards_Details.DateIssued
  
              const deleteButtonCell = document.createElement('td');
  
              const deleteButton = document.createElement('button');
              deleteButton.classList.add('btn', 'btn-primary');
  
              const deleteIcon = document.createElement('i');
              deleteIcon.classList.add('bx', 'bx-edit');
  
              // Add a click event listener to the delete button
              deleteButton.addEventListener('click', () => {
                console.log('Row ID clicked:', id);
  
                window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(dataRetrieved.documentID)}`;
  
              })
  
              deleteButton.appendChild(deleteIcon);
              deleteButtonCell.appendChild(deleteButton);
   
              row.appendChild(idCell);
              row.appendChild(nameCell);
              //row.appendChild(officeCell);
              row.appendChild(designationCell);
              row.appendChild(tokenCell);
              row.appendChild(dataIssueCell);
              row.appendChild(deleteButtonCell);
  
              tbody.appendChild(row);
  
              num++
            } catch (error) {
              console.error('Error fetching designation:', error);
            }
          }
        } else {
          const noRecordsRow = document.createElement('tr');
          const noRecordsCell = document.createElement('td');
          noRecordsCell.setAttribute('colspan', '7');
          noRecordsCell.textContent = 'No records found';
          noRecordsRow.appendChild(noRecordsCell);
          tbody.appendChild(noRecordsRow);
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  window.addEventListener('load', GetEmployeeTable);
  
  
