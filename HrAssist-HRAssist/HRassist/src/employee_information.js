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
  getDoc, updateDoc, setDoc
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

  const TestcolRef = collection(db, 'User Account');


  FetchCurrentUser().then((currentUserUID) => {
    const que = query(TestcolRef, where("userID", "==", currentUserUID));

    onSnapshot(que, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        const accountDocID = data.documentID;

        const navbarProfPic = document.getElementById('navbarProfilePicture');
        const navbarUserName = document.getElementById('navbarUserName');
        const hoverUserName = document.getElementById('hoverUserName');
        const userLevel = document.getElementById('userLevel');
        const EditButton = document.getElementById("ResetPasswordBtn")

        if (data.UserLevel === "Employee") {

          // get the current employee data
          const EmployeecolRef = collection(db, 'Employee Information');
          const File201colRef = collection(db, '201File Information');

          fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
            const EmployeeData = dataRetrieved;
            const EmployeePersonalInfo = dataRetrieved.Personal_Information;

            // HTML IDS
            const EmployeeAbout = document.getElementById('aboutTextProfile')
            const EmployeeFullName = document.getElementById("EmployeeFullName") 
            const EmployeeOffice = document.getElementById("EmployeeOffice")
            const EmployeeJobPosition = document.getElementById("EmployeeJobPosition")
            const EmployeeSalary = document.getElementById("EmployeeSalary")
            const EmployeeAddress = document.getElementById("EmployeeAddress")
            const EmployeePhone = document.getElementById("EmployeePhone")
            const EmployeeEmail = document.getElementById("EmployeeEmail")


            const EmployeeProfilePicture = document.getElementById("employeeProfilePic")
            const DisplayfullName = document.getElementById("employeeTitleName")
            const employeeJobName = document.getElementById("employeeJobName")


            // Fullname
            const Employee_Fullname = `${EmployeePersonalInfo.FirstName} ${EmployeePersonalInfo.MiddleName} ${EmployeePersonalInfo.SurName} ${EmployeePersonalInfo.ExName}`
            const Employee_Address = `${EmployeePersonalInfo.Municipality} ${EmployeePersonalInfo.Province}`

            EmployeeProfilePicture.src = EmployeeData.ProfilePictureURL; 
            if (EmployeePersonalInfo){
              EmployeeAbout.innerHTML = EmployeePersonalInfo.About
            } else {
              EmployeeAbout.innerHTML = ""
            }
            DisplayfullName.innerHTML = Employee_Fullname;
            EmployeeFullName.innerHTML = Employee_Fullname;
            EmployeeAddress.innerHTML = Employee_Address;
            EmployeePhone.innerHTML = EmployeePersonalInfo.MobileNumber;
            EmployeeEmail.innerHTML = EmployeePersonalInfo.Email;


            // Edit Profile Employee                
            const EditProfilePicture = document.getElementById("EmployeeProfilePicture")
            const aboutText = document.getElementById('aboutText')
            const EditFirstName = document.getElementById("EditFirstName")
            const EditMiddleName = document.getElementById("EditMiddleName")
            const EditLastName = document.getElementById("EditLastName")
            const EditExName = document.getElementById("EditExName")
            const EditMunicipality = document.getElementById("EditMunicipality")
            const EditProvince = document.getElementById("EditProvince")
            const EditPhone = document.getElementById("EditPhone")
            const EditEmail = document.getElementById("EditEmail")

            EditProfilePicture.src = EmployeeData.ProfilePictureURL;

            aboutText.value = EmployeePersonalInfo.About
            EditFirstName.value = EmployeePersonalInfo.FirstName
            EditMiddleName.value = EmployeePersonalInfo.MiddleName
            EditLastName.value = EmployeePersonalInfo.SurName
            EditExName.value = EmployeePersonalInfo.ExName
            EditMunicipality.value = EmployeePersonalInfo.Municipality
            EditProvince.value = EmployeePersonalInfo.Province
            EditPhone.value = EmployeePersonalInfo.MobileNumber
            EditEmail.value = EmployeePersonalInfo.Email

            fetchEmployeeInfo(File201colRef, EmployeeData.documentID, "employeeDocID").then((dataRetrieved) => {
              const File201Data = dataRetrieved;
              const File201Info = dataRetrieved.Appointment_Details;

              console.log(File201Data)

              EmployeeOffice.innerHTML = File201Info.Office;
              EmployeeJobPosition.innerHTML = File201Info.PositionTitle;
              EmployeeSalary.innerHTML = File201Info.Compensation;
              employeeJobName.innerHTML = File201Info.PositionTitle;

            })

            EditButton.addEventListener('click', () => {
              EmployeeResetPassword()
            })

          })
        }
        userLevel.innerHTML = data.UserLevel
      });
    });
  });
}

window.addEventListener('load', FetchEmployeeInformation)


