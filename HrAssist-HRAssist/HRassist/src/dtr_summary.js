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
    getDoc, updateDoc, setDoc, getDocs
} from 'firebase/firestore'

import { firebaseConfig } from './server.js';
import { fetchEmployeeInfo } from './fetch_employee_info.js';
import { FetchCurrentUser } from './employee_leave_form.js';

// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

const storage = getStorage(app);

function SearchDTR() {
    const DTR_Section = document.getElementById('tableSectionDTRSummary');
    const searchDTRBtn = document.getElementById('searchDTRBtn');
    const searchDTRLayout = document.getElementById('searchDTRLayout');

    const EmployeecolRef = collection(db, 'Employee Information');
    const DTRcolRef = collection(db, 'DTR Summary');
    const File201colRef = collection(db, '201File Information');

    searchDTRBtn.addEventListener('click', async (e) => {
        try {
            // I-disable ang button pagkatapos ng unang click
            searchDTRBtn.disabled = true;

            const monthSelector = document.getElementById('monthSelector').value;
            const yearSelctor = document.getElementById('yearSelctor').value;
            const inputOffice = document.getElementById('inputOffice').value;
            const weekSelctor = document.getElementById('weekSelctor').value;

            if (monthSelector !== "--- Select Month ---" && yearSelctor !== "--- Select Year ---" && inputOffice !== "--- Select Office ---" && weekSelctor !== "--- Select Year ---") {
                const conditions = [
                    where("ForTheMonth", "==", monthSelector.trim()),
                    where("ForTheYear", "==", yearSelctor.trim()),
                    where("ForTheWeek", "==", weekSelctor.trim()),
                    where("Office", "==", inputOffice.trim())
                ];

                const que = query(DTRcolRef, ...conditions);
                const snapshot = await getDocs(que);

                if (!snapshot.empty) {
                    // Data already retrieved
                    alert("A record was retrieved.");
                    DTR_Section.style.display = 'block';
                    // Assuming you want to add the employeeDocID to the URL without reloading
                    snapshot.docs.forEach((doc) => {
                        const data = doc.data();
                        // Process the data...

                        // Get the documentID
                        const documentID = doc.id;

                        const url = `admin_dtr_summary.html?dtrid=${encodeURIComponent(documentID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);

                    });

                    fetchDTRSummary()
                } else {
                    // Data not yet retrieved
                    console.log("No record retrieved.");

                    const result = await Swal.fire({
                        title: "No record found",
                        text: "Do you want to create a record for this week?",
                        icon: "info",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Confirm"
                    });

                    if (result.isConfirmed) {
                        // Process to create a record
                        const conditions = [
                            where("Appointment_Details.Office", "==", inputOffice.trim())
                        ];

                        const empque = query(File201colRef, ...conditions);
                        const empSnapshot = await getDocs(empque);

                        if (!empSnapshot.empty) {
                            const Employee_DTR_Details = {
                                createdAt: serverTimestamp(),
                                ForTheMonth: monthSelector,
                                ForTheYear: yearSelctor,
                                ForTheWeek: weekSelctor,
                                Office: inputOffice,
                                Employee_DTR: {}
                            };

                            empSnapshot.docs.forEach((officedocData) => {
                                const data = officedocData.data();
                                const employee_docid_conditions = [
                                    where("documentID", "==", data.employeeDocID)
                                ];

                                const employee_que = query(EmployeecolRef, ...employee_docid_conditions);

                                onSnapshot(employee_que, (snapshot) => {
                                    if (!snapshot.empty) {
                                        snapshot.docs.forEach((employeedocData) => {
                                            const empdata = employeedocData.data();
                                            const employeeKey = empdata.documentID;

                                            Employee_DTR_Details.Employee_DTR[employeeKey] = {
                                                employeeDocID: empdata.documentID,
                                                employeeFullName: `${empdata.Personal_Information.FirstName} ${empdata.Personal_Information.SurName}`,
                                                RequiredHours: 40,
                                                ActualHours: 40,
                                                NoTimeLateIn: "",
                                                MinsLateIn: "",
                                                NoTimeEarlyLeave: "",
                                                MinsEarlyLeave: "",
                                                regularOvertime: "",
                                                specialOvertime: "",
                                                businessTrip: "",
                                                atnd: "",
                                                absent: "",
                                                leave: "",
                                            };
                                        });
                                    }
                                });
                            });



                            await SaveEmployeeDTR(Employee_DTR_Details);
                            alert('DTR Saved Successfully');
                            DTR_Section.style.display = 'block';
                        }
                    }
                }
            } else {
                alert("Please provide required fields");
            }
        } catch (error) {
            console.log("There was an error:", error);
        } finally {
            // Enable the button in case of any error
            searchDTRBtn.disabled = false;
        }
    });
}

window.addEventListener('load', SearchDTR);

export async function SaveEmployeeDTR(dtrDetails) {
    const DTRcolRef = collection(db, 'DTR Summary');

    try {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "Weekly DTR will be saved in the system",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Confirm"
        });

        if (result.isConfirmed) {
            const docRef = await addDoc(DTRcolRef, dtrDetails);
            ReturnDocumentID(docRef);
            Swal.fire({
                title: 'Congratulations!',
                text: 'Monthly DTR saved successfully.',
                icon: 'success',
            });
            console.log('Monthly DTR saved successfully...');
        } else {
            // If the user clicks "Cancel", return a resolved promise
            return Promise.resolve();
        }
    } catch (error) {
        console.error("Error occurred:", error);
        // You can handle the error here, e.g., show a custom error message to the user
        Swal.fire({
            title: 'Error',
            text: 'An error occurred while processing your the DTR. Please try again.',
            icon: 'error',
        });
    }
}

function ReturnDocumentID(docRef) {
    const DTRcolRef = collection(db, 'DTR Summary');
    const EmpcustomDocId = docRef.id;

    return setDoc(doc(DTRcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}

function fetchOfficeDesignation() {
    const OfficecolRef = collection(db, 'Office Information');
    const que = query(OfficecolRef, orderBy('createdAt'));

    const inputOffice = document.getElementById('inputOffice');
    inputOffice.innerHTML = '<option>--- Select Office ---</option>';

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

    // Add an event listener to detect changes in selection
    inputOffice.addEventListener('change', function () {
        // Get the selected value of the selector
        const selectedValue = inputOffice.value;

        if (selectedValue) {
            // Log or use the selected value
            console.log(selectedValue);

            fetchEmployeeInfo(OfficecolRef, selectedValue, "OfficeName").then((dataRetrieved) => {
                const designationData = dataRetrieved;

                const positionSelector = document.getElementById('positionSelector');
                positionSelector.innerHTML = '<option>Select</option>';

                // getting data of designation
                const designationCollectionRef = collection(db, 'Office Information', designationData.officeDocumentID, 'Designations');
                const designationQue = query(designationCollectionRef)

                onSnapshot(designationQue, (snapshot) => {
                    snapshot.docs.forEach((doc) => {
                        const data = doc.data();
                        const id = doc.id;

                        // Create an option element for each OfficeName and append it to the selector
                        const optionElement = document.createElement('option');
                        optionElement.value = data.DesignationName;
                        optionElement.textContent = data.DesignationName;
                        positionSelector.appendChild(optionElement);
                    });
                });
            })
        } else {
            console.log("None")
        }
    });
}

window.addEventListener('load', fetchOfficeDesignation);


// Function to fetch DTR summary
function fetchDTRSummary() {
    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('dtrid');

    console.log(receivedStringData, '1234')

    const DTRcolRef = collection(db, 'DTR Summary');
    const EmployeecolRef = collection(db, 'Employee Information');
    const tableBody = document.getElementById('dtrSummary').getElementsByTagName('tbody')[0];

    console.log("hello")

    const que = query(EmployeecolRef, orderBy('createdAt'));
    const dtrque = query(DTRcolRef, where("documentID", "==", receivedStringData));
    const dtrque123 = query(DTRcolRef);

    onSnapshot(dtrque, (snapshot) => {
        // Clear existing rows
        tableBody.innerHTML = '';
        let num = 1;

        const dtrDataMap = {}; // Use a map to store DTR data by employeeDocID

        // First snapshot: Process Employee data
        if (!snapshot.empty) {
            snapshot.docs.forEach((empdoc) => {
                const data = empdoc.data();

                // Iterate over the keys of the sample object
                for (const key in data.Employee_DTR) {
                    const row = tableBody.insertRow();
                    if (data.Employee_DTR.hasOwnProperty(key)) {
                        const employee = data.Employee_DTR[key];
                        const name = employee.employeeFullName;
                        const workHRSRequired = employee.RequiredHours;

                        // Create cells and set values
                        const cell1 = row.insertCell(0);
                        const cell2 = row.insertCell(1);
                        const cell3 = row.insertCell(2);
                        const cell4 = row.insertCell(3);
                        const cell5 = row.insertCell(4);
                        const cell6 = row.insertCell(5);
                        const cell7 = row.insertCell(6);
                        const cell8 = row.insertCell(7);
                        const cell9 = row.insertCell(8);
                        const cell10 = row.insertCell(9);
                        const cell11 = row.insertCell(10);
                        const cell12 = row.insertCell(11);
                        const cell13 = row.insertCell(12);
                        const cell14 = row.insertCell(13);
                        const cell15 = row.insertCell(14);

                        // Set values for each cell
                        cell1.textContent = num;
                        cell2.textContent = name;
                        cell3.textContent = workHRSRequired;
                        cell4.textContent = employee.ActualHours;
                        cell5.textContent = employee.NoTimeLateIn;
                        cell6.textContent = employee.MinsLateIn;
                        cell7.textContent = employee.NoTimeEarlyLeave;
                        cell8.textContent = employee.MinsEarlyLeave;
                        cell9.textContent = employee.regularOvertime;
                        cell10.textContent = employee.specialOvertime;
                        cell11.textContent = employee.atnd;
                        cell12.textContent = employee.businessTrip;
                        cell13.textContent = employee.absent;
                        cell14.textContent = employee.leave;

                        console.log(employee.employeeDocID, 'asfsa1234');

                        // Create a view button
                        const viewButton = document.createElement('button');
                        viewButton.textContent = `Edit`;
                        viewButton.className = 'btn btn-primary';
                        viewButton.id = `viewbtn${employee.employeeDocID}`;
                        viewButton.type = 'button';

                        // Set data-toggle and data-target attributes
                        viewButton.setAttribute('data-toggle', 'modal');
                        viewButton.setAttribute('data-target', '.bd-example-modal-lg');

                        // Add an event listener to the button
                        viewButton.addEventListener('click', function () {
                            // Get the row index (subtracting 1 because row index starts from 0)
                            const rowIndex = this.id.replace('viewbtn', '');

                            const dtrEmployeeDetails = data.Employee_DTR[rowIndex];

                            console.log(rowIndex, 'asfs');

                            requiredSelector.value = dtrEmployeeDetails.RequiredHours;
                            actualWorkTime.value = dtrEmployeeDetails.NoTimeLateIn;
                            actualWorkMin.value = dtrEmployeeDetails.MinsLateIn;

                            earyLeaveTime.value = dtrEmployeeDetails.NoTimeEarlyLeave;
                            earyLeaveMin.value = dtrEmployeeDetails.MinsEarlyLeave;

                            overtimeRegular.value = dtrEmployeeDetails.regularOvertime;
                            overtimeSpecial.value = dtrEmployeeDetails.specialOvertime;

                            noBusinessTrip.value = dtrEmployeeDetails.businessTrip;
                            noAbsent.value = dtrEmployeeDetails.absent;

                            noLeave.value = dtrEmployeeDetails.leave;

                            // Log or process the data as needed
                            console.log('Clicked row data:', dtrEmployeeDetails);

                            // Add an event listener to the save button inside the modal
                            dtrSummaryBtn.addEventListener('click', async (e) => {
                                try {
                                    // Create an object to hold the updated data
                                    const minsLateIn = parseInt(actualWorkMin.value, 10) || 0;
                                    const minsEarlyLeave = parseInt(earyLeaveMin.value, 10) || 0;

                                    // Calculate the adjusted actual hours
                                    const adjustedActualHours = parseInt(actualWorkTime.value, 10) - (minsLateIn / 60) || 0;

                                    // Calculate the adjusted required hours
                                    const adjustedRequiredHours = parseInt(requiredSelector.value, 10) - (minsLateIn / 60) - (minsEarlyLeave / 60) || 0;

                                    // Multiply the number of absences by 8 hours
                                    const adjustedAbsentHours = (parseInt(noAbsent.value, 10) || 0) * 8;

                                    console.log(dtrEmployeeDetails.ActualHours)

                                    // Round a number to the nearest two decimals
                                    const roundToTwoDecimals = (number) => Math.round((number + Number.EPSILON) * 100) / 100;

                                    // Subtract adjustedAbsentHours from totalAbsentHours
                                    const totalAbsentHours = roundToTwoDecimals(adjustedRequiredHours - (parseInt(adjustedAbsentHours, 10) || 0));

                                    // Create an object to hold the updated data
                                    const updatedData = {
                                        RequiredHours: parseInt(requiredSelector.value, 10) || "" || "",
                                        ActualHours: totalAbsentHours < 0 ? 0 : totalAbsentHours ,
                                        NoTimeLateIn: parseInt(actualWorkTime.value, 10) || "",
                                        MinsLateIn: parseInt(actualWorkMin.value, 10) || "",
                                        NoTimeEarlyLeave: parseInt(earyLeaveTime.value, 10) || "",
                                        MinsEarlyLeave: parseInt(earyLeaveMin.value, 10) || "",
                                        regularOvertime: parseInt(overtimeRegular.value, 10) || "",
                                        specialOvertime: parseInt(overtimeSpecial.value, 10) || "",
                                        businessTrip: parseInt(noBusinessTrip.value, 10) || "",
                                        absent: parseInt(noAbsent.value, 10) || 0,
                                        leave: parseInt(noLeave.value, 10) || "",
                                    };

                                    // Assuming you have the document ID you want to update
                                    const documentIdToUpdate = receivedStringData;

                                    const result = await Swal.fire({
                                        title: "Are you sure?",
                                        text: "Employee's DTR will be updated",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Confirm"
                                    });

                                    if (result.isConfirmed) {

                                        // Use setDoc to update the document with merge: true
                                        await setDoc(doc(DTRcolRef, documentIdToUpdate), {
                                            Employee_DTR: {
                                                [rowIndex]: updatedData,
                                            },
                                        }, { merge: true }).then(() => {
                                            // Show success message using SweetAlert
                                            Swal.fire(
                                                'Saved!',
                                                'Your changes have been saved successfully.',
                                                'success'
                                            );
                                            console.log('Monthly DTR saved successfully...');

                                            // Reset the form (You may need to adjust this based on your form structure)
                                            document.getElementById('dtrSummaryForm').reset();

                                            // Close the modal if the update is successful
                                            $('.bd-example-modal-lg').modal('hide');
                                        })

                                    } else {
                                        // If the user clicks "Cancel", return a resolved promise
                                        return Promise.resolve();
                                    }


                                } catch (error) {
                                    console.error('Error updating DTR data:', error);
                                    // Handle the error as needed (display an error message, etc.)
                                }
                            });
                        });

                        // Append the button to the last cell
                        cell15.appendChild(viewButton);

                        num++;
                    }
                }
            });
        } else {
            // Handle case where no records are found
            const noRecordsRow = tableBody.insertRow();
            const noRecordsCell = noRecordsRow.insertCell(0);
            noRecordsCell.colSpan = 15;
            noRecordsCell.textContent = 'No records found.';
        }
    }, (error) => {
        // Handle errors
        console.error('Error fetching DTR data:', error);
        // You can display an error message or handle the error as needed
    });
}