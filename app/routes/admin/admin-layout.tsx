import {Outlet, redirect} from "react-router";
import {SidebarComponent} from "@syncfusion/ej2-react-navigations";
import {MobileSidebar, NavItems} from "../../../components";
import {account} from "~/appwrite/client";
import {getExistingUser, storeUserData} from "~/appwrite/auth";

interface UserStatus {
    status: 'user' | 'admin' | 'superadmin';
    $id: string;
    [key: string]: any;
}

export async function clientLoader(): Promise<UserStatus | { type: 'redirect'; pathname: string }> {
    try {
        const user = await account.get();
        
        if (!user?.$id) {
            console.error('User not authenticated');
            return { type: 'redirect', pathname: '/sign-in' };
        }

        const existingUser = await getExistingUser(user.$id);

        if (!existingUser) {
            console.error('User not found in database');
            return { type: 'redirect', pathname: '/sign-in' };
        }

        // Check if user has admin privileges
        if (!existingUser.status || (existingUser.status !== 'admin' && existingUser.status !== 'superadmin')) {
            console.log('User does not have admin privileges');
            return { type: 'redirect', pathname: '/' };
        }

        // Ensure all required properties exist
        const userStatus: UserStatus = {
            ...existingUser,
            status: existingUser.status,
            $id: existingUser.$id
        };

        return userStatus;
    } catch (error) {
        console.error('Error in admin layout loader:', error);
        return { type: 'redirect', pathname: '/sign-in' };
    }
}

const AdminLayout = () => {
    return (
        <div className="admin-layout">
            <MobileSidebar />

            <aside className="w-full max-w-[270px] hidden lg:block">
                <SidebarComponent width={270} enableGestures={false}>
                    <NavItems />
                </SidebarComponent>
            </aside>

            <aside className="children">
                <Outlet />
            </aside>
        </div>
    )
}
export default AdminLayout