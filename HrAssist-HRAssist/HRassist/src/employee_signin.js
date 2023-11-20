import Swal from 'sweetalert2';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';

import {
    getFirestore,
    collection,
    doc,
    addDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

import { firebaseConfig } from './server.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function TestAccountCreation() {
    const SubmitAccountForm = document.getElementById('empCreateAccountBtn');

    const AccountColRef = collection(db, 'User Account');
    const EmployeeColRef = collection(db, 'Employee Information');

    SubmitAccountForm.addEventListener('click', async (e) => {
        e.preventDefault();

        const EmployeeUserName = document.getElementById('empInputUsername').value;
        const EmployeeEmail = document.getElementById('empInputEmail').value;
        const EmployeePassword = document.getElementById('empInputPassword').value;
        const EmployeeConfirmPassword = document.getElementById('empInputConfirmPassword').value;

        console.log(EmployeeEmail, EmployeeUserName, EmployeePassword, EmployeeConfirmPassword);

        let NewdocRef;
        let EmpcustomDocId;

        if (EmployeePassword === EmployeeConfirmPassword) {
            try {
                const result = await Swal.fire({
                    title: "Are you sure?",
                    text: "Your employee will be saved.",
                    icon: "info",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, proceed!"
                });

                if (result.isConfirmed) {
                    console.log("Pwede mag sign up");

                    try {
                        const loginResult = await Swal.fire({
                            title: "Admin Login",
                            text: "Please confirm your admin credentials to verify if you are authorized to create an account",
                            html:
                                `<input type="email" id="swal-input1" class="swal2-input" placeholder="Enter your email">
                                <input type="password" id="swal-input2" class="swal2-input" placeholder="Enter your password">`,
                            showCancelButton: true,
                            confirmButtonText: "Login",
                            preConfirm: () => {
                                const email = Swal.getPopup().querySelector('#swal-input1').value;
                                const password = Swal.getPopup().querySelector('#swal-input2').value;

                                if (!email || !password) {
                                    Swal.showValidationMessage('Email and password are required');
                                }

                                return { email, password };
                            },
                        });

                        if (loginResult.isConfirmed) {
                            try {

                                const userCredential = await createUserWithEmailAndPassword(auth, EmployeeEmail, EmployeeConfirmPassword);
                                const empuser = userCredential.user;
                                console.log('Successfully created new user:', empuser.uid);

                                // Add displayName
                                await updateProfile(empuser, {
                                    displayName: EmployeeUserName,
                                    emailVerified: true,
                                });

                                const signInUserCredential = await signInWithEmailAndPassword(auth, loginResult.value.email, loginResult.value.password);
                                const signInUser = signInUserCredential.user;
                                console.log('Successfully signed in:', signInUser.uid);

                                const AccountDetails = {
                                    AccountStatus: "Active",
                                    userID: empuser.uid,
                                    UserLevel: "Employee",
                                    Email: EmployeeEmail,
                                    createdAt: serverTimestamp()
                                };
                                const docRef = await addDoc(AccountColRef, AccountDetails);
                                EmpcustomDocId = docRef.id;

                                await setDoc(doc(AccountColRef, EmpcustomDocId), { documentID: EmpcustomDocId }, { merge: true });

                                const PriorAccountDetails = {
                                    accountID: EmpcustomDocId,
                                    EmployeeUsername: EmployeeUserName,
                                    EmployeeEmail: EmployeeEmail,
                                };
                                const empDocRef = await addDoc(EmployeeColRef, PriorAccountDetails);
                                NewdocRef = empDocRef.id;

                                await setDoc(doc(EmployeeColRef, NewdocRef), { documentID: NewdocRef }, { merge: true });

                                console.log("Added employee account successfully...");
                                alert("Congratulations, you've confirmed your identity. You can now add other employee's information");


                                window.location.href = `datasheet.html?data=${encodeURIComponent(NewdocRef)}`;
                            } catch (error) {
                                console.error('Error creating new user:', error.message);
                                Swal.fire({
                                    title: "Registration failed",
                                    text: error.message,
                                    icon: "error",
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error signing in after account creation:', error.message);
                        Swal.fire({
                            title: "Login failed",
                            text: error.message,
                            icon: "error",
                        });
                    }
                }
            } catch (error) {
                console.error("There was an error:", error);
            }
        } else {
            alert("Passwords do not match");
        }
    });
}

window.addEventListener('load', TestAccountCreation);
