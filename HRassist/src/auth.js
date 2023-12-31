import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL,  uploadBytes } from 'firebase/storage';
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
//import {AddApplicantInfo} from './add_firestore.js'

const app = initializeApp(firebaseConfig)

const auth = getAuth(app);

const db = getFirestore()

const storage = getStorage(app);

export function LoginMethod() {
    //const userInfoDisplay = document.getElementById('user-info');
    const authForm = document.getElementById('auth-form');
    const signInButton = document.getElementById('sign-in-email-password');
    const signOutButton = document.getElementById('sign-out');
    const loginLabelh1 = document.getElementById('LoginLabel');

    // Add an event listener for the Email and Password Sign In button
    signInButton.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User is signed in, you can display user information
                const user = userCredential.user;
                //userInfoDisplay.innerHTML = `Signed in as123: ${user.displayName} (${user.email})`;
                console.log(`Signed in: ${user.email} `);
                window.location.href = 'landing.html';



            })
            .catch((error) => {
                console.error('Email and Password Sign-In error:', error);
            });
    });

    // Add an event listener for the Sign Out button
    signOutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                //userInfoDisplay.innerHTML = 'Signed out';
                console.log("Sign out")
            })
            .catch((error) => {
                console.error('Sign-out error:', error);
            });
    });


    // Add an event listener to detect changes in authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            //userInfoDisplay.innerHTML = `Signed in as: ${user.displayName} (${user.email})`;
            loginLabelh1.innerHTML = "You already login"
            signInButton.style.display = 'none'; // Hide the Sign In button
            signOutButton.style.display = 'block'; // Show the Sign Out button
        } else {
            // User is signed out
            //userInfoDisplay.innerHTML = 'Signed out';
            loginLabelh1.innerHTML = "Login Account"
            signInButton.style.display = 'block'; // Show the Sign In button
            signOutButton.style.display = 'none'; // Hide the Sign Out button
        }
    });

}

export function LoginChecker() {
    const LandingLoginBtn = document.getElementById('landing_login_btn');

    // Add an event listener to detect changes in authentication state
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            console.log("User login...");
            LandingLoginBtn.innerHTML = 'LOGOUT';

            // Add an event listener for the Sign Out button
            LandingLoginBtn.addEventListener('click', () => {
                signOut(auth)
                    .then(() => {
                        console.log("Sign out")

                        window.location.href = 'login.html';
                    })
                    .catch((error) => {
                        console.error('Sign-out error:', error);
                    });
            });


        } else {
            // User is signed out
            console.log("No user login...");
            LandingLoginBtn.innerHTML = 'LOGIN';

            LandingLoginBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        }
    });

}


export function SignupAccount() {
    const signupForm = document.querySelector('.signup')
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault()

        const signup_email = signupForm.signup_email.value
        const signup_password = signupForm.signup_password.value

        console.log(signup_email)

    createUserWithEmailAndPassword(auth, signup_email, signup_password)
    .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;

        // Add displayName
        updateProfile(user, {
            displayName: "Janjan"
        })
        .then(() => {
            // Profile updated successfully
            console.log('User created:', user);
            console.log('User display name:', user.displayName);

            console.log("HELlo")
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

    })
}

