import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail
} from "firebase/auth";

import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDocs, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { FetchCurrentUser } from './fetch_current_user.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);


export function FetchEmployeeInformation() {

  try {
    const TestcolRef = collection(db, 'User Account');

    const totalRequest = document.getElementById('totalRequest')

    FetchCurrentUser().then((currentUserUID) => {
      const que = query(TestcolRef, where("userID", "==", currentUserUID));

      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const id = doc.id;

          const accountDocID = data.documentID;

          if (data.UserLevel === "Employee") {

            // get the current employee data
            const EmployeecolRef = collection(db, 'Employee Information');
            const RequestcolRef = collection(db, 'Request Information');

            // data for employee
            fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
              const EmployeeData = dataRetrieved;

              // Construct a query to get documents where employeeDocID is equal to the current user's ID and RequestStatus is 'Pending'
              const pendingRequestsQuery = query(RequestcolRef,
                where("employeeDocID", "==", EmployeeData.documentID),
                where("RequestStatus", "==", "Pending")
              );

              getDocs(pendingRequestsQuery).then((querySnapshot) => {
                const hasPendingRequest = !querySnapshot.empty;
                const totalPendingRequests = querySnapshot.size;

                if (hasPendingRequest) {
                  // The current user has pending requests
                  totalRequest.innerHTML = totalPendingRequests
                  console.log("Current user has pending requests ", totalPendingRequests);
                } else {
                  // The current user does not have pending requests
                  console.log("Current user does not have pending requests");
                }

              }).catch((error) => {
                console.error("Error checking pending requests for the current user:", error);
              });


            })
          }

        });
      });
    });
  } catch {
    console.log("There was an error...")
  }
}

window.addEventListener('load', FetchEmployeeInformation)

