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

                active = data.ApplicationProgess;
                updateProgress();

                if (data.ApplicantScheduled) {
                    applicantScheduled.innerHTML = data.ApplicantScheduled
                    applicantScheduled.style.display = 'block'
                }


                // checker if hired na
                if (active === 4) {
                    // Change behavior to simulate a cancel button
                    progressBar.style.backgroundColor = "blue";
                    progressNext.disabled = true;
                    progressPrev.disabled = true;
                    progressBack.disabled = true;
                }

                if (data.ApplicantStatus === 'Rejected') {
                    // Change behavior to simulate a cancel button
                    progressBar.style.backgroundColor = "red";
                    progressNext.disabled = true;
                    progressPrev.disabled = true;
                    progressBack.disabled = true;
                }

                // for progess or next ------------------------------------->
                progressNext.addEventListener("click", () => {

                    if (active > steps.length) {
                        active = steps.length;
                    }

                    if (active === 3) {
                        Swal.fire({
                            title: "Are you sure?",
                            text: "Applicant's application status will be set as hired",
                            icon: "question",
                            showCancelButton: true,
                            confirmButtonColor: "#3085d6",
                            cancelButtonColor: "#d33",
                            confirmButtonText: "Confirm"
                        }).then((result) => {
                            if (result.isConfirmed) {

                                const datatoUpload = {
                                    ApplicationProgess: active + 1,
                                    ApplicantStatus: 'Hired'
                                }

                                ReturnDocumentID(customDocId, datatoUpload)

                                Swal.fire({
                                    title: 'Congratulations!',
                                    text: "Applicant's application status is updated as hired.",
                                    icon: 'success',
                                });

                            } else {
                                active = 3
                            }
                        })

                    } else {

                        const datatoUpload = {
                            ApplicationProgess: active + 1
                        }

                        ReturnDocumentID(customDocId, datatoUpload)
                    }

                    console.log(active)
                    updateProgress();
                });

                // for back ------------------------------------->
                progressBack.addEventListener('click', () => {

                    if (active !== 1) {
                        const datatoUpload = {
                            ApplicationProgess: active - 1
                        }

                        ReturnDocumentID(customDocId, datatoUpload)
                    }



                    console.log(active)
                    updateProgress();
                })

                progressPrev.addEventListener("click", () => {

                    Swal.fire({
                        title: "Are you sure?",
                        text: "You won't revert this",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Yes, Reject it"
                    }).then((result) => {
                        if (result.isConfirmed) {

                            const datatoUpload = {
                                ApplicationProgess: active,
                                ApplicantStatus: 'Rejected'
                            }

                            ReturnDocumentID(customDocId, datatoUpload)

                            Swal.fire({
                                title: 'Rejected!',
                                text: "Applicant's application status is updated as rejected.",
                                icon: 'success',
                            });


                            // Change behavior to simulate a cancel button
                            progressBar.style.backgroundColor = "red";
                            progressNext.disabled = true;
                            progressPrev.disabled = true;
                            progressBack.disabled = true;

                        }
                    })
                });


            });

        });

    } catch {
        console.log("There was an error...")
    }
}

window.addEventListener('load', FetchApplicationStatus)


function ReturnDocumentID(customID, progess) {
    const RequestcolRef = collection(db, 'Applicant Information');

    return setDoc(doc(RequestcolRef, customID), progess, { merge: true });
}

function AddInterviewSchedule() {
    try {
        const addScheduleBtn = document.getElementById('addScheduleBtn');
        const scheduleForm = document.querySelector('#scheduleForm');

        // Get the query string from the URL
        const queryString = window.location.search;

        // Create a URLSearchParams object from the query string
        const urlParams = new URLSearchParams(queryString);

        // Get the values of the customDocId and id parameters
        const customDocId = urlParams.get('data');

        addScheduleBtn.addEventListener('click', (e) => {
            const createdAt = serverTimestamp(); // Get the timestamp

            const interviewDetails = {
                createdAt: createdAt,
                InterviewDate: scheduleForm.scheduleDate.value.trim(),
                InterviewTime: scheduleForm.scheduleTime.value.trim(),
                InterviewDesc: scheduleForm.scheduleDescription.value.trim(),
            };

            const designationCollectionRef = collection(db, 'Applicant Information', customDocId, 'Interviews');

            addDoc(designationCollectionRef, interviewDetails)
                .then(docRef => {
                    const documentId = docRef.id;
                    return setDoc(doc(designationCollectionRef, documentId), { interviewDocumentID: documentId }, { merge: true });
                }).then(() => {
                    alert("Interview saved successfully...");
                    scheduleForm.reset();
                })
                .catch(error => {
                    console.error('Error adding document: ', error);
                });
        });

    } catch (error) {
        console.error('Error in AddInterviewSchedule:', error);
    }
}

window.addEventListener('load', AddInterviewSchedule);
