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
    query, where, arrayUnion,
    orderBy, serverTimestamp,
    getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);


function SearchEmployee() {

    const searchEmployeeBtn = document.getElementById('searchEmployeeBtn');
    const DTR_Section = document.getElementById('DTR_Section');
    const EmployeecolRef = collection(db, 'Employee Information');

    searchEmployeeBtn.addEventListener('click', (e) => {

        const searchEmployeeFname = document.getElementById('searchEmployeeFname').value;
        const searchEmployeeMname = document.getElementById('searchEmployeeMname').value;
        const searchEmployeeLname = document.getElementById('searchEmployeeLname').value;
        const searchEmployeeExName = document.getElementById('searchEmployeeExName').value;

        try {

            const conditions = [
                where("Personal_Information.FirstName", "==", searchEmployeeFname.trim()),
                where("Personal_Information.MiddleName", "==", searchEmployeeMname.trim()),
                where("Personal_Information.SurName", "==", searchEmployeeLname.trim())
            ];

            if (searchEmployeeExName !== "") {
                conditions.push(where("Personal_Information.ExName", "==", searchEmployeeExName.trim()));
            }

            const que = query(EmployeecolRef, ...conditions);

            // for retrieving the current user
            onSnapshot(que, (snapshot) => {
                if (!snapshot.empty) {
                    snapshot.docs.forEach((docData) => {
                        const data = docData.data();
                        const employeeDocID = data.documentID;

                        console.log(data);
                        alert("A record was retrieved.");

                        // Assuming you want to add the employeeDocID to the URL without reloading
                        const url = `admin-IPCRF-search.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);

                        searchEmployeeBtn.style.display = 'none';


                        ipcrfScheduleChecker.style.display = 'block'
                        ipcrfFormLayout.style.display = 'block'

                        return

                        //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;
                    });
                } else {
                    alert("No record retrieved.");
                    console.log("No record retrieved.");

                    return
                }
            });


        } catch {

            console.log("No record retrieved.");
        }


    })

}

window.addEventListener('load', SearchEmployee)


async function CheckIPCRFRecord() {

    const ipcrfCheckRecordBtn = document.getElementById('ipcrfCheckRecordBtn');
    const DTRcolRef = collection(db, 'IPCRF Information');

    ipcrfCheckRecordBtn.addEventListener('click', (e) => {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const receivedStringData = urlParams.get('data');
            const receivedipcrfID = urlParams.get('ipcrfID');

            const semesterSelector = document.getElementById('semesterSelector').value;
            const yearSelctor = document.getElementById('yearSelctor').value;

            try {

                const conditions = [
                    where("ForTheSemester", "==", semesterSelector.trim()),
                    where("ForTheYear", "==", yearSelctor.trim()),
                    where("employeeDocID", "==", receivedStringData.trim())
                ];


                const que = query(DTRcolRef, ...conditions);

                // for retrieving the current user
                onSnapshot(que, (snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.docs.forEach((docData) => {
                            const data = docData.data();
                            const ipcrfID = data.documentID;

                            // Assuming you want to add the employeeDocID to the URL without reloading
                            const url = `admin-IPCRF-search.html?data=${encodeURIComponent(receivedStringData)}&ipcrfID=${ipcrfID}&retrieved_data=true`;

                            // Use pushState to update the URL
                            window.history.pushState({ path: url }, '', url);
                            //ipcrfCheckRecordBtn.style.display = 'none';

                            const newsemesterSelector = document.getElementById('semesterSelector')
                            const newyearSelctor = document.getElementById('yearSelctor')

                            newsemesterSelector.value = data.ForTheSemester
                            newyearSelctor.value = data.ForTheYear
                            totalRating.value = data.TotalRating
                            IPCRFdescription.value = data.Description


                            //createButtons(data.AttachmentURLs)
                            listOfAttachments(data.AttachmentURLs, data.ForTheSemester, data.ForTheYear, data.TotalRating)

                            return alert("IPCRF record was retrieved.");


                        });
                    } else {

                        const newsemesterSelector = document.getElementById('semesterSelector')
                        const newyearSelctor = document.getElementById('yearSelctor')

                        totalRating.value = ""
                        IPCRFdescription.value = ""

                        alert("No record retrieved.");
                        //ipcrfCheckRecordBtn.style.display = 'none';

                        console.log("No record retrieved.");

                        return

                    }
                });


            } catch {

                console.log("No record retrieved.");
            }

        } catch {
            console.log("No DTR record detected...")
        }
    })

}

window.addEventListener('load', CheckIPCRFRecord)

function fileReader() {
    document.getElementById('formFileMultiple').addEventListener('change', function (event) {
        const files = event.target.files;

        // Clear previous previews
        document.getElementById('filePreviewSection').innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                const filePreview = document.createElement('div');
                filePreview.className = 'alert alert-secondary';
                filePreview.textContent = `File Name: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}`;

                const imagePreview = document.createElement('img');
                imagePreview.className = 'img-fluid mt-2';
                imagePreview.src = e.target.result;

                filePreview.appendChild(imagePreview);
                document.getElementById('filePreviewSection').appendChild(filePreview);
            };

            reader.readAsDataURL(file);
        }
    });

}

window.addEventListener('load', fileReader)



export function SaveEmployeeIPCRF(dtrDetails) {
    const DTRcolRef = collection(db, 'IPCRF Information');

    Swal.fire({
        title: "Are you sure?",
        text: "The record of IPCRF for the semester will be saved on the system",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm"
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Confirm" 
            //ipcrfLeaveForm.reset()  
            return addDoc(DTRcolRef, dtrDetails)

        } else {
            // If the user clicks "Cancel", return a resolved promise
            return Promise.resolve();
        }
    }).then((docRef) => {
        if (docRef) {
            ReturnDocumentID(docRef);
            SaveAttachment(docRef)
            Swal.fire({
                title: 'Congratulations!',
                text: 'IPCRF saved successfully.',
                icon: 'success',
            }).then(() => {
                console.log('IPCRF saved successfully...');
                window.location.href = `admin-IPCRF-search.html`;
            })
        }
    }).catch((error) => {
        console.error("Error occurred:", error);
        // You can handle the error here, e.g., show a custom error message to the user
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your the DTR.s Please try again.',
            icon: 'error',
        });
    });


}


function GetIPCRF() {
    const SaveIPCRF = document.getElementById('SaveIPCRF')

    SaveIPCRF.addEventListener('click', (e) => {

        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');
        const receivedipcrfid = urlParams.get('ipcrfID')
        const receivedretrieved_data = urlParams.get('retrieved_data')

        if (semesterSelector.value && yearSelctor.value && totalRating.value) {

            const IPCRF_Details = {
                ForTheSemester: semesterSelector.value,
                ForTheYear: yearSelctor.value,
                TotalRating: totalRating.value,
                Description: IPCRFdescription.value,
                employeeDocID: receivedStringData,
                createdAt: serverTimestamp()
            }

            if (receivedretrieved_data === 'true') {
                updateDocument(IPCRF_Details, receivedipcrfid, receivedretrieved_data)
                return
            } else {
                SaveEmployeeIPCRF(IPCRF_Details)
            }

        } else {
            alert("Please provide the necessary information.")
        }

    })

}


window.addEventListener('load', GetIPCRF)


function updateDocument(IPCRF_Details, receivedipcrfid, receivedretrieved_data) {
    const DTRcolRef = collection(db, 'IPCRF Information');

    //return setDoc(doc(DTRcolRef, receivedipcrfid), IPCRF_Details, { merge: true })
    const docRef = doc(DTRcolRef, receivedipcrfid);

    return setDoc(docRef, IPCRF_Details, { merge: true })
        .then(() => {
            // The document reference (docRef) is available here
            console.log("Document updated successfully:", docRef);

            const fileInput = document.getElementById('formFileMultiple');
            const selectedFiles = fileInput.files;

            if (selectedFiles.length > 0) {
                // There are selected files
                console.log("Files selected:", selectedFiles);
                SaveAttachment(docRef)
            } else {
                // No files selected
                console.log("No files selected.");
            }

            return docRef;
        })
        .catch((error) => {
            console.error("Error updating document:", error);
            throw error; // Propagate the error if needed
        });

}

function ReturnDocumentID(docRef) {
    const DTRcolRef = collection(db, 'IPCRF Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(DTRcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}



function SaveAttachment(docRef) {
    const storageRef = ref(storage, "IPCRF/Employee Reports");
    const RequestcolRef = collection(db, 'IPCRF Information');

    // Access the file input field
    const fileInput = document.getElementById('formFileMultiple');
    const selectedFiles = fileInput.files;

    // Create an array to store download URLs
    const downloadURLs = [];

    // Loop through each selected file
    const uploadPromises = Array.from(selectedFiles).map((file) => {
        // Generate a unique filename using timestamp
        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${file.name}`;
        const fileRef = ref(storageRef, uniqueFilename);

        // Upload the file to Firebase Storage
        return uploadBytes(fileRef, file)
            .then((snapshot) => getDownloadURL(fileRef))
            .then((downloadURL) => {
                downloadURLs.push(downloadURL);
            });
    });


    // Wait for all uploads to complete
    Promise.all(uploadPromises)
        .then(() => {
            // All files are uploaded, and their URLs are in the downloadURLs array
            console.log(downloadURLs);


            Swal.fire({
                title: "Are you sure?",
                text: "The record of IPCRF for the semester will be saved on the system",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {
                if (result.isConfirmed) {
                    const EmpcustomDocId = docRef.id;
                    return setDoc(
                        doc(RequestcolRef, EmpcustomDocId),
                        { AttachmentURLs: arrayUnion(...downloadURLs) },
                        { merge: true }
                    );

                } else {
                    // If the user clicks "Cancel", return a resolved promise
                    return Promise.resolve();
                }
            }).then((docRef) => {
                if (docRef) {
                    Swal.fire({
                        title: 'Congratulations!',
                        text: 'IPCRF updated successfully.',
                        icon: 'success',
                    }).then(() => {
                        console.log('IPCRF saved successfully...');
                        window.location.href = `admin-IPCRF-search.html`;
                    })
                }
            }).catch((error) => {
                console.error("Error occurred:", error);
                // You can handle the error here, e.g., show a custom error message to the user
                Swal.fire({
                    title: 'Error',
                    text: 'An error occurred while processing your the DTR.s Please try again.',
                    icon: 'error',
                });
            });



        })
        .catch((error) => {
            // Handle errors, if any
            console.error("Error uploading files:", error);
        });
}


// Function to handle button click
function handleButtonClick(url) {
    // You can perform actions based on the clicked URL
    console.log(`Button clicked for URL: ${url}`);
    window.open(url, '_blank');
    // Here, you might want to display the content associated with the URL
}

// Function to create buttons
function createButtons(listOfURLs) {

    const buttonContainer = document.getElementById('filePreviewSection1'); // Replace with your container ID

    listOfURLs.forEach((url, index) => {
        const button = document.createElement('button');
        button.textContent = `Attachments${index+1}`;
        button.style.background = 'white'
        button.addEventListener('click', () => handleButtonClick(url));

        // Append the button to the container
        buttonContainer.appendChild(button);
    });
}




function listOfAttachments(attachmentData, ForTheSemester, ForTheYear, TotalUnits) {

    ipcrfSemesterDate.innerHTML = `${ForTheSemester}`
    ipcrfSemesterYear.innerHTML = `${ForTheYear}`
    ipcrfTotalRating.innerHTML = `${TotalUnits}`
    
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');
    const receivedipcrfid = urlParams.get('ipcrfID')
    const receivedretrieved_data = urlParams.get('retrieved_data')

    listofAttachmentsRetrieved.style.display = 'block';

    var tableBody = document.getElementById('AttachmentsUrl');

    // Clear existing rows
    tableBody.innerHTML = '';

    let num = 1;

    // Loop through the AttachmentURLs object and add rows to the table
    for (const index in attachmentData) {
        if (attachmentData.hasOwnProperty(index)) {
            var row = tableBody.insertRow();
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);

            // Set values for each cell
            cell1.innerHTML = num; // You can set an ID or index here
            cell2.innerHTML = `<a href='${attachmentData[index]}' style='width: 60%; text-align: center'>Docs${num}</a>`;
            //cell3.innerHTML = '<button type="button" class="btn btn-danger" style="width: 40%; text-align: center">Delete</button>';

            // Assuming you have created the button and assigned it to the variable 'editButton'
            const deleteButton = document.createElement('button');

            deleteButton.textContent = `Delete`;
            deleteButton.className = 'btn btn-danger'; 
            deleteButton.style.backgroundColor = '#d9534f'
            deleteButton.style.width = '30%';
            deleteButton.id = `deletebtn${index}`;
            deleteButton.type = 'button'

            console.log(attachmentData,'asfsaf')

            // Add an event listener to the button
            deleteButton.addEventListener('click', function () {
                console.log('delete mo', index)


                Swal.fire({
                    title: "Are you sure?",
                    text: "Employee's attachment will be lost",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Confirm"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // If the user clicks "Confirm"

                        const itemList = attachmentData

                        // Alisin ang unang item (index 0)
                        itemList.splice(index, 1);

                        const newattachments = {
                            AttachmentURLs: itemList
                        }

                        const EmployeecolRef = collection(db, 'IPCRF Information');
                        const employeeDocRef = doc(EmployeecolRef, receivedipcrfid);


                        // Use setDoc to set the data in the document
                        return setDoc(employeeDocRef, newattachments,  { merge: true }).then(() => {
                            alert('Attachment deleted successfully')
                        }).then(() => {
                            window.location.href = `admin-IPCRF-search.html?data=${encodeURIComponent(receivedStringData)}}`;
                        })

                    } else {
                        // Handle the case where the user cancels the action
                    }
                });


            });

            cell3.appendChild(deleteButton);


        }
        num++;
    }
}