function EmployeeResetPassword() {

  Swal.fire({
    title: 'Enter Your Email',
    input: 'email',
    inputPlaceholder: 'Enter your account email address',
    showCancelButton: true,
    confirmButtonText: 'Next',
    cancelButtonText: 'Cancel',
    showLoaderOnConfirm: true,
    preConfirm: (email) => {
      // Validate the email if needed
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    },
  }).then((result) => {
    if (result.isConfirmed) {
      const email = result.value;
      Swal.fire({
        title: 'Are you sure?',
        text: 'You will receive an email once you agree.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Reset it!',
      }).then((result) => {
        if (result.isConfirmed) {
          sendPasswordResetEmail(auth, email)
            .then(() => {
              // Password reset email sent!
              // ..
              Swal.fire({
                title: 'Email Sent!',
                text: 'Check your email address',
                icon: 'success',
              });
            })
            .catch((error) => {
              const errorCode = error.code;
              const errorMessage = error.message;
              // Handle error
            });
        }
      });
    }
  });
}


function EmployeeEditProfile() {
  try {
    const uploadProfileImgBtn = document.getElementById('uploadProfileImg');
    const removeProfileImgBtn = document.getElementById('removeProfileImg');
    const EditButton = document.getElementById('EditButton');


    const TestcolRef = collection(db, 'User Account');


    EditButton.addEventListener('click', (e) => {

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
              const File201colRef = collection(db, '201File Information');

              fetchEmployeeInfo(EmployeecolRef, accountDocID, "accountID").then((dataRetrieved) => {
                const EmployeeData = dataRetrieved;
                const EmployeePersonalInfo = dataRetrieved.Personal_Information;

                const EmployeeID = EmployeeData.documentID;

                const aboutText = document.getElementById('aboutText').value;
                const EditFirstName = document.getElementById('EditFirstName').value;
                const EditMiddleName = document.getElementById('EditMiddleName').value;
                const EditLastName = document.getElementById('EditLastName').value;
                const EditExName = document.getElementById('EditExName').value;
                const EditMunicipality = document.getElementById('EditMunicipality').value;
                const EditProvince = document.getElementById('EditProvince').value;
                const EditPhone = document.getElementById('EditPhone').value;
                const EditEmail = document.getElementById('EditEmail').value;


                const fieldsToUpdate = {
                  Personal_Information: {
                    About: aboutText,
                    FirstName: EditFirstName,
                    MiddleName: EditMiddleName,
                    SurName: EditLastName,
                    ExName: EditExName,
                    Municipality: EditMunicipality,
                    Province: EditProvince,
                    MobileNumber: EditPhone,
                    Email: EditEmail
                  }
                }


                Swal.fire({
                  title: "Are you sure?",
                  text: "Your changes will be saved.",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                  confirmButtonText: "Confirm"
                }).then((result) => {
                  console.log(EmployeeID)

                  UpdateEmployeeProfile(EmployeeID, fieldsToUpdate)
                  SaveProfile(EmployeeID)
                }).then(() => {
                  Swal.fire({
                    title: 'Changes Successfully!',
                    text: 'Your changes update successfully.',
                    icon: 'success',
                  });
                  console.log('Edit successfully...')
                })

              })

            } else {
              console.log("Not Employee...")
              alert('Not employee...')
            }

          })
        })
      })
    })
  } catch {
    console.log("There was an error...")
    alert("There was an error...")
  }
}

window.addEventListener('load', EmployeeEditProfile)

function UpdateEmployeeProfile(EmployeeID, fieldsToUpdate) {
  const EmployeecolRef = collection(db, 'Employee Information');
  const DocRef = doc(EmployeecolRef, EmployeeID);

  // Use the setDoc method to update existing fields and add new ones
  setDoc(DocRef, fieldsToUpdate, { merge: true })
    .then(() => {
      console.log('Document successfully updated!');
    })
    .catch((error) => {
      console.error('Error updating document: ', error);
    });

  
}


function SaveProfile(EmployeeID) {
  const storageRef = ref(storage, "Employee/Profile");
  const EmployeecolRef = collection(db, 'Employee Information');

  // Access the file input field
  const fileInput = document.getElementById('fileInput');
  const selectedFiles = fileInput.files;
  const firstSelectedFile = selectedFiles[0];  // Access the first file

  if (firstSelectedFile) {
      // Generate a unique filename using timestamp
      const timestamp = new Date().getTime();
      const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
      const fileRef = ref(storageRef, uniqueFilename);

      // Upload the file to Firebase Storage
      uploadBytes(fileRef, firstSelectedFile)
          .then((snapshot) => getDownloadURL(fileRef))
          .then((downloadURL) => {
              if (downloadURL) {
                  const DocRef = doc(EmployeecolRef, EmployeeID);
                  const fieldsToUpdate = {
                      ProfilePictureURL: downloadURL
                  };

                  // Use the setDoc method to update existing fields and add new ones
                  return setDoc(DocRef, fieldsToUpdate, { merge: true });
              } else {
                  console.error('Download URL is undefined.');
              }
          })
          .then(() => {
              console.log('Document successfully updated!');
          })
          .catch((error) => {
              console.error('Error during file upload or document update: ', error);
          });
  } else {
      console.error('No file selected for upload.');
  }
}