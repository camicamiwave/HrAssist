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

const auth = getAuth();

const storage = getStorage(app);

export function AdminAccountInformation() {

    const AccountColRef = collection(db, 'User Account');
    const storageRef = ref(storage, "Account/Admin/ProfilePicture");

    document.getElementById("OtherInformationLayout").style.display = 'none';
    document.getElementById("PersonalInformationLayout").style.display = 'none';

    // For buttons
    const step1ForwardBtn = document.getElementById('Step1NextBtn');
    const step2BackBtn = document.getElementById('Step2BackBtn');
    const step2ForwardBtn = document.getElementById('Step2NextBtn');
    const step3BackBtn = document.getElementById('Step3BackBtn');
    const SubmitBtn = document.getElementById('SubmitBtn');

    // for sections
    const accountInfoSection = document.getElementById('AccountInfoSection');
    const otherInfoSection = document.getElementById('OtherInfoSection');
    const personalInfoSection = document.getElementById('PersonalInfoSection');

    // for forms
    const addAccountInfoForm = document.querySelector("#Account_Information_Form");
    const addOtherInfoForm = document.querySelector("#Other_Information_Form");
    const addPersonalInfoForm = document.querySelector("#Personal_Information_Form");

    step1ForwardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (addAccountInfoForm.inputPassword.value === addAccountInfoForm.inputConfirmPassword.value) {

            document.getElementById("AccountInfoLayout").style.display = 'none';
            document.getElementById("OtherInformationLayout").style.display = 'block';
            document.getElementById("PersonalInformationLayout").style.display = 'none';

            accountInfoSection.classList.remove('active');
            otherInfoSection.classList.add('active');
        } else {
            console.log("Please check your password...")
        }

    });

    step2BackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("AccountInfoLayout").style.display = 'block';
        document.getElementById("OtherInformationLayout").style.display = 'none';
        document.getElementById("PersonalInformationLayout").style.display = 'none';

        accountInfoSection.classList.add('active');
        otherInfoSection.classList.remove('active');
    });

    step2ForwardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("AccountInfoLayout").style.display = 'none';
        document.getElementById("OtherInformationLayout").style.display = 'none';
        document.getElementById("PersonalInformationLayout").style.display = 'block';

        otherInfoSection.classList.remove('active');
        personalInfoSection.classList.add('active');
    });

    step3BackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("AccountInfoLayout").style.display = 'none';
        document.getElementById("OtherInformationLayout").style.display = 'block';
        document.getElementById("PersonalInformationLayout").style.display = 'none';
        //otherInfoSection.classList.add('active');

        otherInfoSection.classList.add('active');
        personalInfoSection.classList.remove('active');
    });

    SubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();

        console.log("Done...")

        const ApplicantEmailAddres = addAccountInfoForm.PesonalInputEmail.value;
        const ApplicantPassword = addAccountInfoForm.inputPassword.value;
        const ApplicantUsername = addOtherInfoForm.inputUsername.value;

        createUserWithEmailAndPassword(auth, ApplicantEmailAddres, ApplicantPassword)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;

                // Add displayName
                updateProfile(user, {
                    displayName: ApplicantUsername,
                    emailVerified: true,
                }).then(() => {
                    // Profile updated successfully
                    console.log('User created:', user);
                    console.log('User display name:', user.displayName);

                    //const fileInput = addOtherInfoForm.querySelector('input[name="fileInput"]');
                    const fileInput = document.getElementById('fileInput');
                    const selectedFiles = fileInput.files;  
                    const firstSelectedFile = selectedFiles[0];  // Access the first file
      
                    
                    const timestamp = new Date().getTime();
                    const uniqueFilename = `${timestamp}_${firstSelectedFile.name}`;
                    const fileRef = ref(storageRef, uniqueFilename);

                    const uploadPromise = uploadBytes(fileRef, firstSelectedFile)
                        .then((snapshot) => getDownloadURL(fileRef))
                        .then((downloadURL) => {

                            const AdminData = {
                                userID: user.uid,
                                UserLevel: "Admin",
                                Email: addAccountInfoForm.PesonalInputEmail.value,
                                createdAt: serverTimestamp(),
                                AccountStatus: "Active",
                                Account_Information: {
                                    Username: addOtherInfoForm.inputUsername.value,
                                    JobPosition: addOtherInfoForm.inputJobPosition.value,
                                    Bio: addOtherInfoForm.inputBio.value,
                                    ProfilePictureURL: downloadURL,
                                },
                                Personal_Information: {
                                    FirstName: addPersonalInfoForm.inputFirstName.value,
                                    MiddleName: addPersonalInfoForm.inputMiddleName.value,
                                    LastName: addPersonalInfoForm.inputLastName.value,
                                    ExName: addPersonalInfoForm.inputExName.value,
                                    Gender: addPersonalInfoForm.gender.value,
                                    Email: addPersonalInfoForm.inputEmail.value,
                                    Phone: addPersonalInfoForm.inputPhone.value,
                                    Birthdate: addPersonalInfoForm.inputBirthdate.value,
                                    Birthplace: addPersonalInfoForm.inputBirthplace.value,
                                    Citizenship: addPersonalInfoForm.inputCitizenship.value,
                                    Address: addPersonalInfoForm.inputAddress.value,
                                    ZipCode: addPersonalInfoForm.inputZip.value,
                                }
                            }
                            // Add data to Firestore with an automatically generated ID
                            return addDoc(AccountColRef, AdminData);
                        })
                        .then((docRef) => {
                            const customDocId = docRef.id;
                            // Update the document with the custom ID
                            return setDoc(doc(AccountColRef, customDocId), { documentID: customDocId }, { merge: true });
                        })
                        .then(() => {
                            addPersonalInfoForm.reset();
                            console.log("Added admin successfully...");

                            Swal.fire({
                                position: "center",
                                icon: "success",
                                title: "Admin added successfully",
                                showConfirmButton: true, // Change to true to show a confirm button
                                // Add a confirm button handler
                                confirmButtonText: 'Confirm', // Customize the button text
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    // User clicked the confirm button
                                    window.location.href = 'admin_dashboard.html';
                                }
                            });
                        })
                        .catch(error => console.error('Error adding employee document:', error));
                    })  
                    

            });

    });



}

window.addEventListener('load', AdminAccountInformation)