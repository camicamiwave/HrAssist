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

const urlParams = new URLSearchParams(window.location.search);
const receivedStringData = urlParams.get('data');

function fetchEmployee() {
    const EmployeecolRef = collection(db, 'Employee Information'); 

    fetchEmployeeInfo(EmployeecolRef, receivedStringData, "documentID").then((dataRetrieved) => {
        const empdata = dataRetrieved;
        const file201DocID = empdata.documentID

        inputCsId.innerHTML = empdata.Personal_Information.CSCID
        inputFname.innerHTML = empdata.Personal_Information.FirstName
        inputMname.innerHTML = empdata.Personal_Information.MiddleName
        inputLname.innerHTML = empdata.Personal_Information.SurName
        inputExtname.innerHTML = empdata.Personal_Information.ExName
        inputGender.innerHTML = empdata.Personal_Information.Gender
        inputBirthdate.innerHTML = empdata.Personal_Information.Birthdate
        inputPlaceBirth.innerHTML = empdata.Personal_Information.PlaceBirth
        inputCivilStatus.innerHTML = empdata.Personal_Information.CivilStatus
        inputEmail.innerHTML = empdata.Personal_Information.Email
        inputMobileNum.innerHTML = empdata.Personal_Information.MobileNumber
        inputTelephone.innerHTML = empdata.Personal_Information.TelNum
        inputHeight.innerHTML = empdata.Personal_Information.Height
        inputWeight.innerHTML = empdata.Personal_Information.Weight
        inputBloodType.innerHTML = empdata.Personal_Information.BloodType
        inputGSISID.innerHTML = empdata.Personal_Information.GSIS
        inputPAGIBIGID.innerHTML = empdata.Personal_Information.PagIbig
        inputPHILHEALTHID.innerHTML = empdata.Personal_Information.PhilHealth
        inputSSSID.innerHTML = empdata.Personal_Information.SSS
        inputTINID.innerHTML = empdata.Personal_Information.Tin
        inputAGENCYID.innerHTML = empdata.Personal_Information.Agency
        inputFilipino.innerHTML = empdata.Personal_Information.Citizen
        //inputDualCitizen.innerHTML = empdata.Personal_Information.Agency
        inputCountry.innerHTML = empdata.Personal_Information.Country
        inputHouseBlock.innerHTML = empdata.Personal_Information.HouseBlock
        inputStreet.innerHTML = empdata.Personal_Information.Street
        inputSubdivision.innerHTML = empdata.Personal_Information.Subdivision
        inputBarangay.innerHTML = empdata.Personal_Information.Barangay
        inputCity.innerHTML = empdata.Personal_Information.Municipality
        inputProvince.innerHTML = empdata.Personal_Information.Provine
        inputZipCode.innerHTML = empdata.Personal_Information.ZipCode

        inputSpouseFname.innerHTML = empdata.SpouseDetails.SpouseFirstName
        inputSpouseMname.innerHTML = empdata.SpouseDetails.SpouseMiddleName
        inputSpouseLname.innerHTML = empdata.SpouseDetails.SpouseSurName
        inputSpouseExtName.innerHTML = empdata.SpouseDetails.SpouseExName

        inputSpouseOccupation.innerHTML = empdata.SpouseDetails.SpouseOccupation
        inputSpouseEmployer.innerHTML = empdata.SpouseDetails.SpouseEmployer
        inputSpouseBusinessAd.innerHTML = empdata.SpouseDetails.SpouseBusinessAdd
        inputSpouseTelPhone.innerHTML = empdata.SpouseDetails.SpouseTelNum

        inputFatherFname.innerHTML = empdata.FatherDetails.FatherFirstName
        inputFatherMname.innerHTML = empdata.FatherDetails.FatherMiddleName
        inputFatherLname.innerHTML = empdata.FatherDetails.FatherSurName
        inputFatherExtName.innerHTML = empdata.FatherDetails.FatherExName

        inputMotherFname.innerHTML = empdata.MotherDetails.MotherFirstName
        inputMotherMname.innerHTML = empdata.MotherDetails.MotherMiddleName
        inputMotherLname.innerHTML = empdata.MotherDetails.MotherSurName
        inputMotherMaidenName.innerHTML = empdata.MotherDetails.MotherMaidenName

        // para sa children
        const childrenContainer = document.querySelector('.children-container');
        // Assuming empdata.ChildrenDetails is an array of child objects
        for (const child of empdata.ChildrenDetails) {
            const childDiv = document.createElement('div');
            childDiv.className = 'row';

            console.log(child, 'asf')

            const childFirstNameDiv = createLabelDiv('First Name: ', child.ChildrenFirstName);
            const childMiddleNameDiv = createLabelDiv('Middle Name: ', child.ChiildrenMiddleName);
            const childLastNameDiv = createLabelDiv('Last Name: ', child.ChiildrenSurName);
            const childExtNameDiv = createLabelDiv('ExtName: ', child.ChiildrenExName);

            childDiv.appendChild(childFirstNameDiv);
            childDiv.appendChild(childMiddleNameDiv);
            childDiv.appendChild(childLastNameDiv);
            childDiv.appendChild(childExtNameDiv);

            childrenContainer.appendChild(childDiv);
        }

        function createLabelDiv(labelText, content) {
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-3';

            const label = document.createElement('label');
            label.className = 'small mb-1';
            label.innerHTML = `<b>${labelText}</b>`;
            colDiv.appendChild(label);

            const contentLabel = document.createElement('label');
            contentLabel.className = 'small mb-1';
            contentLabel.innerHTML = content;
            colDiv.appendChild(contentLabel);

            return colDiv;
        }

        // Educational Background
        elementarySchoolName.innerHTML = empdata.Education_Details.Elementary.ElementarySchool
        elementaryBasicDegree.innerHTML = empdata.Education_Details.Elementary.ElementaryGrade
        elementaryFrom.innerHTML = empdata.Education_Details.Elementary.ElementaryFrom
        elementaryTo.innerHTML = empdata.Education_Details.Elementary.ElementaryTo
        elementaryUnits.innerHTML = empdata.Education_Details.Elementary.ElementaryLevel
        elementaryScholar.innerHTML = empdata.Education_Details.Elementary.ElementaryScholarship

        secondaryHighSchool.innerHTML = empdata.Education_Details.Secondary.SecondarySchool
        secondaryBasicDegree.innerHTML = empdata.Education_Details.Secondary.SecondaryGrade
        secondaryFrom.innerHTML = empdata.Education_Details.Secondary.SecondaryFrom
        secondaryTo.innerHTML = empdata.Education_Details.Secondary.SecondaryTo
        secondaryUnits.innerHTML = empdata.Education_Details.Secondary.SecondaryLevel
        secondaryScholar.innerHTML = empdata.Education_Details.Secondary.SecondaryScholarship

        seniorHighName.innerHTML = empdata.Education_Details.Vocational.VocationalSchool
        seniorHighDegree.innerHTML = empdata.Education_Details.Vocational.VocationalGrade
        seniorHighFrom.innerHTML = empdata.Education_Details.Vocational.VocationalFrom
        seniorHighTo.innerHTML = empdata.Education_Details.Vocational.VocationalTo
        seniorHighUnits.innerHTML = empdata.Education_Details.Vocational.VocationalLevel
        seniorHighScholar.innerHTML = empdata.Education_Details.Vocational.VocationalScholarship

        collegeName.innerHTML = empdata.Education_Details.College.CollegeSchool
        collegeDegree.innerHTML = empdata.Education_Details.College.CollegeGrade
        collegeFrom.innerHTML = empdata.Education_Details.College.CollegeFrom
        collegeTo.innerHTML = empdata.Education_Details.College.CollegeTo
        collegeUnits.innerHTML = empdata.Education_Details.College.CollegeLevel
        collegeScholar.innerHTML = empdata.Education_Details.College.CollegeScholarship

        graduteName.innerHTML = empdata.Education_Details.Graduate.GraduateSchool
        graduteDegree.innerHTML = empdata.Education_Details.Graduate.GraduateGrade
        graduteFrom.innerHTML = empdata.Education_Details.Graduate.GraduateFrom
        graduteTo.innerHTML = empdata.Education_Details.Graduate.GraduateTo
        graduteUnits.innerHTML = empdata.Education_Details.Graduate.GraduateLevel
        graduteScholar.innerHTML = empdata.Education_Details.Graduate.GraduateScholarship




    })
}

