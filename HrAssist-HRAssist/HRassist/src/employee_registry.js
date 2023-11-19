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
  try {
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

  } catch {
    console.log("No data detected...")
  }
}


window.addEventListener('load', GetEmployeeTable);

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

    //alert(`Fullname:${LastName} ${FirstName} ${MiddleName} ${ExtName}`)

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
            window.location.href = `datasheet.html?data=${encodeURIComponent(employeeDocID)}`;
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

function EmployeeCreateAccount() {
  
  const AccountColRef = collection(db, 'User Account'); 
  const EmployeeColRef = collection(db, 'Employee Information'); 

  const SubmitAccountForm = document.getElementById('empCreateAccountBtn');

  SubmitAccountForm.addEventListener('click', (e) => {
    e.preventDefault();

    const EmployeeUserName = document.getElementById('empInputUsername').value;
    const EmployeeEmail = document.getElementById('empInputEmail').value;
    const EmployeePassword = document.getElementById('empInputPassword').value;
    const EmployeeConfirmPassword = document.getElementById('empInputConfirmPassword').value;

    console.log(EmployeeEmail, EmployeeUserName, EmployeePassword, EmployeeConfirmPassword, 'asfsaf');

    let customDocId;

    if (EmployeePassword === EmployeeConfirmPassword) {

      try {
        Swal.fire({
          title: "Are you sure?",
          text: `Your employee will be saved.`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, proceed!"
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("Pwede mag signin")
            createUserWithEmailAndPassword(auth, EmployeeEmail, EmployeePassword)
              .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;

                // Add displayName
                updateProfile(user, {
                  displayName: EmployeeUserName,
                  emailVerified: true,
                }).then(() => {
                  // Profile updated successfully
                  console.log('User created:', user);
                  console.log('User display name:', user.displayName);
                }).then(() => {

                  const AccountDetails = {
                    AccountStatus: "Active",
                    userID: user.uid,
                    UserLevel: "Employee",
                    Email: EmployeeEmail,
                    createdAt: serverTimestamp()
                  }
                  return addDoc(AccountColRef, AccountDetails);
                }).then((docRef) => {
                  customDocId = docRef.id;

                  const PriorAccountDetails = {
                    accountID: customDocId,
                    EmployeeUsername: EmployeeUserName,
                    EmployeeEmail: EmployeeEmail,
                  }
                  return addDoc(EmployeeColRef, PriorAccountDetails);
                }).then(() => {
                  return setDoc(doc(EmployeeColRef, customDocId), { documentID: customDocId }, { merge: true });
                }).then(() => { 
                  console.log("Added employee account successfully...");
                  window.location.href = `admin_employee_pds.html?data=${encodeURIComponent(customDocId)}`;

                })
              })
          }
        })
      } catch {
        alert("There was an error...");
      }

    } else {
      alert("bawal");
    }
  });


}

//window.addEventListener('load', EmployeeCreateAccount)



