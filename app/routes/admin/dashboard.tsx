import {Header, StatsCard, TripCard} from "../../../components";
import {getAllUsers, getUser} from "~/appwrite/auth";
import {getTripsByTravelStyle, getUserGrowthPerDay, getUsersAndTripsStats} from "~/appwrite/dashboard";
import {getAllTrips} from "~/appwrite/trips";
import {parseTripData} from "~/lib/utils";
import {
     Category,
    ChartComponent,
    ColumnSeries,
    DataLabel, SeriesCollectionDirective, SeriesDirective,
    SplineAreaSeries,
    Tooltip
     } from "@syncfusion/ej2-react-charts";
      import {ColumnDirective, ColumnsDirective, GridComponent, Inject} from "@syncfusion/ej2-react-grids";
      import {tripXAxis, tripyAxis, userXAxis, useryAxis} from "~/constants";
      import {redirect} from "react-router";
 
   interface DashboardLoaderData {
         user: User | null;
       dashboardStats: DashboardStats;
       allTrips: Trip[];
        mappedUsers: Array<{
        imageUrl: string;
        name: string;
        count: number;
    }>;
        userGrowth: UserGrowth[];
        tripsByTravelStyle: TripByTravelStyle[];
}

    import { type Document } from "~/appwrite/dashboard";

        export const loader = async (): Promise<DashboardLoaderData> => {
 try {
        const [
            user,
            dashboardStats,
            trips,
            userGrowth,
            tripsByTravelStyle,
            allUsers,
        ] = await Promise.all([
            getUser(),
            getUsersAndTripsStats(),
            getAllTrips(4, 0),
            getUserGrowthPerDay(),
            getTripsByTravelStyle(),
            getAllUsers(4, 0),
        ])

        if (!user || !dashboardStats) {
            console.error('Missing required data for dashboard');
            throw new Error('Failed to load dashboard data');
        }

        if (!trips.allTrips || !allUsers.users) {
            console.error('Invalid data structure received');
            throw new Error('Invalid data structure');
        }

        const allTrips = trips.allTrips.map(({ $id, tripDetails, imageUrls }) => {
            if (!$id || !tripDetails) {
                console.error('Invalid trip data:', { $id, tripDetails });
                throw new Error('Invalid trip data structure');
            }
            const parsedTrip = parseTripData(tripDetails);
            if (!parsedTrip) {
                console.error('Failed to parse trip details:', tripDetails);
                throw new Error('Invalid trip data format');
            }
            
            // Convert string values to appropriate types
            const estimatedPrice = typeof parsedTrip.estimatedPrice === 'string' 
                ? Number(parsedTrip.estimatedPrice.replace(/[^0-9.-]+/g, '')) 
                : parsedTrip.estimatedPrice;
            
            return {
                id: $id,
                name: parsedTrip.name,
                description: parsedTrip.description,
                estimatedPrice: estimatedPrice || 0,
                duration: parsedTrip.duration,
                budget: parsedTrip.budget,
                travelStyle: parsedTrip.travelStyle,
                interests: parsedTrip.interests,
                groupType: parsedTrip.groupType,
                country: parsedTrip.country,
                imageUrls: imageUrls ?? [],
                itinerary: parsedTrip.itinerary,
                bestTimeToVisit: parsedTrip.bestTimeToVisit,
                weatherInfo: parsedTrip.weatherInfo,
                location: parsedTrip.location,
                payment_link: parsedTrip.payment_link
            } as Trip;
        })

        const mappedUsers = allUsers.users.map((user) => {
            if (!user?.name) {
                console.warn('User missing name:', user);
                return null;
            }
            return {
                imageUrl: user?.imageUrl ?? '/assets/images/default-user.jpg',
                name: user.name,
                count: user.itineraryCount ?? Math.floor(Math.random() * 10),
            }
        }).filter(Boolean) as Array<{ imageUrl: string; name: string; count: number }>;

        return {
            user: user as unknown as User,
            dashboardStats,
            allTrips,
            mappedUsers,
            userGrowth,
            tripsByTravelStyle
        };
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
};

    interface User {
        name: string;
        imageUrl?: string;
        [key: string]: any;
    }

interface Trip {
            id: string;
            name: string;
            imageUrls: string[];
            interests: string;
            travelStyle: string;
            estimatedPrice: number;
            itinerary?: any[];
        };

interface DashboardStats {
                    totalUsers: number;
                    totalTrips: number;
                    userRole: {
                        total: number;
                        currentMonth: number;
                        lastMonth: number;
                    };
                    usersJoined: {
                        currentMonth: number;
                        lastMonth: number;
                    };
                    tripsCreated: {
                        currentMonth: number;
                        lastMonth: number;
                    };
                }

                interface UserGrowth {
                    day: string;
                    count: number;
                }

                interface TripByTravelStyle {
                    travelStyle: string;
                    count: number;
                }

                interface DashboardProps {
                    loaderData: {
                        user: User | null;
                        dashboardStats: DashboardStats;
                        allTrips: Trip[];
                        mappedUsers: Array<{
                            imageUrl: string;
                            name: string;
                            count: number;
                        }>;
                        userGrowth: UserGrowth[];
                        tripsByTravelStyle: TripByTravelStyle[];
                    };
                };

const Dashboard = ({ loaderData }: DashboardProps) => {
        const { user, dashboardStats, allTrips, userGrowth, tripsByTravelStyle, mappedUsers } = loaderData;

        // If user is null, redirect to sign-in
        if (!user) {
            return redirect('/sign-in');
        }

        const trips = allTrips.map((trip) => ({
        imageUrl: trip.imageUrls[0],
        name: trip.name,
        interest: trip.interests,
    }));

    const usersAndTrips = [
        {
            title: 'Latest user signups',
            dataSource: mappedUsers,
            field: 'count',
            headerText: 'Trips created'
        },
        {
            title: 'Trips based on interests',
            dataSource: trips,
            field: 'interest',
            headerText: 'Interests'
        }
    ]

    return (
        <main className="dashboard wrapper bg-white dark:bg-gray-900 transition-colors duration-200">
            <div className="flex justify-between items-center mb-4 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm transition-colors duration-200">
                <Header
                    title={`Welcome ${user?.name ?? 'Guest'} 👋`}
                    description="Track activity, trends and popular destinations in real time"
                    user={user}
                />
             
            </div>

            <section className="flex flex-col gap-6 bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm transition-colors duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    <StatsCard
                        headerTitle="Total Users"
                        total={dashboardStats.totalUsers}
                        currentMonthCount={dashboardStats.usersJoined.currentMonth}
                        lastMonthCount={dashboardStats.usersJoined.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Total Trips"
                        total={dashboardStats.totalTrips}
                        currentMonthCount={dashboardStats.tripsCreated.currentMonth}
                        lastMonthCount={dashboardStats.tripsCreated.lastMonth}
                    />
                    <StatsCard
                        headerTitle="Active Users"
                        total={dashboardStats.userRole.total}
                        currentMonthCount={dashboardStats.userRole.currentMonth}
                        lastMonthCount={dashboardStats.userRole.lastMonth}
                    />
                </div>
            </section>
            <section className="container">
                <h1 className="text-xl font-semibold text-dark-100">Created Trips</h1>

                <div className='trip-grid'>
                    {allTrips.map((trip) => (
                        <TripCard
                            key={trip.id}
                            id={trip.id.toString()}
                            name={trip.name}
                            imageUrl={trip.imageUrls[0]}
                            location={trip.itinerary?.[0]?.location ?? ''}
                            tags={[trip.interests, trip.travelStyle]}
                            price={trip.estimatedPrice.toString()}
                        />
                    ))}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="chart-container w-full h-[400px] md:h-[500px]">
                    <ChartComponent
                        id="chart-1"
                        primaryXAxis={userXAxis}
                        primaryYAxis={useryAxis}
                        title="User Growth"
                        tooltip={{ enable: true}}
                        width="100%"
                        height="100%"
                    >
                        <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={userGrowth}
                                xName="day"
                                yName="count"
                                type="Column"
                                name="Column"
                                columnWidth={0.3}
                                cornerRadius={{topLeft: 10, topRight: 10}}
                            />

                            <SeriesDirective
                                dataSource={userGrowth}
                                xName="day"
                                yName="count"
                                type="SplineArea"
                                name="Wave"
                                fill="rgba(71, 132, 238, 0.3)"
                                border={{ width: 2, color: '#4784EE'}}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </div>

                <div className="chart-container w-full h-[400px] md:h-[500px]">
                    <ChartComponent
                        id="chart-2"
                        primaryXAxis={tripXAxis}
                        primaryYAxis={tripyAxis}
                        title="Trip Trends"
                        tooltip={{ enable: true}}
                        width="100%"
                        height="100%"
                    >
                        <Inject services={[ColumnSeries, SplineAreaSeries, Category, DataLabel, Tooltip]} />

                        <SeriesCollectionDirective>
                            <SeriesDirective
                                dataSource={tripsByTravelStyle}
                                xName="travelStyle"
                                yName="count"
                                type="Column"
                                name="day"
                                columnWidth={0.3}
                                cornerRadius={{topLeft: 10, topRight: 10}}
                            />
                        </SeriesCollectionDirective>
                    </ChartComponent>
                </div>
            </section>

            <section className="user-trip wrapper">
                {usersAndTrips.map(({ title, dataSource, field, headerText}, i) => (
                    <div key={i} className="flex flex-col gap-5">
                        <h3 className="p-20-semibold text-dark-100">{title}</h3>

                        <GridComponent dataSource={dataSource} gridLines="None">
                            <ColumnsDirective>
                                <ColumnDirective
                                    field="name"
                                    headerText="Name"
                                    width="200"
                                    textAlign="Left"
                                    template={(props: UserData) => (
                                        <div className="flex items-center gap-1.5 px-4">
                                            <img src={props.imageUrl} alt="user" className="rounded-full size-8 aspect-square" referrerPolicy="no-referrer" />
                                            <span>{props.name}</span>
                                        </div>
                                    )}
                                />

                                <ColumnDirective
                                    field={field}
                                    headerText={headerText}
                                    width="150"
                                    textAlign="Left"
                                />
                            </ColumnsDirective>
                        </GridComponent>
                    </div>
                ))}
            </section>
        </main>
    )
}
export default Dashboard