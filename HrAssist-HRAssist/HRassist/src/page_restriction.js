import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc, setDoc
} from 'firebase/firestore'

import { getAuth, signOut } from "firebase/auth";

import { firebaseConfig } from './server.js';

const app = initializeApp(firebaseConfig)

const db = getFirestore()

const auth = getAuth(app);

export function UserLoginChecker(Account_UserID, User_Action) {

  //console.log(Account_UserID, 'page restriction pageeee ', User_Action)

  const TestcolRef = collection(db, 'User Account');

  const que = query(TestcolRef, where("userID", "==", Account_UserID))

  try {
    onSnapshot(que, (snapshot) => {
      let employees = [];
      snapshot.docs.forEach((doc) => {
        employees.push({ ...doc.data(), id: doc.id });
      });

      if (employees.length > 0) {
        //console.log("User login...123");
        const userlevel = employees[0].UserLevel;

        console.log(employees[0].AccountStatus)

        // get the current path of user
        const currentPath = window.location.pathname;
        if (employees[0].AccountStatus === "Deactivated") {
          signOut(auth)
            .then(() => {
              console.log("Sign out")
              alert('Sorry, the system has detected that your account is deactivated. You are not allowed to log in.')
              alert('You are logged out.')
              return window.location.href = "login.html"
            })
            .catch((error) => {
              console.error('Sign-out error:', error);
            });
        }

        if (userlevel === "Employee") {
          if (User_Action === "Login") {
            window.location.href = "employee_home.html";
          } else if (User_Action === "Browsing") {
            //PageRestrictionMethod(currentPath, userlevel);
          }

        } else if (userlevel === "Applicant") {
          if (User_Action === "Login") {
            window.location.href = "index.html";
          } else if (User_Action === "Browsing") {
            //PageRestrictionMethod(currentPath, userlevel);
          }

        } else if (userlevel === "Admin") {
          if (User_Action === "Login") {
            window.location.href = "admin_dashboard.html";
          } else if (User_Action === "Browsing") {
            //PageRestrictionMethod(currentPath, userlevel); 
          }

        } else {
          //PageRestrictionMethod(currentPath, "Guest");
        }

      } else {

        // get the current path of user
        const currentPath = window.location.pathname;

        console.log("No user found...")
        //PageRestrictionMethod(currentPath, "Guest");
      }
    });

  } catch (error) {
    console.error('An error occurred:', error);
  }
}


export function PageRestrictionMethod(currentPath, userLevel) {

  var splitResult = currentPath.split('/dist/');
  var restOfTheCode = splitResult[1];
  currentPath = "/dist/" + restOfTheCode;

  // lagay nyo dito lahat ng pages na exclusive lang for employees
  const Employee_Pages = [
    '/dist/employee_home.html',
    '/dist/employee_changepass.html',
    '/dist/employee_changeprofile.html',
    '/dist/employee_contactus.html',
    '/dist/employee_profilepass.html',
    '/dist/employeeprofile.html',

  ];

  // lagay nyo dito lahat ng pages na exclusive lang for admin or HR
  const Admin_Pages = [
    '/dist/admin_dashboard.html',
    '/dist/admin_manage_applicant_view.html',
  ];


  if (userLevel === "Applicant") {
    // Check if the currentPath is in the list of Applicant_Pages
    const isEmployee_Pages = Employee_Pages.includes(currentPath);
    const isAdmin_Pages = Admin_Pages.includes(currentPath);

    if (isEmployee_Pages || isAdmin_Pages) {
      // Perform actions for Employee or Admin pages
      console.log('This is not an Applicant page.');
      window.location.href = "index.html";
    } else {
      // Perform actions for other pages
      console.log('This is an Applicant page.');
    }
  }

  else if (userLevel === "Employee") {
    // Check if the currentPath is in the list of Applicant_Pages
    const isAdmin_Pages = Admin_Pages.includes(currentPath);


    if (isAdmin_Pages) {
      // Perform actions for other pages
      console.log('This is not an Employee page.');
      window.location.href = "employee_home.html";
    } else {
      // Perform actions for Applicant pages
      console.log('This is an Employee page.');
    }
  }

  else if (userLevel === "Admin") {
    // Check if the currentPath is in the list of Applicant_Pages 
    const isEmployee_Pages = Employee_Pages.includes(currentPath);

    console.log(isEmployee_Pages, "asfssafs");

    if (isEmployee_Pages) {
      // Perform actions for other pages
      console.log('This is not an Admin page.');
      window.location.href = "admin_dashboard.html";
    } else {
      // Perform actions for Applicant pages
      console.log('This is an Admin page.');

    }

  } else {
    // Check if the currentPath is in the list of Applicant_Pages
    const isEmployee_Pages = Employee_Pages.includes(currentPath);
    const isAdmin_Pages = Admin_Pages.includes(currentPath);

    if (isEmployee_Pages) {
      // Perform actions for Applicant pages
      console.log('This is not an Guest page.');
      window.location.href = "index.html";
    } else if (isAdmin_Pages) {
      console.log('This is not an Guest page.');
      window.location.href = "index.html";
    } else {
      // Perform actions for other pages
      console.log('This is an Guest page.');
    }
  }

}
