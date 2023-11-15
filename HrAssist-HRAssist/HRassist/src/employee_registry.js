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

const colRef = collection(db, 'Applicant Information')

const q = query(colRef, orderBy('createdAt'))

const auth = getAuth();

const storage = getStorage(app);


function GetEmployeeTable() {
    // Assuming you have Firestore data in the 'employees' array
    const employeeTable = document.getElementById('employeeTable');
    const tbody = employeeTable.querySelector('tbody');

    onSnapshot(q, (snapshot) => {
      // Clear the existing rows in the table body
      tbody.innerHTML = '';

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;
        const row = document.createElement('tr');

        // Create and populate table cells
        // Create an image element
        const imageElement = document.createElement('img');

        // Set the src attribute to the image URL
        imageElement.src = "https://firebasestorage.googleapis.com/v0/b/hrassist-lgusanvicente.appspot.com/o/Applicant%2FRequirements%2F1699720150322_bcert.png?alt=media&token=31d4f8c5-a4f2-4070-b104-624f27975f63";
        
        // Append the image element to the table cell
        const profileCell = document.createElement('td');
        profileCell.appendChild(imageElement);

        const idCell = document.createElement('td');
        idCell.textContent = id;

        const nameCell = document.createElement('td');
        nameCell.textContent = data.username;

        const jobPositionCell = document.createElement('td');
        jobPositionCell.textContent = data.userRole;

        const officeCell = document.createElement('td');
        officeCell.textContent = data.username;

        const genderCell = document.createElement('td');
        genderCell.textContent = data.username;

        const jobTitleCell = document.createElement('td');
        jobTitleCell.textContent = data.email;

        // Add a click event listener to the row
        row.addEventListener('click', () => {
            console.log('Row ID clicked:', id);
        });

        // Append cells to the row
        row.appendChild(profileCell);
        row.appendChild(idCell);
        row.appendChild(nameCell);
        row.appendChild(jobPositionCell);
        row.appendChild(officeCell);
        row.appendChild(genderCell);
        row.appendChild(jobTitleCell); 

        // Append the row to the table body
        tbody.appendChild(row);
      });
    });
  }


window.addEventListener('load', GetEmployeeTable);

