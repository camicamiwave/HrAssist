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

//import {AddApplicantInfo} from './add_firestore.js'

const app = initializeApp(firebaseConfig)

const auth = getAuth(app);

const db = getFirestore()

const storage = getStorage(app);

export function LoginChecker() {

  // Add an event listener to detect changes in authentication state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      //console.log(user.uid, '"afsfa');

      // Check if the element with ID "landing_login_btn" exists
      const Logout_Btn = document.getElementById("landing_login_btn");

      if (Logout_Btn) {
        // Set the innerHTML property only if the element exists
        Logout_Btn.innerHTML = "LOGOUT";

        console.log(user);

        const LandingLoginBtn = document.getElementById('landing_login_btn');

        // Add an event listener for the Sign Out button
        LandingLoginBtn.addEventListener('click', () => {
          signOut(auth)
            .then(() => {
              console.log("Sign out");
              window.location.href = 'login.html';
            })
            .catch((error) => {
              console.error('Sign-out error:', error);
            });
        });

      } else {
        //console.log("Authorize person is logging...");
      }

      AccountUserLevel = UserLoginChecker(user.uid, "Browsing");

    } else {
      // User is signed out
      console.log("No user login...");
      const LandingLoginBtn = document.getElementById('landing_login_btn');

      if (LandingLoginBtn) {
        LandingLoginBtn.innerHTML = "LOGIN";

        LandingLoginBtn.addEventListener('click', () => {
          window.location.href = 'login.html';
        });
      } else {
        //console.log("Element with ID 'landing_login_btn' not found.");
      }

      AccountUserLevel = UserLoginChecker("None", "Browsing");

    }
  });
}

// ... (other imports)

export function SignupApplicantAccount() {
  const storageRef = ref(storage, "Applicant/Requirements");
  const ApplicantColRef = collection(db, 'Applicant Information');
  const AccountColRef = collection(db, 'User Account');

  document.getElementById('second_applicantion_form_layout').style.display = 'none';
  document.getElementById('applicant_registration').addEventListener('submit', function (e) {
    e.preventDefault();

    // Retrieve values from form fields
    const ApplicantName = this.querySelector('input[name="ApplicantName"]').value;
    const ApplicantEmail = this.querySelector('input[name="ApplicantEmail"]').value;
    const ApplicantPassword = this.querySelector('input[name="ApplicantPassword"]').value;
    const ApplicantConfirmPassword = this.querySelector('input[name="ApplicantConfirmPassword"]').value;

    if (ApplicantPassword == ApplicantConfirmPassword) {
      document.getElementById('first_applicantion_form_layout').style.display = 'none';
      document.getElementById('second_applicantion_form_layout').style.display = 'block';

      const addApplicantForm = document.querySelector("#applicant_info_form");
      addApplicantForm.addEventListener('submit', (e) => {
        e.preventDefault();

        createUserWithEmailAndPassword(auth, ApplicantEmail, ApplicantPassword)
          .then((userCredential) => {
            const user = userCredential.user;

            let ApplicantProfileURL; // Move the declaration to a higher scope

            const fileInput = addApplicantForm.querySelector('input[name="file"]');
            const selectedFiles = fileInput.files;

            if (selectedFiles.length > 0) {
              const addDtrForm = document.querySelector("#applicant_info_form");
              const uploadPromises = [];
              const fileNeedUpload = [];
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
                fileNeedUpload.push(selectedFile);
              }

              Promise.all(uploadPromises)
                .then(() => {
                  const AccountDetails = {
                    userID: user.uid,
                    UserLevel: "Applicant",
                    Username: ApplicantEmail,
                    createdAt: serverTimestamp(),
                    AccountStatus: "Active",
                  };

                  let accountCustomDocId;

                  addDoc(AccountColRef, AccountDetails)
                    .then((docRef) => {
                      accountCustomDocId = docRef.id;
                      return setDoc(doc(AccountColRef, accountCustomDocId), { documentID: accountCustomDocId }, { merge: true });
                    })
                    .then(() => {
                      const profileInput = addApplicantForm.querySelector('input[name="ProfilePicture"]');
                      const selectedProfile = profileInput.files;

                      if (selectedProfile.length > 0) {
                        const firstSelectedProfile = selectedProfile[0];
                        const timestamp1 = new Date().getTime();
                        const uniqueProfileFilename = `${timestamp1}_${firstSelectedProfile.name}`;
                        const fileRef = ref(storageRef, uniqueProfileFilename);

                        uploadBytes(fileRef, firstSelectedProfile)
                          .then((snapshot) => getDownloadURL(fileRef))
                          .then((downloadURL) => {
                            ApplicantProfileURL = downloadURL;

                            console.log('ApplicantProfileURL:', ApplicantProfileURL);
                          })
                          .then(() => {
                            const selectedSex = addApplicantForm.querySelector('input[name="sex"]:checked');
                            const sexValue = selectedSex ? selectedSex.value : null;

                            const civilStatusSelect = addApplicantForm.querySelector('#inputState');
                            const civilStatusValue = civilStatusSelect.value;

                            const birthdayInput = addApplicantForm.querySelector('#birthday');
                            const birthdayValue = birthdayInput.value;

                            console.log('ApplicantProfileURL:', ApplicantProfileURL);

                            const data = {
                              userID: user.uid,
                              ApplicantStatus: "Pending",
                              JobApply: "",
                              Message: addApplicantForm.message.value,
                              createdAt: serverTimestamp(),
                              AccountDocumentID: accountCustomDocId,
                              ApplicantProfilePicture: ApplicantProfileURL,
                              Personal_Information: {
                                FirstName: addApplicantForm.inputFirstName.value,
                                MiddleName: addApplicantForm.inputMiddleName.value,
                                LastName: addApplicantForm.inputLastName.value,
                                ExName: addApplicantForm.inputExName.value,
                                Sex: sexValue,
                                CivilStatus: civilStatusValue,
                                Birthdate: birthdayValue,
                                Placebirth: addApplicantForm.inputplacebirth.value,
                                Phone: addApplicantForm.phone.value,
                                Email: addApplicantForm.inputemail.value,
                                Address: addApplicantForm.inputaddress.value,
                              },
                              Requirements: [],
                            };

                            for (let i = 0; i < fileURL.length; i++) {
                              data.Requirements.push({
                                [`file${i + 1}`]: fileURL[i],
                              });
                            }

                            addDoc(ApplicantColRef, data)
                              .then((docRef) => {
                                const customDocId = docRef.id;
                                return setDoc(doc(ApplicantColRef, customDocId), { documentID: customDocId }, { merge: true });
                              })
                              .then(() => {
                                addDtrForm.reset();
                                console.log("Added employee successfully...");
                                window.location.href = 'index.html';
                              })
                              .catch(error => console.error('Error adding document:', error));
                          })
                          .catch((error) => {
                            console.error('Error uploading profile picture:', error);
                          });
                      } else {
                        console.error('No file selected');
                      }
                    })
                    .catch((error) => console.error('Error adding document:', error));
                })
                .catch((error) => console.error('Error adding document:', error));
            } else {
              console.error('No file selected');
            }
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error:', errorCode, errorMessage);
          });
      });
    } else {
      console.log("There's something wrong...");
    }
  });
}


