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

                        DTR_Section.style.display = 'block';

                        // Assuming you want to add the employeeDocID to the URL without reloading
                        const url = `admin_dtr_form.html?data=${encodeURIComponent(employeeDocID)}`;

                        // Use pushState to update the URL
                        window.history.pushState({ path: url }, '', url);
                        searchEmployeeBtn.style.display = 'none';
                        //window.location.href = `admin_201file_pds.html?data=${encodeURIComponent(employeeDocID)}`;
                    });
                } else {
                    alert("No record retrieved.");
                    console.log("No record retrieved.");
                }
            });


        } catch {

            alert("No record retrieved.");
        }


    })

}

window.addEventListener('load', SearchEmployee)


export function SaveEmployeeDTR(dtrDetails) {
    const DTRcolRef = collection(db, 'DTR Information');

    Swal.fire({
        title: "Are you sure?",
        text: "Monthly DTR will be saved on the system",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirm"
    }).then((result) => {
        if (result.isConfirmed) {
            // If the user clicks "Confirm"
            return addDoc(DTRcolRef, dtrDetails);
        } else {
            // If the user clicks "Cancel", return a resolved promise
            return Promise.resolve();
        }
    }).then((docRef) => {
        if (docRef) {
            ReturnDocumentID(docRef);
            Swal.fire({
                title: 'Congratulations!',
                text: 'Monthly DTR saved successfully.',
                icon: 'success',
            });
            console.log('Monthly DTR saved successfully...');
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

function ReturnDocumentID(docRef) {
    const DTRcolRef = collection(db, 'DTR Information');

    const EmpcustomDocId = docRef.id;
    return setDoc(doc(DTRcolRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });
}


function CheckDTRRecord() {
    try {
        const dtrCheckRecordBtn = document.getElementById('dtrCheckRecordBtn');
        const DTRcolRef = collection(db, 'DTR Information');

        dtrCheckRecordBtn.addEventListener('click', (e) => {
            const urlParams = new URLSearchParams(window.location.search);
            const receivedStringData = urlParams.get('data');

            const monthSelector = document.getElementById('monthSelector').value;
            const yearSelctor = document.getElementById('yearSelctor').value;

            try {

                const conditions = [
                    where("Month", "==", monthSelector.trim()),
                    where("Year", "==", yearSelctor.trim()),
                    where("employeeDocID", "==", receivedStringData.trim())
                ];


                const que = query(DTRcolRef, ...conditions);

                // for retrieving the current user
                onSnapshot(que, (snapshot) => {
                    if (!snapshot.empty) {
                        snapshot.docs.forEach((docData) => {
                            const data = docData.data();
                            const dtrID = data.documentID;

                            // Assuming you want to add the employeeDocID to the URL without reloading
                            const url = `admin_dtr_form.html?data=${encodeURIComponent(receivedStringData)}&dtrID=${dtrID}`;

                            // Use pushState to update the URL
                            window.history.pushState({ path: url }, '', url);
                            //dtrCheckRecordBtn.style.display = 'none';

                            const DtrDetails = {
                                DTRTotalTardy: data.Tardy_Details.TotalTimesTardy,
                                DTRTotalHoursTardy: data.Tardy_Details.HoursTary,
                                DTRTotalMinsTardy: data.Tardy_Details.MinsTardy,
                                DTRTotalTimesUndertime: data.Undertime_Details.TotalTimesUndertime,
                                DTRTotalHoursUndertime: data.Undertime_Details.HoursUndertime,
                                DTRTotalMinsUndertime: data.Undertime_Details.MinsUndertime
                            }

                            DTRDetailsDisplayer(DtrDetails)
                            displayExistingData(data.dtrData)



                            alert("DTR record was retrieved.");

                        });
                    } else {
                        alert("No record retrieved.");
                        setDefaultValues()
                        console.log("No record retrieved.");
                    }
                });


            } catch {

                alert("No record retrieved.");
            }



        })


    } catch {
        console.log("No DTR record detected...")
    }
}

window.addEventListener('load', CheckDTRRecord)

function DTRDetailsDisplayer(dtrDetails) {

    const monthSelector = document.getElementById('monthSelector');
    const yearSelctor = document.getElementById('yearSelctor');

    const noTimesTardy = document.getElementById('noTimesTardy');
    const noHoursTardy = document.getElementById('noHoursTardy');
    const noMinsTardy = document.getElementById('noMinsTardy');

    const noTimesUndertime = document.getElementById('noTimesUndertime');
    const noHoursUndertime = document.getElementById('noHoursUndertime');
    const noMinsUndertime = document.getElementById('noMinsUndertime');

    const noPassSlip = document.getElementById('noPassSlip');
    const noLeave = document.getElementById('noLeave');

    // Display 
    noTimesTardy.value = dtrDetails.DTRTotalTardy;
    noHoursTardy.value = dtrDetails.DTRTotalHoursTardy;
    noMinsTardy.value = dtrDetails.DTRTotalMinsTardy;

    noTimesUndertime.value = dtrDetails.DTRTotalTimesUndertime;
    noHoursUndertime.value = dtrDetails.DTRTotalHoursUndertime;
    noMinsUndertime.value = dtrDetails.DTRTotalMinsUndertime;

}

function displayExistingData(existingData) {
    existingData.forEach(data => {
        // Get the corresponding elements
        const checkbox = document.getElementById(`day${data.day}-checkbox`);
        const amIn = document.getElementById(`day${data.day}-time0`);
        const amOut = document.getElementById(`day${data.day}-time1`);
        const pmIn = document.getElementById(`day${data.day}-time2`);
        const pmOut = document.getElementById(`day${data.day}-time3`);
        const hoursInput = document.getElementById(`day${data.day}-hours`);
        const minsInput = document.getElementById(`day${data.day}-mins`);

        // Set values
        checkbox.checked = true;
        amIn.value = data.amIn;
        amOut.value = data.amOut;
        pmIn.value = data.pmIn;
        pmOut.value = data.pmOut;

        // Update hours and mins
        updateHoursAndMins(data.day);
    });
}

function setDefaultValues() {

    const monthSelector = document.getElementById('monthSelector');
    const yearSelctor = document.getElementById('yearSelctor');

    const noTimesTardy = document.getElementById('noTimesTardy');
    const noHoursTardy = document.getElementById('noHoursTardy');
    const noMinsTardy = document.getElementById('noMinsTardy');

    const noTimesUndertime = document.getElementById('noTimesUndertime');
    const noHoursUndertime = document.getElementById('noHoursUndertime');
    const noMinsUndertime = document.getElementById('noMinsUndertime');

    const noPassSlip = document.getElementById('noPassSlip');
    const noLeave = document.getElementById('noLeave');

    // Display 
    noTimesTardy.value = 0;
    noHoursTardy.value = 0;
    noMinsTardy.value = 0;

    noTimesUndertime.value = 0;
    noHoursUndertime.value = 0;
    noMinsUndertime.value = 0;

    for (let day = 1; day <= 31; day++) {
        const checkbox = document.getElementById(`day${day}-checkbox`);
        const amIn = document.getElementById(`day${day}-time0`);
        const amOut = document.getElementById(`day${day}-time1`);
        const pmIn = document.getElementById(`day${day}-time2`);
        const pmOut = document.getElementById(`day${day}-time3`);
        const hoursInput = document.getElementById(`day${day}-hours`);
        const minsInput = document.getElementById(`day${day}-mins`);

        // Set default values
        checkbox.checked = false;
        amIn.value = '';
        amOut.value = '';
        pmIn.value = '';
        pmOut.value = '';
        hoursInput.value = '';
        minsInput.value = '';

        // Disable inputs
        [amIn, amOut, pmIn, pmOut, hoursInput, minsInput].forEach(input => {
            input.disabled = true;
        });
    }
}

// GETTING DTR INTO RAW DATA

function GetDtr() {
    const dtrSubmitBtn = document.getElementById('dtrSubmitBtn')

    dtrSubmitBtn.addEventListener('click', (e) => {
        const dtrData = getDtrFormValues();

        const urlParams = new URLSearchParams(window.location.search);
        const receivedStringData = urlParams.get('data');

        const daysWithTimesBeyond8AMOr1PM = getDaysWithTimesBeyond8AMOr1PM(dtrData);

        console.log('Days with at least one time beyond 08:01 AM, 01:01 PM, undertime in the morning, or undertime in the afternoon:', daysWithTimesBeyond8AMOr1PM);

        // Compute totals
        const totalBeyond8AM = daysWithTimesBeyond8AMOr1PM.reduce((total, rowData) => total + rowData.countBeyond8AM, 0);
        const totalBeyond1PM = daysWithTimesBeyond8AMOr1PM.reduce((total, rowData) => total + rowData.countBeyond1PM, 0);
        const totalUnderTimeMorning = daysWithTimesBeyond8AMOr1PM.reduce((total, rowData) => total + rowData.countUnderTimeMorning, 0);
        const totalUnderTimeAfternoon = daysWithTimesBeyond8AMOr1PM.reduce((total, rowData) => total + rowData.countUnderTimeAfternoon, 0);

        console.log('Total times beyond 8:00 AM:', totalBeyond8AM);
        console.log('Total times beyond 1:00 PM:', totalBeyond1PM);
        console.log('Total times undertime in the morning:', totalUnderTimeMorning);
        console.log('Total times undertime in the afternoon:', totalUnderTimeAfternoon);

        // Compute total hours and minutes late
        const totalHoursLate = dtrData.reduce((total, rowData) => {
            const amInTime = new Date(`2022-01-01T${rowData.amIn}`);
            const actualAmInTime = new Date(`2022-01-01T08:00:00`);

            if (amInTime > actualAmInTime) {
                total += amInTime.getHours() - actualAmInTime.getHours();
                total += (amInTime.getMinutes() - actualAmInTime.getMinutes()) / 60;
            }

            const pmInTime = new Date(`2022-01-01T${rowData.pmIn}`);
            const actualPmInTime = new Date(`2022-01-01T13:00:00`);

            if (pmInTime > actualPmInTime) {
                total += pmInTime.getHours() - actualPmInTime.getHours();
                total += (pmInTime.getMinutes() - actualPmInTime.getMinutes()) / 60;
            }

            return total;
        }, 0);

        // Compute total hours and minutes undertime
        const totalHoursUnderTime = dtrData.reduce((total, rowData) => {
            const amOutTime = new Date(`2022-01-01T${rowData.amOut}`);
            const actualAmOutTime = new Date(`2022-01-01T12:00:00`);

            if (amOutTime < actualAmOutTime) {
                total += actualAmOutTime.getHours() - amOutTime.getHours();
                total += (actualAmOutTime.getMinutes() - amOutTime.getMinutes()) / 60;
            }

            const pmOutTime = new Date(`2022-01-01T${rowData.pmOut}`);
            const actualPmOutTime = new Date(`2022-01-01T17:00:00`);

            if (pmOutTime < actualPmOutTime) {
                total += actualPmOutTime.getHours() - pmOutTime.getHours();
                total += (actualPmOutTime.getMinutes() - pmOutTime.getMinutes()) / 60;
            }

            return total;
        }, 0);

        const lateTotalHours = Math.floor(totalHoursLate);
        const lateTotalMinutes = (totalHoursLate % 1) * 60;

        const undertimeTotalHours = Math.floor(totalHoursUnderTime);
        const undertimeTotalMinutes = (totalHoursUnderTime % 1) * 60;

        const roundOffLateMins = Math.round(lateTotalMinutes)
        const roundOffUndertimeMins = Math.round(undertimeTotalMinutes)

        const monthSelector = document.getElementById('monthSelector');
        const yearSelctor = document.getElementById('yearSelctor');

        const noTimesTardy = document.getElementById('noTimesTardy');
        const noHoursTardy = document.getElementById('noHoursTardy');
        const noMinsTardy = document.getElementById('noMinsTardy');

        const noTimesUndertime = document.getElementById('noTimesUndertime');
        const noHoursUndertime = document.getElementById('noHoursUndertime');
        const noMinsUndertime = document.getElementById('noMinsUndertime');

        const noPassSlip = document.getElementById('noPassSlip');
        const noLeave = document.getElementById('noLeave');

        const totalUndertime = totalUnderTimeMorning + totalUnderTimeAfternoon;
        const totalTardy = totalBeyond8AM + totalBeyond1PM;

        const DtrDetails = {
            DTRTotalTardy: totalTardy,
            DTRTotalHoursTardy: lateTotalHours,
            DTRTotalMinsTardy: roundOffLateMins,
            DTRTotalTimesUndertime: totalUndertime,
            DTRTotalHoursUndertime: undertimeTotalHours,
            DTRTotalMinsUndertime: roundOffUndertimeMins
        }

        DTRDetailsDisplayer(DtrDetails)

        const dtrDetails = {
            createdAt: serverTimestamp(),
            employeeDocID: receivedStringData,
            Month: monthSelector.value,
            Year: yearSelctor.value,
            NumPassSlip: noPassSlip.value,
            NumLeave: noLeave.value,
            Tardy_Details: {
                TotalTimesTardy: totalTardy,
                HoursTary: lateTotalHours,
                MinsTardy: roundOffLateMins,
            },
            Undertime_Details: {
                TotalTimesUndertime: totalUndertime,
                HoursUndertime: undertimeTotalHours,
                MinsUndertime: roundOffUndertimeMins,
            },
            dtrData,

        }

        SaveEmployeeDTR(dtrDetails);

        /*console.log('Total hours late:', lateTotalHours);
        console.log('Total minutes late:', Math.round(lateTotalMinutes));

        console.log('Total hours undertime:', undertimeTotalHours);
        console.log('Total minutes undertime:', Math.round(undertimeTotalMinutes));*/

    })
}


window.addEventListener('load', GetDtr)

function getDaysWithTimesBeyond8AMOr1PM(dtrData) {
    // Get the days where at least one time value is beyond 08:00 AM or 01:00 PM
    return dtrData.map((rowData) => {
        // Assuming that the time values are in HH:mm format
        const amInTime = new Date(`2022-01-01T${rowData.amIn}`);
        const amOutTime = new Date(`2022-01-01T${rowData.amOut}`);
        const pmInTime = new Date(`2022-01-01T${rowData.pmIn}`);
        const pmOutTime = new Date(`2022-01-01T${rowData.pmOut}`);

        // Check if at least one time value is beyond 08:00 AM or 01:00 PM
        const isBeyond8AM = amInTime >= new Date(`2022-01-01T08:01:00`) || amOutTime >= new Date(`2022-01-01T12:59:00`);
        const isBeyond1PM = pmInTime >= new Date(`2022-01-01T13:01:00`) || pmOutTime >= new Date(`2022-01-01T17:00:00`);

        // Check if at least one time value is undertime in the morning (before 12:00 PM) or in the afternoon (before 5:00 PM)
        const isUnderTimeMorning = amOutTime <= new Date(`2022-01-01T11:59:00`);
        const isUnderTimeAfternoon = pmOutTime <= new Date(`2022-01-01T16:59:00`);

        // Count the number of times beyond 8:00 AM, 1:00 PM, undertime in the morning, and undertime in the afternoon
        //const countBeyond8AM = (isBeyond8AM ? 1 : 0) + (isBeyond1PM && !isBeyond8AM ? 1 : 0);
        const countBeyond8AM = isBeyond8AM ? 1 : 0;
        const countBeyond1PM = isBeyond1PM ? 1 : 0;
        const countUnderTimeMorning = isUnderTimeMorning ? 1 : 0;
        const countUnderTimeAfternoon = isUnderTimeAfternoon ? 1 : 0;

        return {
            day: rowData.day,
            countBeyond8AM,
            countBeyond1PM,
            countUnderTimeMorning,
            countUnderTimeAfternoon,
            rowData
        };
    }).filter(rowData => rowData.countBeyond8AM + rowData.countBeyond1PM + rowData.countUnderTimeMorning + rowData.countUnderTimeAfternoon > 0);
}
