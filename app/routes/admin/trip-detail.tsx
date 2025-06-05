import type {LoaderFunctionArgs} from "react-router";
import { useLoaderData } from "react-router";
import {getAllTrips, getTripById} from "../../appwrite/trips";
import type { Route } from './+types/trip-detail';
import {cn, getFirstWord} from "~/lib/utils";
import {Header, InfoPill, TripCard} from "../../../components";
import {ChipDirective, ChipListComponent, ChipsDirective} from "@syncfusion/ej2-react-buttons";

// Remove unused import
// import {parseTripData} from "~/lib/utils";

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

interface AppwriteTrip {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    tripDetails: string; // Stored as JSON string in Appwrite
    imageUrls: string[]; // Stored as array in Appwrite
    [key: string]: any;
}

interface Activity {
    time: string;
    description: string;
}

interface DayPlan {
    day: number;
    location: string;
    activities: Activity[];
    meals?: string[];
    accommodation?: string;
}

interface ParsedTrip extends AppwriteTrip {
    id: string;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const { tripId } = params;
    if(!tripId) throw new Error ('Trip ID is required');

    try {
        const [trip, trips] = await Promise.all([
            getTripById(tripId),
            getAllTrips(4, 0)
        ]);

        if (!trip) {
            throw new Error('Trip not found');
        }

        // Extract the trip data from the Appwrite document
        const parsedTrip = {
            id: trip.$id,
            ...JSON.parse(trip.tripDetails),
            imageUrls: trip.imageUrls || []
        } as ParsedTrip;

        return {
            trip: parsedTrip,
            allTrips: trips.allTrips.map((tripData) => ({
                id: tripData.$id,
                ...JSON.parse(tripData.tripDetails),
                imageUrls: tripData.imageUrls || []
            }))
        };
    } catch (error) {
        console.error('Error loading trip:', error);
        throw error;
    }
}

