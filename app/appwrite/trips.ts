import {appwriteConfig, database} from "../appwrite/client";
import {Query} from "appwrite";

interface TripDetails {
    name: string;
    description: string;
    estimatedPrice: string;
    duration: number;
    budget: string;
    travelStyle: string;
    country: string;
    interests: string;
    groupType: string;
    imageUrls: string[];
    itinerary: Array<{
        day: number;
        location: string;
        activities: Array<{
            time: string;
            description: string;
        }>;
    }>;
    bestTimeToVisit: string[];
    weatherInfo: string[];
    [key: string]: any;
}

export const getAllTrips = async (limit: number, offset: number) => {
    try {
        console.log('Fetching trips with config:', {
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.tripCollectionId
        });

        const allTrips = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            [Query.limit(limit), Query.offset(offset), Query.orderDesc('createdAt')]
        );

        console.log('Received trips response:', {
            total: allTrips.total,
            documents: allTrips.documents.length
        });

        if(allTrips.total === 0) {
            console.error('No trips found');
            return { allTrips: [], total: 0 }
        }

        return {
            allTrips: allTrips.documents,
            total: allTrips.total,
        };
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
}

export const getTripById = async (tripId: string) => {
    const trip = await database.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.tripCollectionId,
        tripId
    );

    if(!trip.$id) {
        console.log('Trip not found')
        return null;
    }

    return trip;
}

export const createTrip = async (tripData: TripDetails) => {
    try {
        const trip = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            'unique()',
            {
                tripDetails: tripData
            }
        );
        return trip;
    } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
    }
}

export const updateTrip = async (tripId: string, tripData: TripDetails) => {
    try {
        const trip = await database.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.tripCollectionId,
            tripId,
            {
                tripDetails: tripData
            }
        );
        return trip;
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
}