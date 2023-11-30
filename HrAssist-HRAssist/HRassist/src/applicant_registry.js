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

function GetApplicantTable() {
  // Assuming you have Firestore data in the 'employees' array
  const employeeTable = document.getElementById('applicantTable');
  const tbody = employeeTable.querySelector('tbody');

  onSnapshot(q, (snapshot) => {
    // Clear the existing rows in the table body
    tbody.innerHTML = '';

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;
      const row = document.createElement('tr');

      const personal_info = data.Personal_Information;
      const ApplicantFullName = personal_info.FirstName + " " + personal_info.LastName;

      const createdAt = data.createdAt.toDate(); // Assuming createdAt is a timestamp
      // Extracting date only from createdAt
      const dateString = createdAt.toLocaleDateString();

      
      // Create and populate table cells
      // Create an image element
      const imageElement = document.createElement('img');

      // Set the src attribute to the image URL
      imageElement.src = data.ProfilePicURL;
      // Append the image element to the table cell
      const profileCell = document.createElement('td');
      profileCell.appendChild(imageElement);

      const idCell = document.createElement('td');
      idCell.textContent = data.ApplicantID;

      const nameCell = document.createElement('td');
      nameCell.textContent = ApplicantFullName;

      const jobApplicationDateCell = document.createElement('td');
      jobApplicationDateCell.textContent = dateString;

      const applicantStatusCell = document.createElement('td');
      applicantStatusCell.textContent = data.ApplicantStatus;

      // Add button
      // Create a button element for actions and add it to the row
      const actionCell = document.createElement('td');
      const actionButtonEdit = document.createElement('button');
      //actionButtonEdit.textContent = 'Edit'; // Customize the button label
      actionButtonEdit.classList.add('btn', 'bx', 'bx-edit', 'mx-2'); // You can use Bootstrap's 'btn' and 'btn-primary' classes

      actionButtonEdit.addEventListener('click', () => {
        // Define an action for the Edit button (e.g., edit the record)
        // You can add your specific logic here
        console.log('Edit button clicked for record with ID:', id);
      });

      const actionButtonDelete = document.createElement('button');
      //actionButtonDelete.textContent = 'Delete'; // Customize the button label
      actionButtonDelete.classList.add('btn', 'bx', 'bx-trash'); // You can use Bootstrap's 'btn' and 'btn-danger' classes

      actionButtonDelete.addEventListener('click', () => {

        console.log('Delete button clicked for record with ID:', id);

      });

      actionCell.appendChild(actionButtonEdit);
      actionCell.appendChild(actionButtonDelete);

      // Add a click event listener to the row
      row.addEventListener('click', () => {
        console.log('Row ID clicked:', id);
      });

      // Append cells to the row 
      //row.appendChild(profileCell); 
      row.appendChild(profileCell)
      row.appendChild(idCell);
      row.appendChild(nameCell);
      row.appendChild(jobApplicationDateCell);
      row.appendChild(applicantStatusCell);
      row.appendChild(actionCell);

      // Append the row to the table body
      tbody.appendChild(row);
    });
  });
}


window.addEventListener('load', GetApplicantTable);





export function FetchCurrentUser() {
  return new Promise((resolve, reject) => {
    // Listen for changes in authentication state
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const currentUserID = user.uid;
        console.log("Current User UID:", currentUserID);
        resolve(currentUserID);
      } else {
        // No user is signed in
        console.log("No user is signed in.");
        resolve("None");
      }
    });
  });
}