export default function TripDetail() {
    const loaderData = useLoaderData() as { trip: ParsedTrip, allTrips: ParsedTrip[] };
    const trip = loaderData?.trip;

    if (!trip) {
        return <div>Loading...</div>;
    }

    // Log the trip data for debugging
    console.log('Trip data:', trip);
    console.log('Itinerary data:', trip.itinerary);
    console.log('First day activities:', trip.itinerary[0]?.activities);
    console.log('First activity description:', trip.itinerary[0]?.activities?.[0]?.description);
    console.log('First activity object:', trip.itinerary[0]?.activities?.[0]);

    // Destructure the trip object directly since it's already parsed
    const { 
        name, 
        description, 
        estimatedPrice, 
        duration, 
        budget, 
        travelStyle, 
        country, 
        interests, 
        imageUrls = [], // Provide default empty array
        bestTimeToVisit = [], // Provide default empty array
        weatherInfo = [], // Provide default empty array
        itinerary,
        groupType
    } = trip;

    const pillItems = [
        { text: budget, image: "/assets/icons/magic-star.svg" }, // Using magic-star as a fallback
        { text: travelStyle, image: "/assets/icons/itinerary.svg" },
        { text: country, image: "/assets/icons/location-mark.svg" },
        { text: interests, image: "/assets/icons/star.svg" },
        { text: groupType, image: "/assets/icons/users.svg" }
    ];

    return (
        <main className="travel-detail wrapper">
            <Header title="Trip Details" description="View and edit AI-generated travel plans" />

            <section className="container wrapper-md">
                <header>
                    <h1 className="p-40-semibold text-dark-100">{name}</h1>
                    <div className="flex items-center gap-5">
                        {pillItems.map((item, index) => (
                            <InfoPill
                                key={index}
                                text={item.text}
                                image={item.image}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-5">
                        <InfoPill
                            text={`${duration} day plan`}
                            image="/assets/icons/calendar.svg"
                        />

                        <InfoPill
                            text={itinerary?.slice(0, 4)
                                ?.map((item: DayPlan) => item.location)
                                .join(', ') || ''}
                            image="/assets/icons/location-mark.svg"
                        />
                    </div>
                </header>

                <section className="gallery">
                    {imageUrls.map((url: string, i: number) => (
                        <img
                            src={url}
                            key={i}
                            className={cn('w-full rounded-xl object-cover', i === 0
                            ? 'md:col-span-2 md:row-span-2 h-[330px]'
                            : 'md:row-span-1 h-[150px]')}
                        />
                    ))}
                </section>

                <section className="flex gap-3 md:gap-5 items-center flex-wrap">
                    <ChipListComponent id="travel-chip">
                        <ChipsDirective>
                            {pillItems.map((pill, i) => (
                                <ChipDirective
                                    key={i}
                                    text={getFirstWord(pill.text)}
                                    cssClass="!text-base !font-medium !px-4"
                                />
                            ))}
                        </ChipsDirective>
                    </ChipListComponent>

                    <ul className="flex gap-1 items-center">
                        {Array(5).fill('null').map((_, index) => (
                            <li key={index}>
                                <img
                                    src="/assets/icons/star.svg"
                                    alt="star"
                                    className="size-[18px]"
                                />
                            </li>
                        ))}

                        <li className="ml-1">
                            <ChipListComponent id="rating-chip">
                                <ChipsDirective>
                                    <ChipDirective
                                        text="4.9/5"
                                        cssClass="!bg-yellow-50 !text-yellow-700"
                                    />
                                </ChipsDirective>
                            </ChipListComponent>
                        </li>
                    </ul>
                </section>

                <section className="title">
                    <article>
                        <h3>
                            {duration}-Day {country} {travelStyle} Trip
                        </h3>
                        <p>{budget}, {groupType} and {interests}</p>
                    </article>

                    <h2>{estimatedPrice}</h2>
                </section>

                <div className="trip-details-container">
                    <div className="trip-info">
                        <h3 className="text-lg font-semibold mb-2">Overview</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                    </div>

                    <div className="trip-price">
                        <h3 className="text-lg font-semibold mb-2">Price Details</h3>
                        <p className="text-2xl font-bold">${estimatedPrice}</p>
                        <p className="text-sm text-gray-600">Per person, based on double occupancy</p>
                    </div>

                    <div className="trip-itinerary">
                        <h3 className="text-lg font-semibold mb-2">Detailed Itinerary</h3>
                        {itinerary && Array.isArray(itinerary) && itinerary.length > 0 ? (
                            <>
                                {itinerary.map((dayPlan: any, index: number) => (
                                    <div key={index} className="day-plan mb-6 border-b pb-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-xl font-semibold">Day {dayPlan.day}</h4>
                                            <div className="flex gap-2">
                                                {dayPlan.meals && dayPlan.meals.length > 0 && (
                                                    <span className="text-sm text-gray-600">Meals: {dayPlan.meals.join(', ')}</span>
                                                )}
                                                {dayPlan.accommodation && (
                                                    <span className="text-sm text-gray-600">Accommodation: {dayPlan.accommodation}</span>
                                                )}
                                            </div>
                                        </div>
                                        <h5 className="text-lg font-semibold mb-2">{dayPlan.location}</h5>
                                        <div className="activities space-y-4">
                                            {dayPlan.activities && Array.isArray(dayPlan.activities) && dayPlan.activities.length > 0 ? (
                                                <>
                                                    <h6 className="text-sm font-semibold mb-2">Activities:</h6>
                                                    <div className="space-y-3">
                                                        {dayPlan.activities.map((activity: any, activityIndex: number) => (
                                                            <div key={activityIndex} className="flex items-start gap-2">
                                                                <span className="text-gray-600">•</span>
                                                                <div>
                                                                    {activity.time && (
                                                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                                                                            <span className="text-gray-600">⏰</span>
                                                                            <span>{activity.time}</span>
                                                                        </div>
                                                                    )}
                                                                    <p className="font-medium">{activity.description || activity || 'No description available'}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-gray-600">No activities planned for this day</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p className="text-gray-600">No itinerary available</p>
                        )}
                    </div>

                    <div className="trip-timing">
                        <h3 className="text-lg font-semibold mb-2">Best Time to Visit</h3>
                        {bestTimeToVisit && bestTimeToVisit.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {bestTimeToVisit.map((time: string, index: number) => (
                                    <li key={index}>{time}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">🌸Spring(March to May): Ideal for sightseeing, blooming landscapes, and pleasant weather.<br></br>
                            ☀️ Summer(June to August): Great for outdoor adventures, festivals, and beach activities.<br></br>
                            🍁 Autumn(September to November): Beautiful fall colors, mild temperatures, and harvest festivals.<br></br>
                            ❄️ Winter (December to February): Perfect for winter sports, festive markets, and snow-covered landscapes.</p>
                        )}  
                    </div>

                    <div className="trip-weather">
                        <h3 className="text-lg font-semibold mb-2">Weather Information</h3>
                        {weatherInfo && weatherInfo.length > 0 ? (
                            <ul className="list-disc pl-5">
                                {weatherInfo.map((info: string, index: number) => (
                                    <li key={index}>{info}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">
                              
                                 ☀️Summer: 25°C to 35°C(77°F to 95°F)<br></br>
                                 🌦️Spring: 15°C to 25°C(59°F to 77°F)<br></br>
                                 🍁Autumn: 10°C to 20°C(50°F to 68°F)<br></br>
                                 ❄️Winter: -5°C to 10°C(23°F to 50°F)<br></br>
                              </p>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}


