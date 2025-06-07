import { type ActionFunctionArgs } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { appwriteConfig, database } from "~/appwrite/client";
import { parseMarkdownToJson } from "~/lib/utils";
import { ID } from "appwrite";

interface Trip {
    name: string;
    description: string;
    estimatedPrice: string;
    duration: number;
    budget: string;
    travelStyle: string;
    country: string;
    interests: string;
    groupType: string;
    itinerary?: Array<{
        day: number;
        location: string;
        activities: Array<{
            time: string;
            description: string;
            estimatedCost?: number;
            notes?: string;
        }>;
        title?: string;
        totalCost?: number;
    }>;
}

export const action = async ({ request }: ActionFunctionArgs) => {
    try {
        // Get request data
        const requestData = await request.json();
        console.log('Received request data:', JSON.stringify(requestData, null, 2));

        // Destructure request data
        const {
            country,
            numberOfDays,
            travelStyle,
            interests,
            budget,
            groupType,
            userId,
        } = requestData;

        // Validate input
        if (!country || !numberOfDays || !travelStyle || !interests || !budget || !groupType || !userId) {
            return {
                success: false,
                error: "Missing required parameters",
            };
        }

        // Initialize AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return JSON with:
        name, description, estimatedPrice, duration, budget, travelStyle, country, interests, groupType`;

        console.log('Sending AI request...');
        const response = await genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }).generateContent(prompt);
        const aiResponse = response.response.text();
        console.log('Got AI response:', aiResponse);

        // Parse AI response
        let tripData: Trip;
        try {
            tripData = parseMarkdownToJson(aiResponse) as Trip;
            if (!tripData) {
                throw new Error('Invalid AI response format');
            }
        } catch (error) {
            return {
                success: false,
                error: 'Failed to parse AI response',
            };
        }

        // Get images from Unsplash with retry mechanism
        let imageUrls: string[] = [];
        try {
            const imageResponse = await fetch(
                `https://api.unsplash.com/search/photos?query=${country} ${interests}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
            );
            const images = await imageResponse.json();
            
            if (images && images.results && images.results.length > 0) {
                imageUrls = images.results.slice(0, 3).map((img: { urls: { regular: string } }) => img.urls.regular);
            }
        } catch (error) {
            console.warn('Failed to fetch images from Unsplash:', error);
            // Use fallback images if Unsplash fails
            imageUrls = [
                'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                'https://images.unsplash.com/photo-1522092979357-3e5e6925ad20',
                'https://images.unsplash.com/photo-1541701494587-d12eb74745fd'
            ];
        }

        // Prepare document data matching Appwrite schema
        // Prepare trip details object (without imageUrls)
        const tripDetails = {
            name: tripData.name,
            description: tripData.description,
            estimatedPrice: tripData.estimatedPrice,
            duration: tripData.duration,
            budget: tripData.budget,
            travelStyle: tripData.travelStyle,
            country: tripData.country,
            interests: tripData.interests,
            groupType: tripData.groupType,
            itinerary: tripData.itinerary || [],
            bestTimeToVisit: [],
            weatherInfo: []
        };

        // Convert tripDetails to JSON string and prepare document data
        const documentData = {
            tripDetails: JSON.stringify(tripDetails),
            imageUrls: imageUrls, // Store imageUrls as array
            userId: userId,
            createdAt: new Date().toISOString()
        };

        try {
            // Create document in Appwrite
            const result = await database.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.tripCollectionId,
                ID.unique(),
                documentData
            );

            return {
                success: true,
                id: result.$id,
                document: {
                    name: result.title,
                    description: result.description,
                    estimatedPrice: result.estimatedPrice,
                    createdAt: result.$createdAt,
                    userId
                }
            };
        } catch (error) {
            console.error('Appwrite error:', error);
            return {
                success: false,
                error: 'Failed to save trip to database',
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
};