import {Account, Client, Databases, Storage} from "appwrite";

export const appwriteConfig = {
    endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
}

const client = new Client();

try {
    client
        .setEndpoint(appwriteConfig.endpointUrl)
        .setProject(appwriteConfig.projectId);

    console.log('Appwrite client initialized successfully');
} catch (error) {
    console.error('Failed to initialize Appwrite client:', error);
    throw new Error('Failed to initialize Appwrite client. Please check your configuration.');
}

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export { client, account, database, storage };