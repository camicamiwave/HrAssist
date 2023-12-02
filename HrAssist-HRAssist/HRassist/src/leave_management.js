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


// init firebase app
const app = initializeApp(firebaseConfig)

const db = getFirestore()

function GetLeaveManagementTable() {

    try {
        const colRef = collection(db, 'Request Information')
        const EmployeecolRef = collection(db, 'Employee Information')

        const q = query(colRef, where("RequestType", "==", "Request Leave"))

        // Assuming you have Firestore data in the 'employees' array
        const employeeTable = document.getElementById('leaveManagement');
        const tbody = employeeTable.querySelector('tbody');


        onSnapshot(q, (snapshot) => {
            // Clear the existing rows in the table body
            tbody.innerHTML = '';

            snapshot.docs.forEach((doc) => {
                const data = doc.data();
                const id = doc.id;
                const row = document.createElement('tr');

                const employeedocID = data.employeeDocID

                fetchEmployeeInfo(EmployeecolRef, employeedocID, "documentID").then((dataRetrieved) => {
                    const employeedata = dataRetrieved;
                    const personalInfo = dataRetrieved.Personal_Information;

                    const ApplicantFullName = personalInfo.FirstName + " " + personalInfo.SurName;

                    const imageElement = document.createElement('img');

                    // Set the src attribute to the image URL
                    imageElement.src = employeedata.ProfilePictureURL;

                    // Append the image element to the table cell
                    const profileCell = document.createElement('td');
                    profileCell.appendChild(imageElement);

                    const nameCell = document.createElement('td');
                    nameCell.textContent = ApplicantFullName;

                    const leaveTypeCell = document.createElement('td');
                    leaveTypeCell.textContent = data.Request_Details.LeaveType;

                    const startDateCell = document.createElement('td');
                    startDateCell.textContent = data.Request_Details.StartDate;

                    const endDateCell = document.createElement('td');
                    endDateCell.textContent = data.Request_Details.EndDate;

                    const statusCell = document.createElement('td');
                    statusCell.textContent = data.RequestStatus;


                    if (data.RequestStatus.toLowerCase() === 'pending') {
                        statusCell.classList.add('text-danger',);
                        statusCell.style.fontWeight = 'bold';
                    } else if (data.RequestStatus === 'Approved') {
                        statusCell.classList.add('text-primary');
                        statusCell.style.fontWeight = 'bold';
                    }

                    const actionCell = document.createElement('td');


                    // Decline button
                    const viewButtonApprove = document.createElement('button');
                    viewButtonApprove.textContent = 'View'; // Customize the button label
                    viewButtonApprove.classList.add('btn', 'mx-1', 'btn-sm', 'text-white'); // You can use Bootstrap's 'btn' and 'btn-primary' classes

                    viewButtonApprove.addEventListener('click', () => {
                        // Define an action for the Decline button (e.g., decline the record)
                        // You can add your specific logic here
                        console.log('View button clicked for record with ID:', id);

                        window.location.href = `admin_leave_request.html?data=${encodeURIComponent(id)}&employeeDocID=${encodeURIComponent(employeedocID)}`;

                    });



                    actionCell.appendChild(viewButtonApprove);

                    // Append cells to the row 
                    //row.appendChild(profileCell); 
                    row.appendChild(profileCell)
                    row.appendChild(nameCell);
                    row.appendChild(leaveTypeCell);
                    row.appendChild(startDateCell);
                    row.appendChild(endDateCell);
                    row.appendChild(statusCell);
                    row.appendChild(actionCell);

                    // Append the row to the table body
                    tbody.appendChild(row);




                })

            });
        });

    } catch {
        console.log("No leave requet found")
    }
}


window.addEventListener('load', GetLeaveManagementTable);