export function FetchApplicantProfile() {
  const TestcolRef = collection(db, 'Applicant Information');

  FetchCurrentUser().then((currentUserUID) => {

    console.log(currentUserUID, 'sdds')
    const que = query(TestcolRef, where("userID", "==", currentUserUID));

    onSnapshot(que, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        const personalInfo = data.Personal_Information;
        const fullName = personalInfo.FirstName + " " + personalInfo.LastName

        const applicantProfile = document.getElementById('applicantProfilePic');
        const newProfilePicUrl = data.ProfilePicURL;

        // Change the src attribute
        applicantProfile.src = newProfilePicUrl;

        const applicantName = document.getElementById('applicantName');
        applicantName.innerHTML = fullName;

        const firstName = document.getElementById('inputFirstName');
        firstName.value = personalInfo.FirstName;

        const middleName = document.getElementById('inputMiddleName');
        middleName.value = personalInfo.MiddleName;

        const lastName = document.getElementById('inputLastName');
        lastName.value = personalInfo.LastName;

        const ExtName = document.getElementById('inputExtName');
        ExtName.value = personalInfo.ExName;

        const sex = document.getElementById('inputSex');
        sex.value = personalInfo.Sex;

        const civilStatus = document.getElementById('inputCivilStatus');
        civilStatus.value = personalInfo.CivilStatus;

        const address = document.getElementById('inputAddress');
        address.value = personalInfo.Address;

        const birthPlace = document.getElementById('inputBplace');
        birthPlace.value = personalInfo.Placebirth;

        const emailAddress = document.getElementById('inputEmailAddress');
        emailAddress.value = personalInfo.Email;

        const phoneNum = document.getElementById('inputPhone');
        phoneNum.value = personalInfo.Phone;

        const inputEmailAddress = document.getElementById('inputEmailAddress');
        inputEmailAddress.value = personalInfo.Email;


        try {
          const inputApplicantStatus = document.getElementById('ApplicantStatus');
          const inputJobApply = document.getElementById('JobApply');
          const inputdateSubmitted = document.getElementById('dateSubmitted');
          const inputMessage = document.getElementById('Message');

          inputApplicantStatus.value = data.ApplicantStatus;
          inputJobApply.value = "";
          inputdateSubmitted.value = data.createdAt;
          inputMessage.value = data.personalInfo.Message;

        } catch {

        }

      });

    });
  });
}

window.addEventListener('load', FetchApplicantProfile);

export function AddApplicantAccount() {
  const EmployeeColRef = collection(db, 'Employee');
  const AccountColRef = collection(db, 'User Account');
  const signupForm = document.querySelector('.applicantAccountForm');

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = signupForm.username.value;
    const email = signupForm.email.value;
    const password = signupForm.password.value;
    const confirm_password = signupForm.confirm_password.value;

    if (password === confirm_password) {

      createUserWithEmailAndPassword(auth, email, confirm_password)
        .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;

          // Add displayName
          updateProfile(user, {
            displayName: username,
            emailVerified: true,
          })
            .then(() => { 
              const AccountDetails = {
                userID: user.uid,
                UserLevel: "Applicant",
                Username: username,
                Email: email,
                createdAt: serverTimestamp(),
                AccountStatus: "Active"
              };

              let accountCustomDocId; // Declare the variable in the outer scope

              // Add data to Firestore with an automatically generated ID
              addDoc(AccountColRef, AccountDetails)
                .then((docRef) => {
                  accountCustomDocId = docRef.id; // Update the outer variable
                  // Update the document with the custom ID
                  return setDoc(doc(AccountColRef, accountCustomDocId), { documentID: accountCustomDocId }, { merge: true });
                })
                .then(() => {
                  signupForm.reset();
                  console.log("Added applicant successfully...");
                  Swal.fire({
                    position: "center",
                    icon: "success",
                    title: "Your account added successfully",
                    showConfirmButton: true, // Change to true to show a confirm button
                    // Add a confirm button handler
                    confirmButtonText: 'Confirm', // Customize the button text
                }).then((result) => {
                    if (result.isConfirmed) {
                        // User clicked the confirm button
                        window.location.href = 'index.html';
                    }
                });

                })
                .catch(error => console.error('Error adding applicant document:', error));

            })
            .catch((error) => {
              console.error('Error updating display name:', error);
            });
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.error('Error:', errorCode, errorMessage);
        });
    } else {
      console.log("There was an error...");
    }

  });
}

window.addEventListener('load', AddApplicantAccount);

