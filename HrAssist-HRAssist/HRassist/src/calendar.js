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
import { fetchEmployeeInfo } from './fetch_employee_info.js';


// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const db = getFirestore();

function validateForm() {
  
  
    var eventnameInput = document.getElementById('event-name');
    var particpantInput = document.getElementById('inputOffice');
    var startfromInput = document.getElementById('start-from');
    var endtoInput = document.getElementById('end-to');

       if (
       eventnameInput.value.trim() === '' ||
       particpantInput.value.trim() === '' ||
       startfromInput.value.trim() === '' ||
       endtoInput.value.trim() === ''
     ) {
        console.log('Please fill in all required fields.');
        Swal.fire({
            title: 'Error',
            text: 'Please fill in all required fields.',
            icon: 'error',
        });
       return false;
     }
    

     if (!isValidString(eventnameInput.value)) {
        console.log('Please input valid informatiom');
        Swal.fire({
            title: 'Error',
            text: 'Please input valid informatiom',
            icon: 'error',
        });
         return false;
     }

     

     return true;
 }


 function isValidString(value) {

     return /^[a-zA-Z\s]*$/.test(value.trim());
 }

function AddEventsCalendar() {
    const CalendarcolRef = collection(db, 'Calendar Information');

    document.getElementById('btnSubmit').addEventListener('click', () => {

        if  (validateForm()) {
            
        const eventName = document.querySelector('.event-name').value;
        const participants = document.getElementById('inputOffice').value;
        const tagColor = document.querySelector('.tag-color').value;
        const startFrom = document.querySelector('.start-from').value;
        const endTo = document.querySelector('.end-to').value;
        
        const purposeLabel = document.getElementById('purpose').value;

        const leaveFormData = {
            createdAt: serverTimestamp(),
            eventPurpose: purposeLabel,
            formData: {
                participants: participants,
                title: eventName,
                start: startFrom,
                end: endTo,
                color: tagColor
            },
            EventStatus: 'Active'
        };
        

        Swal.fire({
            title: 'Are you sure?',
            text: 'Event will be saved to the calendar.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm'
        }).then((result) => {
            if (result.isConfirmed) {
                return addDoc(CalendarcolRef, leaveFormData);
            } else {
                return Promise.reject(new Error('User canceled'));
            }
        }).then((docRef) => {
            ReturnDocumentID(docRef)

            Swal.fire({
                title: 'Event Added!',
                text: 'Your event has been added to the calendar.',
                icon: 'success',
            })
                .then(() => {
                    const calendarForm = document.querySelector('#calendarForm')
                    calendarForm.reset()
                    // Redirect to the dashboard page
                    //window.location.href = 'employee_home.html';
                });
        }).catch((error) => {
            if (error.message !== 'User canceled') {
                console.error('Error occurred:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while processing your request. Please try again.',
                    icon: 'error',
                });
            }
        });
    } else {
        console.log('Form is not valid. Please correct errors.');
    }


    });
}



function ReturnDocumentID(docRef) {
    const RequestcolRef = collection(db, 'Calendar Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(RequestcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}



// Attach the event listener to the button
document.addEventListener('DOMContentLoaded', AddEventsCalendar);

window.addEventListener('load', fetchCalendarActivites);

function fetchCalendarActivites() {
    // Get the calendar element
    var calendarEl = document.getElementById('calendar');

    // Initialize FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        navLinks: true,
        headerToolbar: {
            left: 'prev today next',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
        },

        eventClick: function (arg) {
            // Trigger the Bootstrap modal
            $('#deleteModal').modal('show');

            // Store the event in a variable for later use
            var currentEvent = arg.event;

            // Handle the confirm delete button click
            $('#confirmDelete').on('click', function () {
                // Close the Bootstrap modal
                $('#deleteModal').modal('hide');

                // Remove the event from the calendar
                currentEvent.remove();

                // Access the ID of the event
                var eventId = currentEvent.id;

                Swal.fire({
                    title: "Are you sure?",
                    text: "You won't be able to revert this!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, delete it!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: "Deleted!",
                            text: "Your file has been deleted.",
                            icon: "success"
                        }).then(() => { 
                            const CalendarcolRef = collection(db, 'Calendar Information');
                            const docRef = doc(CalendarcolRef, eventId);

                            deleteDoc(docRef)
                                .then(() => {
                                    console.log('Document successfully deleted!');
                                })
                                .catch((error) => {
                                    console.error('Error deleting document: ', error);
                                });
                        });
                    }
                });


            });
        },
        editable: true,
        dayMaxEvents: true,
        events: [] // Initialize with an empty array
    });

    // Render the initial calendar
    calendar.render();

    // Firestore setup
    const CalendarcolRef = collection(db, 'Calendar Information');
    const que = query(CalendarcolRef);

    // Listen for changes in the Firestore collection
    onSnapshot(que, (snapshot) => {
        const events = [];

        // Iterate through each document in the collection
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;
            const calendarActivities = data.formData;

            console.log(calendarActivities, 'asfs');

            // Assuming `calendarActivities` contains necessary properties
            events.push({
                id: id,
                ...calendarActivities
            });
        });

        // Remove existing events from the calendar
        calendar.getEvents().forEach((existingEvent) => {
            existingEvent.remove();
        });

        // Add all collected events to the calendar's events array
        calendar.addEventSource(events);

        // Render the calendar after updating events
        calendar.render();
    });
}

function fetchOfficeDesignation() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));

    const inputOffice = document.getElementById('inputOffice');
    inputOffice.innerHTML = '<option>All</option>';

    onSnapshot(que, (snapshot) => {
        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            const id = doc.id;

            // Create an option element for each OfficeName and append it to the selector
            const optionElement = document.createElement('option');
            optionElement.value = data.OfficeName;
            optionElement.textContent = data.OfficeName;
            inputOffice.appendChild(optionElement);
        });
    });
 
}

window.addEventListener('load', fetchOfficeDesignation);