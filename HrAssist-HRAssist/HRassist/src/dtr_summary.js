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
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);


function SearchDTR() {

    const DTR_Section = document.getElementById('tableSectionDTRSummary');    
    const searchDTRBtn = document.getElementById('searchDTRBtn');

    const EmployeecolRef = collection(db, 'DTR Summary');

    searchDTRBtn.addEventListener('click', (e) => {

        const monthSelector = document.getElementById('monthSelector').value;
        const yearSelctor = document.getElementById('yearSelctor').value;
        const inputOffice = document.getElementById('inputOffice').value;
        const weekSelctor = document.getElementById('weekSelctor').value;

        try {

            if (monthSelector !== "--- Select Month ---" && yearSelctor !== "--- Select Year ---" && inputOffice !== "--- Select Office ---"&& weekSelctor !== "--- Select Year ---"){
                const conditions = [
                    where("ForTheMonth", "==", monthSelector.trim()),
                    where("ForTheYear", "==", yearSelctor.trim()),
                    where("ForTheWeek", "==", weekSelctor.trim()),
                    where("Office", "==", inputOffice.trim())
                ];
    
                const que = query(EmployeecolRef, ...conditions);
    
                // for retrieving the current user
                onSnapshot(que, (snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.docs.forEach((docData) => {
                            const data = docData.data();
                            const employeeDocID = data.documentID;
    
                            console.log(data);
                            alert("A record was retrieved.");
    
                            // Assuming you want to add the employeeDocID to the URL without reloading
                            const url = `admin_dtr_summary.html?data=${encodeURIComponent(employeeDocID)}`;
    
                            // Use pushState to update the URL
                            window.history.pushState({ path: url }, '', url); 
                            //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;

                            
                        });
                    } else {
                        //alert("No record retrieved.");
                        console.log("No record retrieved.");

                        Swal.fire({
                            title: "No record found",
                            text: "Do you want to create record for this week?",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm"
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // If the user clicks "Confirm"
                                //return addDoc(DTRcolRef, dtrDetails);
                                
                                DTR_Section.style.display = 'block';
                            } else {
                                // If the user clicks "Cancel", return a resolved promise
                                //return Promise.resolve();
                            }
                        }).then((docRef) => {
                            if (docRef) {
                                ReturnDocumentID(docRef);
                                Swal.fire({
                                    title: 'Congratulations!',
                                    text: 'Monthly DTR Record saved successfully.',
                                    icon: 'success',
                                });
                                console.log('Monthly DTR Record saved successfully...');
                                
                            }
                            
                        }).catch((error) => {
                            console.error("Error occurred:", error);
                            // You can handle the error here, e.g., show a custom error message to the user
                            Swal.fire({
                                title: 'Error',
                                text: 'An error occurred while processing your the DTR.s Please try again.',
                                icon: 'error',
                            });
                        });


                    }
                });
    

            } else {
                alert("Please provide required fields")
            }
            
        } catch {
            console.log("There was an error...")
        }

    })

}

window.addEventListener('load', SearchDTR)



export function SaveEmployeeDTR(dtrDetails) {
    const DTRcolRef = collection(db, 'DTR Information');

    Swal.fire({
        title: "Are you sure?",
        text: "Monthly DTR will be saved on the system",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm"
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Confirm"
            return addDoc(DTRcolRef, dtrDetails);
        } else {
            // If the user clicks "Cancel", return a resolved promise
            return Promise.resolve();
        }
    }).then((docRef) => {
        if (docRef) {
            ReturnDocumentID(docRef);
            Swal.fire({
                title: 'Congratulations!',
                text: 'Monthly DTR saved successfully.',
                icon: 'success',
            });
            console.log('Monthly DTR saved successfully...');
        }
    }).catch((error) => {
        console.error("Error occurred:", error);
        // You can handle the error here, e.g., show a custom error message to the user
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your the DTR.s Please try again.',
            icon: 'error',
        });
    });


}

