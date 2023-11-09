import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import {firebaseConfig} from './server.js';

export function FetchCloudStorage(){
    const app = initializeApp(firebaseConfig);

    const storage = getStorage(app);
    
    const storageRef = ref(storage, 'requirements/bcert.png');
    
    getDownloadURL(storageRef)
      .then((url) => {
        console.log('Download URL:', url);    
      })
      .catch((error) => {
        console.error('Error getting download URL:', error);
        console.log('Catch block executed');
      });
}

FetchCloudStorage()