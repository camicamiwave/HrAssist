import { getStorage, ref, getDownloadURL,  uploadBytes } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import {firebaseConfig} from './server.js';
import { 
  getFirestore, collection, onSnapshot, 
  addDoc, deleteDoc, doc,
  query, where,
  orderBy, serverTimestamp,
  getDoc, updateDoc, setDoc
} from 'firebase/firestore'


const app = initializeApp(firebaseConfig);

const storage = getStorage(app);
     
export function FetchCloudStorage(fileURL){
    
  const storageRef = ref(storage, fileURL);
  
  getDownloadURL(storageRef)
    .then((url) => {
      
      console.log('Download URL:', url); 
      
    })
    .catch((error) => {
      console.error('Error getting download URL:', error);
      console.log('Catch block executed');
    });
}

FetchCloudStorage("https://firebasestorage.googleapis.com/v0/b/hrassist-lgusanvicente.appspot.com/o/applicant%2Frequirements%2Fform138.png?alt=media&token=83969eaf-c3ff-44f4-a07b-4bdeb290181b")

function addDataToCloudStorage1(formId, storagePath) {
  const db = getFirestore();
  const colRef = collection(db, 'Test');
  const storageRef = ref(storage, storagePath);

  const form = document.getElementById(formId);

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const fileInput = form.querySelector('input[type="file"]');
    const selectedFiles = fileInput.files;

    if (selectedFiles.length > 0) {
      const addDtrForm = document.querySelector("#dtr_form");

      const uploadPromises = [];
      const fileURL = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const selectedFile = selectedFiles[i];

        const timestamp = new Date().getTime();
        const uniqueFilename = `${timestamp}_${selectedFile.name}`;

        const fileRef = ref(storageRef, uniqueFilename);

        const uploadPromise = uploadBytes(fileRef, selectedFile)
          .then(() => getDownloadURL(fileRef))
          .then((downloadURL) => {
            fileURL.push(downloadURL);
          });

        uploadPromises.push(uploadPromise);
      }

      Promise.all(uploadPromises)
        .then(() => {
          const data = {
            test: addDtrForm.test.value,
            test1: addDtrForm.test1.value,
            test_list: ["asfsa", "Asfsa"],
            createdAt: serverTimestamp(),
            files: [], // Initialize an array for nested documents
          };

          for (let i = 0; i < fileURL.length; i++) {
            data.files.push({
              url: fileURL[i],
              fileIndex: i + 1,
            });
          }

          // Add the first document to the primary collection
          return addDoc(colRef, data);
        })
        .then(() => {
          addDtrForm.reset();
          console.log("Added documents successfully...");
        })
        .catch((error) => console.error('Error adding documents:', error));
    } else {
      console.error('No file selected');
    }
  });
}

// Call the function with the form id and storage path
addDataToCloudStorage1('dtr_form', 'applicant/req');