// For Applicant View
export function SignupApplicantAccount() {
    
    const storageRef = ref(storage, "Applicant/Requirements");

    const ApplicantColRef = collection(db, 'Applicant Information')

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

            const addApplicantForm = document.querySelector("#applicant_info_form")
            addApplicantForm.addEventListener('submit', (e) => {
                e.preventDefault()
 
                console.log(ApplicantName);
                console.log(ApplicantEmail);
                console.log(ApplicantPassword);
                console.log(ApplicantConfirmPassword);

                createUserWithEmailAndPassword(auth, ApplicantEmail, ApplicantPassword)
                .then((userCredential) => {
                  // Signed up 
                  const user = userCredential.user;
                  console.log(user);
              
                  // Add displayName
                  updateProfile(user, {
                    displayName: ApplicantName
                  })
                    .then(() => {
                        const fileInput = addApplicantForm.querySelector('input[type="file"]');
                        const selectedFiles = fileInput.files;
                    
                        if (selectedFiles.length > 0) {
                          const addDtrForm = document.querySelector("#applicant_info_form"); // Declare it here
                    
                          const uploadPromises = [];
                          const fileNeedUpload = [];
                          const fileURL = [];
                    
                          for (let i = 0; i < selectedFiles.length; i++) {
                            const selectedFile = selectedFiles[i];
                            
                            // Generate a unique filename by appending a timestamp
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

                            // Get the selected sex value
                            const selectedSex = addApplicantForm.querySelector('input[name="sex"]:checked');
                            const sexValue = selectedSex ? selectedSex.value : null;

                            // Get the selected civil status value
                            const civilStatusSelect = addApplicantForm.querySelector('#inputState');
                            const civilStatusValue = civilStatusSelect.value;

                            // Get the selected birthday value
                            const birthdayInput = addApplicantForm.querySelector('#birthday');
                            const birthdayValue = birthdayInput.value;

                    
                              const data = {
                                userID: user.uid,
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
                                Message: addApplicantForm.message.value,
                                createdAt: serverTimestamp(),
                              };
                    
                              for (let i = 0; i < fileURL.length; i++) {
                                data[`file${i + 1}`] = fileURL[i]; // Add each fileURL content to data
                              }
                    
                              // Add data to Firestore with an automatically generated ID
                              addDoc(ApplicantColRef, data)
                              .then((docRef) => {
                                const customDocId = docRef.id;
                                // Update the document with the custom ID
                                return setDoc(doc(ApplicantColRef, customDocId), { documentID: customDocId }, { merge: true });
                              })
                              .then(() => {
                                addDtrForm.reset();
                                console.log("Added employee successfully...");
                                window.location.href = 'landing.html'
                              })
                              .catch(error => console.error('Error adding document:', error));
                            
                            })
                            .catch((error) => console.error('Error adding document:', error));
                        } else {
                          console.error('No file selected');
                        }

                        
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

            })

        } else {
            console.log("There's something wrong...")
        }

    });
    
}

window.addEventListener('load', SignupApplicantAccount);
window.addEventListener('load', LoginChecker);
window.addEventListener('load', LoginMethod);
window.addEventListener('load', SignupAccount);






/*

Baka magamit


// For Applicant View
export function SignupApplicantAccount() {

    const ApplicantColRef = collection(db, 'Applicant Information')

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

            const addApplicantForm = document.querySelector("#applicant_info_form")
            addApplicantForm.addEventListener('submit', (e) => {
                e.preventDefault()

                console.log(ApplicantName);
                console.log(ApplicantEmail);
                console.log(ApplicantPassword);
                console.log(ApplicantConfirmPassword);

                createUserWithEmailAndPassword(auth, ApplicantEmail, ApplicantPassword)
                .then((userCredential) => {
                  // Signed up 
                  const user = userCredential.user;
              
                  // Add displayName
                  updateProfile(user, {
                    displayName: ApplicantName
                  })
                    .then(() => {
                      // Profile updated successfully
                      console.log('User created:', user);
                      console.log('User display name:', user.displayName);

                      // Get the selected sex value
                        const selectedSex = addApplicantForm.querySelector('input[name="sex"]:checked');
                        const sexValue = selectedSex ? selectedSex.value : null;

                        // Get the selected civil status value
                        const civilStatusSelect = addApplicantForm.querySelector('#inputState');
                        const civilStatusValue = civilStatusSelect.value;

                        // Get the selected birthday value
                        const birthdayInput = addApplicantForm.querySelector('#birthday');
                        const birthdayValue = birthdayInput.value;

                      addDoc(ApplicantColRef, {
                            userID: user.uid,
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
                            Message: addApplicantForm.message.value,
                            createdAt: serverTimestamp()
                      })
          
                          .then(() => {
                              addApplicantForm.reset()
                              console.log("Added employee successfully...")
                              
                               window.location.href = 'landing.html';
                          })
          


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

            })

        } else {
            console.log("There's something wrong...")
        }

    });
    
}



*/