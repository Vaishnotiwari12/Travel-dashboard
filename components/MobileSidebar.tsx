// @ts-nocheck

import {Link} from "react-router";
import {SidebarComponent} from "@syncfusion/ej2-react-navigations";
import NavItems from "./NavItem";

const MobileSidebar = () => {
    let sidebar: SidebarComponent;

    const toggleSidebar = () => {
        sidebar.toggle()
    }

    return (
        <div className="mobile-sidebar wrapper">
            <header className="flex justify-between items-center">
                <Link to="/">
                    <img
                        src="/assets/icons/logo.svg"
                        alt="Logo"
                        className="size-[30px]"
                    />
                    <h1 className="text-lg md:text-xl font-semibold">Tourvisto</h1>
                </Link>
                <button 
                    onClick={toggleSidebar}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <svg 
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </header>

            <SidebarComponent
                width={270}
                ref={(Sidebar) => sidebar = Sidebar}
                created={() => sidebar.hide()}
                closeOnDocumentClick={true}
                showBackdrop={true}
                type="over"
            >
                <div className="mobile-nav">
                    <NavItems />
                </div>
            </SidebarComponent>
        </div>
    )
}
export default MobileSidebar