window.addEventListener('load', fetchEmployee)


function fetchEligibility() { 
    const EmployeecolRef = collection(db, 'Employee Information')

    const employeeTable = document.getElementById('eligibilityTable');
    const tbody = employeeTable.querySelector('tbody');

    const q = query(EmployeecolRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = '';

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;
            const row = document.createElement('tr');


            const eligibilityData = data.OtherInformation.CSC_Eligibility.Eligibility

            // Append the image element to the table cell
            const csceligibilityCell = document.createElement('td');
            csceligibilityCell.textContent = eligibilityData.EligibilityName

            const ratingCell = document.createElement('td');
            ratingCell.textContent = eligibilityData.Rating;

            const degreeCell = document.createElement('td');
            degreeCell.textContent = eligibilityData.BasicDegree;

            const datexamCell = document.createElement('td');
            datexamCell.textContent = eligibilityData.ExamDate;

            const placeexamCell = document.createElement('td');
            placeexamCell.textContent = eligibilityData.ExamPlace;

            const scholarCell = document.createElement('td');
            scholarCell.textContent = eligibilityData.Scholarship;
            
            const licensedateCell = document.createElement('td');
            licensedateCell.textContent = eligibilityData.LicenseDate;
            
            const licenseNumberCell = document.createElement('td');
            licenseNumberCell.textContent = eligibilityData.LicenseNumber;


            // Append cells to the row 
            //row.appendChild(profileCell); 
            row.appendChild(csceligibilityCell)
            row.appendChild(ratingCell);
            row.appendChild(degreeCell);
            row.appendChild(datexamCell);
            row.appendChild(placeexamCell);
            row.appendChild(scholarCell);
            row.appendChild(licensedateCell);
            row.appendChild(licenseNumberCell);

            // Append the row to the table body
            tbody.appendChild(row);

        })
    })


}