export function AddApplicantionForm() {
  const storageRef = ref(storage, "Applicant/Requirements");
  const ApplicantColRef = collection(db, 'Applicant Information');

  const hideSection = (section) => {
    document.getElementById(section).style.display = 'none';
  };

  const showSection = (section) => {
    document.getElementById(section).style.display = 'block';
  };

  const setSectionHandlers = (forwardBtn, backBtn, currentSection, nextSection, backSection) => {
    forwardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hideSection(currentSection);
      showSection(nextSection);
    });

    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hideSection(currentSection);
      showSection(backSection);
    });
  };

  hideSection('Section2_Layout');
  hideSection('Section3_Layout');

  FetchCurrentUser().then((currentUserUID) => {
    if (currentUserUID !== "None") {
      console.log("User is logged in...");

      const step1ForwardBtn = document.getElementById('step1_forward_btn');
      const step2BackBtn = document.getElementById('step2_back_btn');
      const step2ForwardBtn = document.getElementById('step2_forward_btn');
      const step3BackBtn = document.getElementById('step3_back_btn');
      const step3SubmitBtn = document.getElementById('submit_btn');

      setSectionHandlers(step1ForwardBtn, step2BackBtn, 'Section1_Layout', 'Section2_Layout', 'Section1_Layout');
      setSectionHandlers(step2ForwardBtn, step3BackBtn, 'Section2_Layout', 'Section3_Layout', 'Section2_Layout');

      step3SubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        console.log("Submit na boy");

        const addApplicantForm = document.querySelector("#applicant_info_form");
        const fileInput = addApplicantForm.querySelector('input[name="customFile"]');
        const selectedFiles = fileInput.files;

        if (selectedFiles.length > 0) {
          const uploadPromises = [];
          const fileURL = [];

          for (let i = 0; i < selectedFiles.length; i++) {
            const selectedFile = selectedFiles[i];
            const timestamp = new Date().getTime();
            const uniqueFilename = `${timestamp}_${selectedFile.name}`;
            const fileRef = ref(storageRef, uniqueFilename);

            const uploadPromise = uploadBytes(fileRef, selectedFile)
              .then((snapshot) => getDownloadURL(fileRef))
              .then((downloadURL) => {
                fileURL.push(downloadURL);
              });

            uploadPromises.push(uploadPromise);
          }

          Promise.all(uploadPromises)
            .then(() => {
              const profileInput = addApplicantForm.querySelector('input[name="applicantPicture"]');
              const selectedProfile = profileInput.files;

              if (selectedProfile.length > 0) {
                const firstSelectedProfile = selectedProfile[0];
                const timestamp1 = new Date().getTime();
                const uniqueProfileFilename = `${timestamp1}_${firstSelectedProfile.name}`;
                const fileRef = ref(storageRef, uniqueProfileFilename);

                uploadBytes(fileRef, firstSelectedProfile)
                  .then((snapshot) => getDownloadURL(fileRef))
                  .then((downloadURL) => {
                    const ApplicantProfileURL = downloadURL;

                    console.log('ApplicantProfileURL:', ApplicantProfileURL);

                    FetchApplicantIDData().then((maxID) => {
                      const civilStatusDropdown = document.getElementById('civilStatusDropdown');
                      const selectedCivilStatus = civilStatusDropdown.querySelector('li.selected').getAttribute('rel');
                      const applicantID = maxID + 1;
                      const data = {
                        userID: currentUserUID,
                        ApplicantStatus: "Pending",
                        JobApply: "",
                        ApplicantID: applicantID,
                        createdAt: serverTimestamp(),
                        ApplicantProfilePicture: ApplicantProfileURL,
                        Personal_Information: {
                          FirstName: addApplicantForm.querySelector('input[name="inputFirstName"]').value,
                          MiddleName: addApplicantForm.querySelector('input[name="inputMiddleName"]').value,
                          LastName: addApplicantForm.querySelector('input[name="inputLastName"]').value,
                          ExName: addApplicantForm.querySelector('input[name="inputExName"]').value,
                          Gender: addApplicantForm.querySelector('input[name="gender"]').value,
                          CivilStatus: selectedCivilStatus,
                          Birthdate: addApplicantForm.querySelector('input[name="birthday"]').value,
                          Placebirth: addApplicantForm.querySelector('input[name="inputplacebirth"]').value,
                          Phone: addApplicantForm.querySelector('input[name="phone"]').value,
                          Email: addApplicantForm.querySelector('input[name="inputemail"]').value,
                          Address: addApplicantForm.querySelector('input[name="inputaddress"]').value,
                        },
                        Requirements: fileURL.map((url, index) => ({
                          [`file${index + 1}`]: url,
                        })),
                      };

                      addDoc(ApplicantColRef, data)
                        .then((docRef) => {
                          const customDocId = docRef.id;
                          return setDoc(doc(ApplicantColRef, customDocId), { documentID: customDocId }, { merge: true });
                        })
                        .then(() => {
                          addApplicantForm.reset();
                          console.log("Added employee successfully...");

                          Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "Your job application save successfully",
                            showConfirmButton: true, // Change to true to show a confirm button
                            // Add a confirm button handler
                            confirmButtonText: 'Confirm', // Customize the button text
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // User clicked the confirm button
                                window.location.href = 'applicant-congrats.html';
                            }
                        });

                        })
                        .catch(error => console.error('Error adding document:', error));
                    })
                    .catch((error) => {
                      console.error('Error fetching max ApplicantIDNum:', error);
                    });
                  })
                  .catch((error) => {
                    console.error('Error uploading profile picture:', error);
                  });
              } else {
                console.error('No file selected');
              }
            })
            .catch((error) => console.error('Error adding document:', error));
        } else {
          console.error('No file selected');
        }
      });
    } else {
      console.log("No sign-up detected");
      window.location.href = "login.html"
    }
  });


  
}