export function SignupAccount() {
  const EmployeeColRef = collection(db, 'Employee');
  const AccountColRef = collection(db, 'User Account');
  const signupForm = document.querySelector('.signup');

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const signup_email = signupForm.signup_email.value;
    const signup_password = signupForm.signup_password.value;
    const username = signupForm.username.value;

    console.log(username, "SAfsafsafsapogia ko");

    createUserWithEmailAndPassword(auth, signup_email, signup_password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;

        // Add displayName
        updateProfile(user, {
          displayName: username,
          emailVerified: true,
        })
          .then(() => {
            // Profile updated successfully
            console.log('User created:', user);
            console.log('User display name:', user.displayName);
            console.log("HELlo");

            console.log(signup_email, "hey you")

            const AccountDetails = {
              userID: user.uid,
              UserLevel: "Employee",
              Email: signup_email,
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
                const data = {
                  userID: user.uid,
                  AccountUserID: accountCustomDocId, // Now you can use the outer variable
                  userRole: "Employee",
                  username: username,
                  email: signup_email,
                  createdAt: serverTimestamp()
                };

                // Add data to Firestore with an automatically generated ID
                return addDoc(EmployeeColRef, data);
              })
              .then((docRef) => {
                const customDocId = docRef.id;
                // Update the document with the custom ID
                return setDoc(doc(EmployeeColRef, customDocId), { documentID: customDocId }, { merge: true });
              })
              .then(() => {
                signupForm.reset();
                console.log("Added employee successfully...");
                window.location.href = 'index.html';
              })
              .catch(error => console.error('Error adding employee document:', error));

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
  });
}


window.addEventListener('load', SignupApplicantAccount);
window.addEventListener('load', LoginChecker);
window.addEventListener('load', SignupAccount);