window.addEventListener('load', fetchEligibility)


function fetchWorkExperience() {

    const EmployeecolRef = collection(db, 'Employee Information')

    const employeeTable = document.getElementById('workExperienceTable');
    const tbody = employeeTable.querySelector('tbody');

    const q = query(EmployeecolRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = '';

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;
            const row = document.createElement('tr');

            const workExpData = data.OtherInformation.WorkExperience.WorkExperienceDetails

            console.log(workExpData.WorkName, 1232)
 
            // Append the image element to the table cell
            const WorkNamCell = document.createElement('td');
            WorkNamCell.textContent = workExpData.WorkName

            const WorkFromCell = document.createElement('td');
            WorkFromCell.textContent = workExpData.WorkFrom;

            const WorkToCell = document.createElement('td');
            WorkToCell.textContent = workExpData.WorkTo;

            const WorkNumHoursCell = document.createElement('td');
            WorkNumHoursCell.textContent = workExpData.WorkNumHours;

            const postionCell = document.createElement('td');
            postionCell.textContent = workExpData.WorkPosition;
 

            // Append cells to the row 
            //row.appendChild(profileCell); 
            row.appendChild(WorkNamCell)
            row.appendChild(WorkFromCell);
            row.appendChild(WorkToCell);
            row.appendChild(WorkNumHoursCell);
            row.appendChild(postionCell);  

            // Append the row to the table body
            tbody.appendChild(row);

        })
    })


}