function ReturnDocumentID(docRef) {
    const DTRcolRef = collection(db, 'DTR Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(DTRcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}


function CheckDTRRecord() {
    try {
        const dtrCheckRecordBtn = document.getElementById('dtrCheckRecordBtn');
        const DTRcolRef = collection(db, 'DTR Information');

        dtrCheckRecordBtn.addEventListener('click', (e) => {
            const urlParams = new URLSearchParams(window.location.search);
            const receivedStringData = urlParams.get('data');

            const monthSelector = document.getElementById('monthSelector').value;
            const yearSelctor = document.getElementById('yearSelctor').value;

            try {

                const conditions = [
                    where("Month", "==", monthSelector.trim()),
                    where("Year", "==", yearSelctor.trim()),
                    where("employeeDocID", "==", receivedStringData.trim())
                ];


                const que = query(DTRcolRef, ...conditions);

                // for retrieving the current user
                onSnapshot(que, (snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.docs.forEach((docData) => {
                            const data = docData.data();
                            const dtrID = data.documentID;

                            // Assuming you want to add the employeeDocID to the URL without reloading
                            const url = `admin_dtr_form.html?data=${encodeURIComponent(receivedStringData)}&dtrID=${dtrID}`;

                            // Use pushState to update the URL
                            window.history.pushState({ path: url }, '', url);
                            //dtrCheckRecordBtn.style.display = 'none';

                            const DtrDetails = {
                                DTRTotalTardy: data.Tardy_Details.TotalTimesTardy,
                                DTRTotalHoursTardy: data.Tardy_Details.HoursTary,
                                DTRTotalMinsTardy: data.Tardy_Details.MinsTardy,
                                DTRTotalTimesUndertime: data.Undertime_Details.TotalTimesUndertime,
                                DTRTotalHoursUndertime: data.Undertime_Details.HoursUndertime,
                                DTRTotalMinsUndertime: data.Undertime_Details.MinsUndertime
                            }

                            DTRDetailsDisplayer(DtrDetails)
                            displayExistingData(data.dtrData)



                            alert("DTR record was retrieved.");

                        });
                    } else {
                        alert("No record retrieved.");
                        setDefaultValues()
                        console.log("No record retrieved.");
                    }
                });


            } catch {

                alert("No record retrieved.");
            }



        })


    } catch {
        console.log("No DTR record detected...")
    }
}

window.addEventListener('load', CheckDTRRecord)


function fetchOfficeDesignation() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));
  
    const inputOffice = document.getElementById('inputOffice');
    inputOffice.innerHTML = '<option>--- Select Office ---</option>';
   
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
  
    // Add an event listener to detect changes in selection
    inputOffice.addEventListener('change', function () {
      // Get the selected value of the selector
      const selectedValue = inputOffice.value;
  
      if (selectedValue) {
        // Log or use the selected value
        console.log(selectedValue); 
  
        fetchEmployeeInfo(OfficecolRef, selectedValue, "OfficeName").then((dataRetrieved) => {
          const designationData = dataRetrieved;
  
          const positionSelector = document.getElementById('positionSelector');
          positionSelector.innerHTML = '<option>Select</option>';
  
          // getting data of designation
          const designationCollectionRef = collection(db, 'Office Information', designationData.officeDocumentID, 'Designations'); 
          const designationQue = query(designationCollectionRef)
  
          onSnapshot(designationQue, (snapshot) => {
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const id = doc.id;
        
              // Create an option element for each OfficeName and append it to the selector
              const optionElement = document.createElement('option');
              optionElement.value = data.DesignationName;
              optionElement.textContent = data.DesignationName;
              positionSelector.appendChild(optionElement);
            });
          });
        })
      } else {
        console.log("None")
      }
    });
  }
  
  window.addEventListener('load', fetchOfficeDesignation);
  