function FetchUserLevel(){

}
export function AddEmployeeDataSheet() {
  
  const TestcolRef = collection(db, 'User Account');
  const EmployeecolRef = collection(db, 'Employee Information');
  const storageRef = ref(storage, "Employee/Requirements");

  // Assuming you have an HTML form with id="employeeDataSheet"
  const addDataSheetForm = document.querySelector("#employeeDataSheet"); 

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const currentUser = user;
      const userId = user.uid;

      // Assuming there's a 'userID' field in your 'User Account' collection
      const que = query(TestcolRef, where("userID", "==", userId));

      onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((docData) => {
          const data = docData.data();
          const id = docData.id;

          console.log(data, 'hello');
          
          // Make sure the user is an admin before proceeding
          // For example, check if data.UserLevel === "Admin"
          if (data.UserLevel === "Admin") {
            console.log("User is an admin...");

            // Event listener for the form submission
            addDataSheetForm.addEventListener('submit', (e) => {
              e.preventDefault();

              // Access the file input field
              const fileInput = document.getElementById('fileInput');
              const selectedFiles = fileInput.files;  
              const firstSelectedFile = selectedFiles[0];  // Access the first file

              // Generate a unique filename using timestamp
              const timestamp = new Date().getTime();
              const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
              const fileRef = ref(storageRef, uniqueFilename);

              // Upload the file to Firebase Storage
              const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
                .then((snapshot) => getDownloadURL(fileRef))
                .then((downloadURL) => {
                  // Prepare data for Firestore
                  const employeeData = {
                    userID: user.uid,
                    UserLevel: "Employee", 
                    createdAt: serverTimestamp(), 
                    ProfilePictureURL: downloadURL, 
                    Personal_Information: {
                      // Add other fields based on your form
                      CSCID: addDataSheetForm.inputCsId.value,
                      FirstName: addDataSheetForm.inputFirstName.value,
                      MiddleName: addDataSheetForm.inputMiddleName.value,
                      SurName: addDataSheetForm.inputSurName.value,
                      ExName: addDataSheetForm.inputExName.value,
                      Gender: addDataSheetForm.gender.value,
                      Birthdate: addDataSheetForm.Birthdate.value,
                      PlaceBirth: addDataSheetForm.PlaceBirth.value,
                      CivilStatus: addDataSheetForm.inputStatus.value,
                      Email: addDataSheetForm.inputEmail.value,
                      MobileNumber: addDataSheetForm.inputMnumber.value,
                      TelNum: addDataSheetForm.inputTel.value,
                      Height: addDataSheetForm.inputHeight.value,
                      BloodType: addDataSheetForm.inputWeight.value,
                      GSIS: addDataSheetForm.InputGsis.value,
                      PagIbig: addDataSheetForm.InputPagibig.value,
                      PhilHealth: addDataSheetForm.inputPhealth.value,
                      SSS: addDataSheetForm.inputSSS.value,
                      Tin: addDataSheetForm.inputTIN.value,
                      Agency: addDataSheetForm.InputAgency.value,
                      Citizen: addDataSheetForm.citizenshipType.value,
                      Country: addDataSheetForm.inputCountry.value,
                      HouseBlock: addDataSheetForm.inputHouse.value,
                      Street: addDataSheetForm.inputStreet.value,
                      Subdivision: addDataSheetForm.InputSub.value,
                      Barangay: addDataSheetForm.inputBarangay.value,
                      Municipality: addDataSheetForm.inputMun.value,
                      Subdivision: addDataSheetForm.InputSub.value,
                      Province: addDataSheetForm.InputProv.value,
                      ZipCode: addDataSheetForm.inputZip.value, 
                    },
                    SpouseDetails: { 
                      SpouseFirstName: addDataSheetForm.inputSpouseFirstName.value,
                      SpouseMiddleName: addDataSheetForm.inputSpouseMiddleName.value,
                      SpouseSurName: addDataSheetForm.inputSpouseSurName.value,
                      SpouseExName: addDataSheetForm.inputSpouseExName.value,
                      SpouseOccupation: addDataSheetForm.inputSpouseOccupation.value,
                      SpouseEmployer: addDataSheetForm.inputSpouseEmployer.value,
                      SpouseBusinessAdd: addDataSheetForm.inputSpouseBusinessAdd.value,
                      SpouseTelNum: addDataSheetForm.inputSpouseTelNo.value,
                    },
                    FatherDetails: { 
                      FatherFirstName: addDataSheetForm.inputFatherFirstName.value,
                      FatherMiddleName: addDataSheetForm.inputFatherMiddleName.value,
                      FatherSurName: addDataSheetForm.inputFatherSurName.value,
                      FatherExName: addDataSheetForm.inputFatherExName.value 
                    },
                    MotherDetails: { 
                      MotherFirstName: addDataSheetForm.inputMotherFirstName.value,
                      MotherMiddleName: addDataSheetForm.inputMotherMiddleName.value,
                      MotherSurName: addDataSheetForm.inputMotherSurName.value,
                      MotherMaidenName: addDataSheetForm.inputMotherMaiden.value 
                    },
                    NumberChildren: addDataSheetForm.numberOfChildren.value,
                    ChildrenDetails: []
                  };

                  // Add data to Firestore
                  return addDoc(EmployeecolRef, employeeData);
                })
                .then((docRef) => {
                  const customDocId = docRef.id;
                  // Update the document with the custom ID
                  return setDoc(doc(EmployeecolRef, customDocId), { documentID: customDocId }, { merge: true });
                })
                .then(() => {
                  
                })
                .then(() => {
                  // Reset the form
                  addDataSheetForm.reset();
                  console.log("Added employee successfully...");

                  // Display success message using SweetAlert
                  Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Employee added successfully",
                    showConfirmButton: true,
                    confirmButtonText: 'Confirm',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      // User clicked the confirm button
                      window.location.href = 'admin_dashboard.html';
                    }
                  });
                })
                .catch(error => console.error('Error adding employee document:', error));
            });
          } else {
            console.log("User is not an admin."); 
          }
        });
      });
    } else {
      console.log("No user is signed in."); 
    }
  });
}

// Trigger the function on page load
window.addEventListener('load', AddEmployeeDataSheet);