function GetLeaveManagementStatus() {

    const urlParams = new URLSearchParams(window.location.search);
    const receivedStringData = urlParams.get('data');
    const receivedemployeeDocID = urlParams.get('employeeDocID');

    const colRef = collection(db, 'Request Information')
    const File201colRef = collection(db, '201File Information')
    const EmployeecolRef = collection(db, 'Employee Information')

    const leave_form = document.querySelector('#requestLeaveForm');

    const q = query(colRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {
        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;

            const leaveTypeSelector = document.getElementById('leaveTypeSelector')
            const otherLeaveReason = document.getElementById('otherLeaveReason')
            const startDate = document.getElementById('startDate')
            const endDate = document.getElementById('endDate')

            leaveTypeSelector.value = data.Request_Details.LeaveType

            if (data.Request_Details.LeaveType === "Others") {
                showHideOtherInput()
                otherLeaveReason.value = data.Request_Details.OtherReason
            }

            if (data.Request_Details.LeaveType === "Vacation Leave") {
                showHideOtherInput()
                leave_form.vacationLeave.value = data.Request_Details.VacationLeave;
                if (data.Request_Details.VacationLeave === "Within the Philippines") {
                    leave_form.withinDetails.value = data.Request_Details.VacationPh;
                } else {
                    leave_form.vacationLeave.value = data.Request_Details.VacationAbroad;
                }
            }
            if (data.Request_Details.LeaveType === "Sick Leave") {
                showHideOtherInput()
                leave_form.sickLeave.value = data.Request_Details.SickLeave;
                if (data.Request_Details.LeaveType === "InHospital") {
                    leave_form.inputInHospital.value = data.Request_Details.InHospital;
                } else {
                    leave_form.inputInHospital.value = data.Request_Details.OutPatient;
                }
            }

            if (data.Request_Details.LeaveType === "Special Leave Benefits for Women") {
                showHideOtherInput()
                leave_form.inputSpecialLeaveWomen.value = data.Request_Details.SpecialLeaveWomen;
            }

            if (data.Request_Details.LeaveType === "Study Leave") {
                showHideOtherInput()
                leave_form.studyLeave.value = data.Request_Details.StudyLeave;
            }
            if (data.Request_Details.DetailsofLeave) {
                showHideOtherInput()
                leave_form.detailsOfLeave.value = data.Request_Details.DetailsofLeave;
            }

            startDate.value = data.Request_Details.StartDate
            endDate.value = data.Request_Details.EndDate

            const listAttachmentsURL = data.AttachmentsURL

            if (data.AttachmentsURL.length === 1) {
                var objectElement = document.getElementById("dataDocument");
                objectElement.setAttribute("data", data.AttachmentsURL[0]);
                onefileOnly.style.display = 'block'
                manyfileOnly.style.display = 'none'

            } else {
                onefileOnly.style.display = 'none'
                manyfileOnly.style.display = 'block'
                var attachmentList = document.getElementById("attachmentList");

                // Clear existing list items
                attachmentList.innerHTML = "";

                // Create list items for each attachment
                data.AttachmentsURL.forEach(function (url, index) {
                    var listItem = document.createElement("li");
                    var link = document.createElement("a");

                    link.href = url;
                    link.textContent = "Attachment " + (index + 1); // You can customize the link text

                    listItem.appendChild(link);
                    attachmentList.appendChild(listItem);
                });
            }



            statusRequest.innerHTML = data.RequestStatus

            if (data.RequestStatus === "Pending") {
                statusRequest.style.color = 'red'
            } else if (data.RequestStatus === "Declined") {
                statusRequest.style.color = 'black'
                approveBtn.style.display = 'none'
                declineBtn.style.display = 'none'
            } else if (data.RequestStatus === "Approved") {
                statusRequest.style.color = 'blue'
                approveBtn.style.display = 'none'
                declineBtn.style.display = 'none'
            }

            fetchEmployeeInfo(File201colRef, receivedemployeeDocID, "employeeDocID").then((dataRetrieved) => {
                const file201data = dataRetrieved;
                const file201DocID = file201data.documentID

                empOffice.innerHTML = file201data.Appointment_Details.Office
                empJobType.innerHTML = file201data.Appointment_Details.NatureAppointment

                const employeeDocumentRef = doc(File201colRef, file201DocID);
                const leaveCreditsCollectionRef = collection(employeeDocumentRef, 'Leave_Credits');

                const file201query = query(leaveCreditsCollectionRef, where("LeaveCreditStatus", "==", "Active"))

                onSnapshot(file201query, (snapshot) => {
                    snapshot.docs.forEach((filedoc) => {
                        const leavedata = filedoc.data();
                        const id = filedoc.id;
                        const leaveTypeValue = leaveTypeSelector.value;

                        if (leavedata.Leave_Credit[leaveTypeValue]) {
                            labelLeaveType.innerHTML = leaveTypeValue
                            labelLeaveUnits.innerHTML = leavedata.Leave_Credit[leaveTypeValue].RemainingUnits
                            remainingLeaveNameSpan.innerHTML = leavedata.Leave_Credit[leaveTypeValue].RemainingUnits
                        } else {
                            labelLeaveType.innerHTML = leaveTypeValue
                            labelLeaveUnits.innerHTML = 0
                            remainingLeaveNameSpan.innerHTML = 0
                        }



                        const declineBtn = document.getElementById('submitApproveBtn1')
                        const declineRequestForm = document.querySelector('#approveRequestForm')

                        declineBtn.addEventListener('click', (e) => {
                            const totalRemainingLeaveCredit = leavedata.Leave_Credit[leaveTypeValue].RemainingUnits
                            const takenLeaveUnit = declineRequestForm.designationName.value

                            if (takenLeaveUnit) {
                                if (totalRemainingLeaveCredit >= takenLeaveUnit) {
                                    console.log("hey", leavedata.Leave_Credit[leaveTypeValue].RemainingUnits)


                                    Swal.fire({
                                        title: "Are you sure!",
                                        text: "Employee's leave taken units will be deducted to the leave credits",
                                        icon: "question",
                                        showCancelButton: true,
                                        confirmButtonColor: "#3085d6",
                                        cancelButtonColor: "#d33",
                                        confirmButtonText: "Confirm"
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            const result = totalRemainingLeaveCredit - takenLeaveUnit


                                            console.log('your total leave credit is', result)

                                            const leaveCreditsUpdate = {
                                                Leave_Credit: {
                                                    [leaveTypeValue]: {
                                                        RemainingUnits: result
                                                    }
                                                }
                                            }

                                            const RequestApprove = {
                                                RequestStatus: "Approved",
                                                Reason: declineRequestForm.descriptionText.value,
                                            };

                                            setDoc(doc(leaveCreditsCollectionRef, id), leaveCreditsUpdate, { merge: true })

                                            // If the user clicks "Confirm"
                                            return setDoc(doc(colRef, receivedStringData), RequestApprove, { merge: true })
                                                .then(() => {
                                                    Swal.fire({
                                                        title: 'Saved Successfully!',
                                                        text: `The total remaining leave credits for ${leaveTypeValue} is ${result} .`,
                                                        icon: 'success',
                                                    });

                                                    // Reset the form associated with declineRequestForm
                                                    declineRequestForm.reset();
                                                })
                                                .catch((error) => {
                                                    // Handle errors, if any
                                                    console.error("Error updating document:", error);
                                                });

                                        } else {
                                            // If the user clicks "Cancel", return a resolved promise
                                            return
                                        }

                                    })


                                } else {

                                    alert("Sorry, the employee has insufficient leave credits, so your approval has been denied.")

                                }

                            }


                        })




                    })
                })


            })


        })
    })


    fetchEmployeeInfo(EmployeecolRef, receivedemployeeDocID, "documentID").then((dataRetrieved) => {
        const data = dataRetrieved;
        const employeeDocID = data.documentID

        const fullName = `${data.Personal_Information.FirstName} ${data.Personal_Information.SurName}`

        empfullName.innerHTML = fullName
        empPhone.innerHTML = data.Personal_Information.MobileNumber
        empEmail.innerHTML = data.Personal_Information.Email

        employeeProfile.src = data.ProfilePictureURL


    })




}