window.addEventListener('load', fetchWorkExperience)



function fetchTraining() {

    const EmployeecolRef = collection(db, 'Employee Information')

    const employeeTable = document.getElementById('TrainingTable');
    const tbody = employeeTable.querySelector('tbody');

    const q = query(EmployeecolRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = '';

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;
            const row = document.createElement('tr');

            const trainingData = data.OtherInformation.LearingDevelopment.LearingDevelopmentDetails
 
            // Append the image element to the table cell
            const trainingTitleCell = document.createElement('td');
            trainingTitleCell.textContent = trainingData.LearningTitle

            const trainingFromCell = document.createElement('td');
            trainingFromCell.textContent = trainingData.LearningFrom;

            const trainingToCell = document.createElement('td');
            trainingToCell.textContent = trainingData.LearingTo;

            const trainingHoursCell = document.createElement('td');
            trainingHoursCell.textContent = trainingData.LearningHours;

            const trainingLDCell = document.createElement('td');
            trainingLDCell.textContent = trainingData.LearningLD;

            
            const trainingSponsoredCell = document.createElement('td');
            trainingSponsoredCell.textContent = trainingData.LearningSponsored;
 

            // Append cells to the row 
            //row.appendChild(profileCell); 
            row.appendChild(trainingTitleCell)
            row.appendChild(trainingFromCell);
            row.appendChild(trainingToCell);
            row.appendChild(trainingHoursCell);
            row.appendChild(trainingLDCell);  
            row.appendChild(trainingSponsoredCell);  

            // Append the row to the table body
            tbody.appendChild(row);

        })
    })


}

window.addEventListener('load', fetchTraining)



function fetchOtherInformation() {

    const EmployeecolRef = collection(db, 'Employee Information')

    const employeeTable = document.getElementById('otherInformationTable');
    const tbody = employeeTable.querySelector('tbody');

    const q = query(EmployeecolRef, where("documentID", "==", receivedStringData))

    onSnapshot(q, (snapshot) => {

        tbody.innerHTML = '';

        snapshot.docs.forEach((empdoc) => {
            const data = empdoc.data();
            const id = empdoc.id;
            const row = document.createElement('tr');

            e_signature.src = data.EsignatureURL 


            const otherinfoData = data.OtherInformation.Other_Information

            thirdDegree.innerHTML = otherinfoData.RadioThirdDegree
            fourthDegree.innerHTML = otherinfoData.RadioFourthDegree
            thirdSpecify.innerHTML = otherinfoData.DegreeSpecify
            guilty.innerHTML = otherinfoData.Guilty
            guiltyspecify.innerHTML = otherinfoData.GuiltySpecify
            crimalCourt.innerHTML = otherinfoData.CriminalRecord
            criminalDetails.innerHTML = otherinfoData.CriminalRecordSpecify

            inidigenous.innerHTML = otherinfoData.Indigenous
            inidigenouscountry.innerHTML = otherinfoData.IndigenousSpecify

            disability.innerHTML = otherinfoData.Disability
            disabilitySpecify.innerHTML = otherinfoData.DisabilitySpecify

            soloParent.innerHTML = otherinfoData.SoloParent
            soloParentSpecify.innerHTML = otherinfoData.SoloParentSpecify            

            const trainingData = data.OtherInformation.LearingDevelopment.LearingDevelopmentDetails
 
            // Append the image element to the table cell
            const trainingTitleCell = document.createElement('td');
            trainingTitleCell.textContent = trainingData.LearningTitle 

            // Append cells to the row  
            row.appendChild(trainingTitleCell) 

            // Append the row to the table body
            tbody.appendChild(row);

        })
    })


}

window.addEventListener('load', fetchOtherInformation)