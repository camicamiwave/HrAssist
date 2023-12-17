
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
import { FetchCurrentUser } from './employee_pass_slip.js';


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

console.log("hello world")

function fetchAdmin() {
    const UsercolRef = collection(db, 'User Account'); 

    FetchCurrentUser().then((currentUserUID) => { 

        fetchEmployeeInfo(UsercolRef, currentUserUID, "userID").then((dataRetrieved) => {
            const userData = dataRetrieved; 
    

            admin_profile.src = userData.Account_Information.ProfilePictureURL
            usernameProfile.innerHTML = userData.Account_Information.Username
            userLevel.innerHTML = userData.Account_Information.JobPosition

            about_info.innerHTML = userData.Account_Information.About
            fullName.innerHTML = userData.Account_Information.Username
            citizenship.innerHTML = userData.Personal_Information.Citizenship
            gender.innerHTML = userData.Personal_Information.Gender
            bdate.innerHTML = userData.Personal_Information.Birthdate
            bplace.innerHTML = userData.Personal_Information.Birthplace
            phone.innerHTML = userData.Personal_Information.Phone
            email.innerHTML = userData.Personal_Information.Email
            address.innerHTML = userData.Personal_Information.Address
            

            AdminProfile_Picture.src = userData.Account_Information.ProfilePictureURL
            Adminabout.value = userData.Account_Information.About

            Birthdate.value = userData.Personal_Information.Birthdate
            Birthplace.value = userData.Personal_Information.Birthplace
            AdminGender.value = userData.Personal_Information.Gender
            AdminName.value = userData.Account_Information.Username
            AdminPhone.value = userData.Personal_Information.Phone
            AdminEmail.value = userData.Personal_Information.Email
            AdminCitizenship.value = userData.Personal_Information.Citizenship
            AdminAddress.value = userData.Personal_Information.Address 

            saveChangesBtn.addEventListener('click', (e) => {
                const updateInfo = {
                    Account_Information: {
                        About: Adminabout.value,
                        JobPosition: userData.Account_InformationJobPosition,
                        Username: AdminName.value
                    },
                    Personal_Information: {
                        FirstName: userData.Personal_Information.FirstName,
                        MiddleName: userData.Personal_Information.MiddleName,
                        LastName: userData.Personal_Information.LastName,
                        ExName: userData.Personal_Information.ExName,
                        Gender: AdminGender.value,
                        Citizenship: AdminCitizenship.value,
                        Birthdate: Birthdate.value,
                        Birthplace: Birthplace.value,
                        Email: AdminEmail.value,
                        ZipCode: userData.Personal_Information.ZipCode,
                        Phone: AdminPhone.value
                    } 
                }

                return setDoc(doc(UsercolRef, userData.documentID), updateInfo, { merge: true })
                .then(() => {
                  // Success handler
                  Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Document updated successfully!',
                  });
                })
                .catch((error) => {
                  // Error handler
                  console.error('Error updating document:', error);
            
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while updating the document. Please try again.',
                  });
                });


            })

    
        })
    });

    
}

window.addEventListener('load', fetchAdmin)

 