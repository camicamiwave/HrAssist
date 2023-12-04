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


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');


export function fetchLeaveInfo(collectionReference, recievedDocumentID, nameOfData) {
    return new Promise((resolve) => {
  
  
      const Employeeque = query(collectionReference, where(nameOfData, "==", recievedDocumentID));

      onSnapshot(Employeeque, (snapshot) => {
        if (snapshot.empty) {
          // No documents matched the query
          resolve('None');
          // Handle the case when there are no matching documents
        } else {
          // Documents matched the query
          snapshot.docs.forEach((accountdocData) => {
            const data = accountdocData.data();
            resolve(data);
          });
        }
      });

    });
  }
  

function fetchTotalLeaveCredits(leaveCreditsCollectionRef, selectedYear){

    fetchLeaveInfo(leaveCreditsCollectionRef, selectedYear, "YearCovered").then((dataRetrieved) => {

        if (dataRetrieved !== "None"){
            const empdata = dataRetrieved;
            const file201DocID = empdata.documentID

            console.log(empdata)

            console.log(empdata.Leave_Credit['Study Leave'].RemainingUnits)

            vacationLeave.innerHTML = empdata.Leave_Credit['Vacation Leave'].RemainingUnits;
            sickLeave.innerHTML = empdata.Leave_Credit['Sick Leave'].RemainingUnits;
            mandatoryLeave.innerHTML = empdata.Leave_Credit['Mandatory/Forced Leave'].RemainingUnits;
            specialPrevilidgeLeave.innerHTML = empdata.Leave_Credit['Special Privilege Leave'].RemainingUnits;
            paternityLeave.innerHTML = empdata.Leave_Credit['Paternity Leave'].RemainingUnits;
            maternityLeave.innerHTML = empdata.Leave_Credit['Maternity Leave'].RemainingUnits;
            soloParentLeave.innerHTML = empdata.Leave_Credit['Solo Parent Leave'].RemainingUnits;
            studyLeave.innerHTML = empdata.Leave_Credit['Study Leave'].RemainingUnits;
            vawcLeave.innerHTML = empdata.Leave_Credit['10-Day VAWC Leave'].RemainingUnits;
            rehabilitationLeave.innerHTML = empdata.Leave_Credit['Rehabilitation Priviledge'].RemainingUnits;
            womenSpecialLeave.innerHTML = empdata.Leave_Credit['Special Leave Benefits for Women'].RemainingUnits;
            emergencyLeave.innerHTML = empdata.Leave_Credit['Special Emergency (Calamity) Leave'].RemainingUnits;


            if (empdata.Leave_Credit['Monetization Leave']){             
                monetizationLeave.innerHTML = empdata.Leave_Credit['Special Previlidge Leave'].RemainingUnits;
            } 
            if (empdata.Leave_Credit['Terminal Leave']) {
                terminalLeave.innerHTML = empdata.Leave_Credit['Terminal Leave'].RemainingUnits;
            } 
            if (empdata.Leave_Credit['Adoption Leave']){
                adoptionLeave.innerHTML = empdata.Leave_Credit['Special Previlidge Leave'].RemainingUnits;
            }    
        } else {
            

            vacationLeave.innerHTML = 0
            sickLeave.innerHTML = 0
            mandatoryLeave.innerHTML = 0
            specialPrevilidgeLeave.innerHTML = 0
            paternityLeave.innerHTML = 0
            maternityLeave.innerHTML = 0
            soloParentLeave.innerHTML = 0
            studyLeave.innerHTML = 0
            vawcLeave.innerHTML = 0
            rehabilitationLeave.innerHTML = 0
            womenSpecialLeave.innerHTML = 0
            emergencyLeave.innerHTML = 0


            if (empdata.Leave_Credit['Monetization Leave']){             
                monetizationLeave.innerHTML = 0
            } 
            if (empdata.Leave_Credit['Terminal Leave']) {
                terminalLeave.innerHTML = 0
            } 
            if (empdata.Leave_Credit['Adoption Leave']){
                adoptionLeave.innerHTML = 0
            }    


        }


        })

}

function fetchLeaveCredits() {
    const EmployeecolRef = collection(db, '201File Information'); 

    
    fetchLeaveInfo(EmployeecolRef, receivedStringData, "employeeDocID").then((dataRetrieved) => {
        const empdata1 = dataRetrieved;
        const file201DocID = empdata1.documentID
        
        const employeeDocumentRef = doc(EmployeecolRef, file201DocID);

        // Reference to the nested collection within the document
        const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');

        const yearSelector = document.getElementById('yearSelctor');

        yearSelector.addEventListener('change', function() {
          const selectedYear = yearSelector.value;
          console.log(selectedYear, 'asfsaf');

          fetchTotalLeaveCredits(leaveCreditsCollectionRef, selectedYear)
        });

        fetchTotalLeaveCredits(leaveCreditsCollectionRef, yearSelector.value)

    })
}

window.addEventListener('load', fetchLeaveCredits)

