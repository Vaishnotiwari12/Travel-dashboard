import { ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

export const getExistingUser = async (id: string) => {
    try {
        const { documents, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", id)]
        );
        return total > 0 ? documents[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
};

export const storeUserData = async () => {
    try {
        const user = await account.get();
        if (!user) throw new Error("User not found");

        const { providerAccessToken } = (await account.getSession("current")) || {};
        const profilePicture = providerAccessToken
            ? await getGooglePicture(providerAccessToken)
            : null;

        const createdUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: profilePicture,
                joinedAt: new Date().toISOString(),
            }
        );

        if (!createdUser.$id) redirect("/sign-in");
    } catch (error) {
        console.error("Error storing user data:", error);
    }
};

const getGooglePicture = async (accessToken: string) => {
    try {
        const response = await fetch(
            "https://people.googleapis.com/v1/people/me?personFields=photos",
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch Google profile picture");

        const { photos } = await response.json();
        return photos?.[0]?.url || null;
    } catch (error) {
        console.error("Error fetching Google picture:", error);
        return null;
    }
};

export const loginWithGoogle = async () => {
    try {
        account.createOAuth2Session(
            OAuthProvider.Google,
            `${window.location.origin}/`,
            `${window.location.origin}/404`
        );
    } catch (error) {
        console.error("Error during OAuth2 session creation:", error);
    }
};

export const logoutUser = async () => {
    try {
        await account.deleteSession("current");
    } catch (error) {
        console.error("Error during logout:", error);
    }
};

export const getUser = async () => {
    try {
        // First check if we have a session
        const sessions = await account.listSessions();
        if (!sessions.sessions.length) {
            return redirect("/sign-in");
        }

        // Get current user
        const user = await account.get();
        if (!user) {
            console.error("No user found in session");
            return redirect("/sign-in");
        }

        // Get user data from database
        const { documents } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", user.$id)]
        );

        if (!documents.length) {
            console.error("No user data found in database for account:", user.$id);
            return redirect("/sign-in");
        }

        return documents[0];
    } catch (error: any) {
        console.error("Error fetching user:", error);
        if (error.code === 401) {
            console.error("User not authenticated");
            return redirect("/sign-in");
        }
        return null;
    }
};

export const getAllUsers = async (limit: number, offset: number) => {
    try {
        const { documents: users, total } = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        if(total === 0) return { users: [], total };

        return { users, total };
    } catch (e) {
        console.log('Error fetching users')
        return { users: [], total: 0 }
    }
}