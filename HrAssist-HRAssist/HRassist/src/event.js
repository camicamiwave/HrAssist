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

const colRef = collection(db, 'Event Information')

const auth = getAuth();

const storage = getStorage(app);

export function AddEventForm() {
    const submitBtn = document.getElementById('btnSubmit');
    const eventForm = document.querySelector('.add-event');

    const eventsCollectionRef = collection(db, 'Events');

    submitBtn.addEventListener('click', (event) => {
        event.preventDefault();

        const eventName = document.querySelector('.event-name').value;
        const participants = document.getElementById('participants').value;
        const tagColor = document.querySelector('.tag-color').value;
        const startFrom = document.querySelector('.start-from').value;
        const endTo = document.querySelector('.end-to').value;

        const formData = {
            eventName: eventName,
            participants: participants,
            tagColor: tagColor,
            startFrom: startFrom,
            endTo: endTo,
        };

        addDoc(eventsCollectionRef, formData)
            .then((docRef) => {
                console.log("Event saved with ID: ", docRef.id);
                // You can perform additional actions or show a success message to the user here
                Swal.fire({
                    title: 'Event Saved!',
                    text: 'Your event has been successfully saved.',
                    icon: 'success',
                });
                eventForm.reset(); // Reset the form after successful submission
            })
            .catch((error) => {
                console.error("Error occurred:", error);
                // You can handle the error here, e.g., show a custom error message to the user
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while saving your event. Please try again.',
                    icon: 'error',
                });
            });
    });
}