window.addEventListener('load', GetLeaveManagementStatus);


function DeclineLeaveRequest() {

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');
        const receivedemployeeDocID = urlParams.get('employeeDocID');

        const RequestcolRef = collection(db, 'Request Information');

        const declineBtn = document.getElementById('submitApproveBtn')
        const declineRequestForm = document.querySelector('#declineRequestForm')

        declineBtn.addEventListener('click', (e) => {


            console.log("hey", receivedemployeeDocID)


            Swal.fire({
                title: "Are you sure?",
                text: "Employee's leave request will be declined",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {
                if (result.isConfirmed) {
                    const RequestDecline = {
                        RequestStatus: "Declined",
                        Reason: declineRequestForm.descriptionText.value
                    };

                    // If the user clicks "Confirm"
                    return setDoc(doc(RequestcolRef, receivedStringData), RequestDecline, { merge: true })
                        .then(() => {
                            Swal.fire({
                                title: 'Saved Successfully!',
                                text: "Employee's leave credits saved to the system.",
                                icon: 'success',
                            });

                            // Reset the form associated with declineRequestForm
                            declineRequestForm.reset();
                        })
                        .catch((error) => {
                            // Handle errors, if any
                            console.error("Error updating document:", error);
                        });
                } else {
                    // If the user clicks "Cancel", return a resolved promise
                    return
                }

            })



        })



    } catch {
        console.log("Not Declining")
    }

}



window.addEventListener('load', DeclineLeaveRequest);



function AcceptLeaveRequest(total) {

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');
        const receivedemployeeDocID = urlParams.get('employeeDocID');

        const RequestcolRef = collection(db, 'Request Information');

        const declineBtn = document.getElementById('submitApproveBtn')
        const declineRequestForm = document.querySelector('#approveRequestForm')

        declineBtn.addEventListener('click', (e) => {


            console.log("hey", receivedemployeeDocID)

            const totalUnits = declineRequestForm.designationName.value


            /*
            Swal.fire({
                title: "Are you sure?",
                text: "Employee's leave request will be declined",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Confirm"
            }).then((result) => {
                if (result.isConfirmed) {
                    const RequestDecline = {
                        RequestStatus: "Approved",
                        Reason: declineRequestForm.descriptionText.value
                    };
                
                    // If the user clicks "Confirm"
                    return setDoc(doc(RequestcolRef, receivedStringData), RequestDecline, { merge: true })
                        .then(() => {
                            Swal.fire({
                                title: 'Saved Successfully!',
                                text: "Employee's leave credits saved to the system.",
                                icon: 'success',
                            });
                
                            // Reset the form associated with declineRequestForm
                            declineRequestForm.reset();
                        })
                        .catch((error) => {
                            // Handle errors, if any
                            console.error("Error updating document:", error);
                        });                
                } else {
                    // If the user clicks "Cancel", return a resolved promise
                    return
                }

            })*/



        })



    } catch {
        console.log("Not Declining")
    }

}



//window.addEventListener('load', AcceptLeaveRequest);