import { Client, Account, Databases, Storage } from 'appwrite';

export const appwriteConfig = {
    endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    apiKey: import.meta.env.VITE_APPWRITE_API_KEY,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
    // itineraryCollectionId: import.meta.env.VITE_APPWRITE_ITINERARY_COLLECTION_ID
};

// Create client instances
const client = new Client();
const serverClient = new Client();

// Configure client for browser
client
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);
// Configure client for server
serverClient
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId)
    // .setKey(appwriteConfig.apiKey);

// Initialize services
const account = new Account(client);
const database = new Databases(serverClient);
const storage = new Storage(serverClient);

export { client, account, database, storage };