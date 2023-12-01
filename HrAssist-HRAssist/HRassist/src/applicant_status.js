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

export function FetchApplicationStatus() {

    try {
        
        // Get the query string from the URL
        const queryString = window.location.search;

        // Create a URLSearchParams object from the query string
        const urlParams = new URLSearchParams(queryString);

        // Get the values of the customDocId and id parameters
        const customDocId = urlParams.get('data');

        // Log or use the retrieved values
        console.log(`Custom Doc ID: ${customDocId}`);

        const TestcolRef = collection(db, 'Applicant Information');
        const ApplicantQue = query(TestcolRef, where('documentID', '==', customDocId))

        onSnapshot(ApplicantQue, (snapshot) => {
            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;

                const applicantFullName = document.getElementById('applicantFullName');
                const applicantID = document.getElementById('applicantID');
                const applicantStatus = document.getElementById('applicantStatus');
                const applicantScheduled = document.getElementById('applicantScheduled');
                const applicantGender = document.getElementById('applicantGender')

                console.log(data)


                const fullname = `${data.Personal_Information.FirstName} ${data.Personal_Information.LastName}`
                applicantFullName.innerHTML = fullname

                applicantProfile.src = data.ProfilePicURL 
                
                applicantID.innerHTML = data.ApplicantID
                applicantStatus.innerHTML = data.ApplicantStatus
                applicantFname.innerHTML = data.Personal_Information.FirstName
                applicantMname.innerHTML = data.Personal_Information.MiddleName
                applicantLname.innerHTML = data.Personal_Information.LastName
                applicantExName.innerHTML = data.Personal_Information.ExName
                applicantGender.innerHTML = data.Personal_Information.Gender
                applicantCivilStatus.innerHTML = data.Personal_Information.CivilStatus
                applicantBdate.innerHTML = data.Personal_Information.Birthdate
                applicantBplace.innerHTML = data.Personal_Information.PlaceBirth
                applicantBplace.innerHTML = data.Personal_Information.PlaceBirth
                applicantMobileNum.innerHTML = data.Personal_Information.Phone
                applicantEmail.innerHTML = data.Personal_Information.Email
                applicantAddress.innerHTML = data.Personal_Information.Address

                if (data.ApplicantScheduled){
                    applicantScheduled.innerHTML = data.ApplicantScheduled
                    applicantScheduled.style.display = 'block'
                }


            });

        });
           
    } catch {
        console.log("There was an error...")
    } 
}

window.addEventListener('load', FetchApplicationStatus)