export function AddEmployeeDataSheet() {

  const TestcolRef = collection(db, 'User Account');
  const EmployeecolRef = collection(db, 'Employee Information');
  const storageRef = ref(storage, "Employee/Requirements");

  // Assuming you have an HTML form with id="employeeDataSheet"
  const addDataSheetForm = document.querySelector("#employeeDataSheet");

  let customDocId; // Declare customDocId outside the then block
  
  // In your second.html JavaScript file
  const urlParams = new URLSearchParams(window.location.search);
  const receivedStringData = urlParams.get('data');

  console.log("Data Retrieved: ", receivedStringData);


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
                      CSCID: addDataSheetForm.inputCsId.value.trim(),
                      FirstName: addDataSheetForm.inputFirstName.value.trim(),
                      MiddleName: addDataSheetForm.inputMiddleName.value.trim(),
                      SurName: addDataSheetForm.inputSurName.value.trim(),
                      ExName: addDataSheetForm.inputExName.value.trim(),
                      Gender: addDataSheetForm.gender.value.trim(),
                      Birthdate: addDataSheetForm.Birthdate.value.trim(),
                      PlaceBirth: addDataSheetForm.PlaceBirth.value.trim(),
                      CivilStatus: addDataSheetForm.inputStatus.value.trim(),
                      Email: addDataSheetForm.inputEmail.value.trim(),
                      MobileNumber: addDataSheetForm.inputMnumber.value.trim(),
                      TelNum: addDataSheetForm.inputTel.value.trim(),
                      Height: addDataSheetForm.inputHeight.value.trim(),
                      BloodType: addDataSheetForm.inputWeight.value.trim(),
                      GSIS: addDataSheetForm.InputGsis.value.trim(),
                      PagIbig: addDataSheetForm.InputPagibig.value.trim(),
                      PhilHealth: addDataSheetForm.inputPhealth.value.trim(),
                      SSS: addDataSheetForm.inputSSS.value.trim(),
                      Tin: addDataSheetForm.inputTIN.value.trim(),
                      Agency: addDataSheetForm.InputAgency.value.trim(),
                      Citizen: addDataSheetForm.inputCitizen.value.trim(),
                      Naturalize: addDataSheetForm.naturalization.value.trim(),
                      Country: addDataSheetForm.inputCountry.value.trim(),
                      HouseBlock: addDataSheetForm.inputHouse.value.trim(),
                      Street: addDataSheetForm.inputStreet.value.trim(),
                      Subdivision: addDataSheetForm.InputSub.value.trim(),
                      Barangay: addDataSheetForm.inputBarangay.value.trim(),
                      Municipality: addDataSheetForm.inputMun.value.trim(),
                      Subdivision: addDataSheetForm.InputSub.value.trim(),
                      Province: addDataSheetForm.InputProv.value.trim(),
                      ZipCode: addDataSheetForm.inputZip.value.trim(),
                    },
                    SpouseDetails: {
                      SpouseFirstName: addDataSheetForm.inputSpouseFirstName.value.trim(),
                      SpouseMiddleName: addDataSheetForm.inputSpouseMiddleName.value.trim(),
                      SpouseSurName: addDataSheetForm.inputSpouseSurName.value.trim(),
                      SpouseExName: addDataSheetForm.inputSpouseExName.value.trim(),
                      SpouseOccupation: addDataSheetForm.inputSpouseOccupation.value.trim(),
                      SpouseEmployer: addDataSheetForm.inputSpouseEmployer.value.trim(),
                      SpouseBusinessAdd: addDataSheetForm.inputSpouseBusinessAdd.value.trim(),
                      SpouseTelNum: addDataSheetForm.inputSpouseTelNo.value.trim(),
                    },
                    FatherDetails: {
                      FatherFirstName: addDataSheetForm.inputFatherFirstName.value.trim(),
                      FatherMiddleName: addDataSheetForm.inputFatherMiddleName.value.trim(),
                      FatherSurName: addDataSheetForm.inputFatherSurName.value.trim(),
                      FatherExName: addDataSheetForm.inputFatherExName.value.trim()
                    },
                    MotherDetails: {
                      MotherFirstName: addDataSheetForm.inputMotherFirstName.value.trim(),
                      MotherMiddleName: addDataSheetForm.inputMotherMiddleName.value.trim(),
                      MotherSurName: addDataSheetForm.inputMotherSurName.value.trim(),
                      MotherMaidenName: addDataSheetForm.inputMotherMaiden.value.trim()
                    },
                    NumberChildren: addDataSheetForm.numberOfChildren.value.trim(),
                    ChildrenDetails: []
                  };

                  try {
                    const numberChildren = document.getElementById("numberOfChildren").value;

                    const formData = []

                    for (let i = 1; i <= numberChildren; i++) {
                      employeeData.ChildrenDetails.push({
                        ChildrenFirstName: document.getElementById(`inputChildrenFirstName${i}`).value.trim(),
                        ChiildrenMiddleName: document.getElementById(`inputChildrenMiddleName${i}`).value.trim(),
                        ChiildrenSurName: document.getElementById(`inputChildrenSurName${i}`).value.trim(),
                        ChiildrenExName: document.getElementById(`inputChildrenExName${i}`).value.trim(),
                      });
                    }

                    Swal.fire({
                      title: "Are you sure?",
                      text: "Employee's personal information will be saved",
                      icon: "question",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Confirm"
                    }).then((result) => {
                      if (result.isConfirmed) {
                        Swal.fire({
                          title: "Saved!",
                          text: "Your employee added successfully...",
                          icon: "success"
                        }).then(() => {
                          // Add data to Firestore
                          return addDoc(EmployeecolRef, employeeData);
                        }).then((docRef) => {
                          customDocId = docRef.id;
                          // Update the document with the custom ID
                          return setDoc(doc(EmployeecolRef, customDocId), { documentID: customDocId }, { merge: true });
                        })
                          .then(() => {
                            console.log("hereee: ", customDocId)
                            // Reset the form
                            addDataSheetForm.reset();
                            console.log("Added employee successfully...");
                            //window.location.href = 'Education-21Files.html';
                            window.location.href = `Education-21Files.html?data=${encodeURIComponent(customDocId)}`;
                          })
                          .catch(error => console.error('Error adding employee document:', error));
                      }
                    });

                  }
                  catch {
                    alert("Please provide the required fields.")
                  }
                })

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


