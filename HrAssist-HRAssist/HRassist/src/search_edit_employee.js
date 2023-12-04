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
  const SearchEmployeeForm = document.querySelector("#SearchEmployeeForm");
  const EmployeecolRef = collection(db, 'Employee Information');

  // Event listener for the form submission
  SearchEmployeeForm.addEventListener('submit', (e) => {
    e.preventDefault();


    const LastName = SearchEmployeeForm.inputLastName.value
    const FirstName = SearchEmployeeForm.inputFirstName.value
    const MiddleName = SearchEmployeeForm.inputMiddleName.value
    const ExtName = SearchEmployeeForm.inputExtName.value

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
            window.location.href = `admin_201file_account.html?data=${encodeURIComponent(employeeDocID)}`;
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


