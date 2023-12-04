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
    getDoc, updateDoc, setDoc, getDocs
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);

const urlParams = new URLSearchParams(window.location.search);
const receivedOfficeID = urlParams.get('officeID');

function addOffice() {

    try {
        const addOfficeBtn = document.getElementById('addOfficeBtn')
        const officeForm = document.querySelector('#organizationChartForm')

        const OfficecolRef = collection(db, 'Office Information');

        addOfficeBtn.addEventListener('click', (e) => {

            const designationName = officeForm.designationName.value.trim()
            const descriptionText = officeForm.descriptionText.value.trim()
            const headOfOffice = officeForm.headOfOffice

            const designationDetails = {
                DesignationName: designationName,
                Description: descriptionText,
                createdAt: serverTimestamp()
            };

            if (headOfOffice.checked) {
                designationDetails['HeadOfOffice'] = true
            }

            const employeeDocumentRef = doc(OfficecolRef, receivedOfficeID);

            const designationCollectionRef = collection(employeeDocumentRef, 'Designations');

            // Pange check ng record
            const checkIfValueExists = async (collectionRef, fieldName, targetValue) => {
                try {
                    const querySnapshot = await getDocs(query(collectionRef, where(fieldName, '==', targetValue)));

                    return !querySnapshot.empty; // true kung meron nang dokumento na may ganoong value, false kung wala
                } catch (error) {
                    console.error('Error checking value in Firestore:', error);
                    throw error;
                }
            };

            checkIfValueExists(designationCollectionRef, 'DesignationName', designationName)
                .then((exists) => {
                    if (exists) {
                        alert("Designation name existed")
                    } else {
                        if (designationName != '') {
                            
                            FetchDesignatedNumData().then((maxID) => { 
                                const totalDesignated = maxID + 1;

                                ReturnDocumentID(receivedOfficeID, totalDesignated)
                            
                            })

                            addDoc(designationCollectionRef, designationDetails)
                                .then(docRef => {
                                    const documentId = docRef.id;
                                    return setDoc(doc(designationCollectionRef, documentId), { designationDocumentID: documentId }, { merge: true });
                                }).then(() => {
                                    alert("Designation saved successfully...")
                                    officeForm.reset()
                                })
                                .catch(error => {
                                    console.error('Error adding document: ', error);
                                });

                        } else {
                            alert('Designation name is required.')
                        }
                    }
                })
                .catch((error) => {
                    console.error('Error checking value:', error);
                });


        });
    } catch {

    }
}

window.addEventListener('load', addOffice)





function fetchOfficeEmployee() {

    const OfficecolRef = collection(db, 'Office Information');

    const officeNameLabel = document.getElementById('officeNameLabel');
    const officeNameSpan = document.getElementById('officeNameSpan');


    fetchEmployeeInfo(OfficecolRef, receivedOfficeID, "officeDocumentID").then((dataRetrieved) => {
        const employeeInfo = dataRetrieved;

        officeNameLabel.innerHTML = employeeInfo.OfficeName
        officeNameSpan.innerHTML = employeeInfo.OfficeName

    })
    
    const employeeDocumentRef = doc(OfficecolRef, receivedOfficeID);
    const designationCollectionRef = collection(employeeDocumentRef, 'Designations');

    const desigquery = query(designationCollectionRef, orderBy('createdAt'))

    const employeeTable = document.getElementById('organizationTable');
    const tbody = employeeTable.querySelector('tbody');

    onSnapshot(desigquery, (snapshot) => {
        // Clear the existing rows in the table body
        tbody.innerHTML = '';

        if (!snapshot.empty) {
            snapshot.docs.forEach((docu, index) => {
                const data = docu.data();
                const id = docu.id;
    
                const row = document.createElement('tr');
    
                const idCell = document.createElement('td');
                idCell.textContent = index + 1;
    
                const designationNameCell = document.createElement('td');
                designationNameCell.textContent = data.DesignationName;
    
                const headOfOfficeCell = document.createElement('td');
                headOfOfficeCell.textContent = data.HeadOfOffice;
    
                const deleteButtonCell = document.createElement('td');
    
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger');
    
                const deleteIcon = document.createElement('i');
                deleteIcon.classList.add('bx', 'bx-trash');

                // Add a click event listener to the delete button
                deleteButton.addEventListener('click', () => {
                    // Move the Swal.fire confirmation inside the event listener
                    Swal.fire({
                        title: "Are you sure?",
                        text: "You won't be able to revert this!",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, delete it!"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your file has been deleted.",
                                icon: "success"
                            }).then(() => {
                                // Access the 'id' when the button is clicked
                                console.log('Delete button clicked for ID:', id);
    
                                const designationCollectionRef = collection(db, 'Office Information', receivedOfficeID, 'Designations');
                                const docRef = doc(designationCollectionRef, id);

                                    
                                FetchDesignatedNumData().then((maxID) => { 
                                    const totalDesignated = maxID - 1;
                                    
                                    ReturnDocumentID(receivedOfficeID, totalDesignated)
                                
                                })

                                deleteDoc(docRef)
                                    .then(() => {
                                        console.log('Document successfully deleted!');
                                    })
                                    .catch((error) => {
                                        console.error('Error deleting document: ', error);
                                    });
                            });
                        }
                    });
                });
    
                deleteButton.appendChild(deleteIcon);
                deleteButtonCell.appendChild(deleteButton);    

                // Append cells to the row 
                row.appendChild(idCell);
                row.appendChild(designationNameCell);
                row.appendChild(headOfOfficeCell);
                row.appendChild(deleteButtonCell);

                // Append the row to the table body
                tbody.appendChild(row);
            });
        } else {
            // If there are no records, display a message
            const noRecordsRow = document.createElement('tr');
            const noRecordsCell = document.createElement('td');
            noRecordsCell.setAttribute('colspan', '4'); // Adjust the colspan based on the number of columns in your table
            noRecordsCell.textContent = 'No records found';
            noRecordsRow.appendChild(noRecordsCell);
            tbody.appendChild(noRecordsRow);
        }
    });

}

window.addEventListener('load', fetchOfficeEmployee)


function ReturnDocumentID(receivedOffice, maxID) {

    const designationCollectionRef = collection(db, 'Office Information'); 
    
    const totalDesignated = maxID

    return setDoc(doc(designationCollectionRef, receivedOffice), { TotalDesignated: totalDesignated }, { merge: true });
    
}



export function FetchDesignatedNumData() {
    return new Promise((resolve, reject) => {
      const TestcolRef = collection(db, 'Office Information');
      const querySnapshot = query(TestcolRef);
  
      onSnapshot(querySnapshot, (snapshot) => {
        let maxApplicantIDNum = 0;
  
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const designationNum = data.TotalDesignated;
          
          if (designationNum > maxApplicantIDNum) {
            maxApplicantIDNum = designationNum;
          }
        });
  
        resolve(maxApplicantIDNum);
      });
    });
  }
  




function Test() {
    test123()
}

window.addEventListener('load', Test)