window.addEventListener('load', AddApplicantionForm);

export function FetchApplicantIDData() {
  return new Promise((resolve, reject) => {
    const TestcolRef = collection(db, 'Applicant Information');
    const querySnapshot = query(TestcolRef);

    onSnapshot(querySnapshot, (snapshot) => {
      let maxApplicantIDNum = 10000;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const applicantIDNum = data.ApplicantID;
        
        if (applicantIDNum > maxApplicantIDNum) {
          maxApplicantIDNum = applicantIDNum;
        }
      });

      resolve(maxApplicantIDNum);
    });
  });
}

window.addEventListener('load', FetchApplicantIDData) 

export function FetchApplicationStatus() { 
    // Get the query string from the URL
    const queryString = window.location.search;

    // Create a URLSearchParams object from the query string
    const urlParams = new URLSearchParams(queryString);

    // Get the values of the customDocId and id parameters
    const customDocId = urlParams.get('customDocId'); 

    // Log or use the retrieved values
    console.log(`Custom Doc ID: ${customDocId}`); 

    
  const TestcolRef = collection(db, 'Applicant Information');
  const ApplicantQue = query(TestcolRef, where('documentID', '==', customDocId))

  FetchCurrentUser().then((currentUserUID) => {
    const que = query(TestcolRef, where("userID", "==", currentUserUID));

    onSnapshot(ApplicantQue, (snapshot) => {
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const id = doc.id;

        const applicantId = document.getElementById('ApplicantIDNum');
        //applicantId.innerHTML = data.ApplicantID;

        const applicantDateCreated = document.getElementById('ApplicantTimeCreated');

        // Convert Firestore timestamp to JavaScript Date object
        const dateCreated = data.createdAt;
        const createdAtDate = dateCreated.toDate();

        // Format the date as a string
        const formattedDate = createdAtDate.toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric', 
        });

        applicantDateCreated.innerHTML = formattedDate;

      });

    });
  });
}

window.addEventListener('load', FetchApplicationStatus)



export function TabNavigator() {

  try{
    const profileTab = document.getElementById('profileTab');
    if (profileTab){
  
      profileTab.addEventListener('click', (e) => { 
        window.location.href = `profile.html`;
      })
    }  
  } catch {
    console.log("Not profile")
  }

  try{
    const statusTab = document.getElementById('statusTab');
    
    statusTab.addEventListener('click', (e) => { 
      window.location.href = `applicant_status.html`;
    })

  } catch {
    console.log("Not status Tab")
  }
  
  try {
    const securityTab = document.getElementById('securityTab');
    if (securityTab) {
      securityTab.addEventListener('click', (e) => { 
        window.location.href = `applicant_security.html`;
      })
    }
    
  } catch {
    console.log("Not securit Tab")
  }

  
}

window.addEventListener('load', TabNavigator)