"use client";

// import { useState } from "react";
import { Nav } from "./ui/nav";
import {
    BriefcaseBusiness,
    Home,
    LogOut,
    Users
} from "lucide-react";

type Props = {};

function SideNavbar({ }: Props) {
    // const [isCollapsed, setIsCollapsed] = useState(false);
    const isCollapsed = false;
    // function toggleSideNavbar() {
    //     setIsCollapsed(!isCollapsed);
    // };

    return (
        <div className="relative w-1/6 border-r px-3 pt-14 pb-2 h-screen grid grid-rows-2 justify-between">
            {/* TODO unhide toggleCollapse button */}
            {/* <div className="absolute right-[-20px] top-3">
                <Button variant={"secondary"} onClick={toggleSideNavbar} className="rounded-xl p-2">
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
            </div> */}
            {/*
                // TODO add company logo on top
            */}
            <div>
                <Nav
                    // TODO fix isCollapsed resets each time other link is clicked
                    isCollapsed={isCollapsed}
                    links={[
                        // TODO add company logo at top (2 sizes: collapsed and not collapsed)
                        {
                            title: "Dashboard",
                            // label: "",
                            icon: Home,
                            variant: "default",
                            href: "/"
                        },
                        {
                            title: "Project",
                            // label: "",
                            icon: BriefcaseBusiness,
                            variant: "ghost",
                            href: "/project"
                        },
                        {
                            title: "User",
                            // label: "",
                            icon: Users,
                            variant: "ghost",
                            href: "/user"
                        }
                    ]}
                />
            </div>
            <div className="content-end">
                <Nav
                    isCollapsed={isCollapsed}
                    links={[
                        // TODO add Profile Page
                        // {
                        //     title: "Profile",
                        //     // label: "",
                        //     icon: CircleUser,
                        //     variant: "ghost",
                        //     href: "/profile"
                        // },
                        {
                            title: "Logout",
                            // label: "",
                            icon: LogOut,
                            variant: "ghost",
                            href: "/logout"
                        }
                    ]}
                />
            </div>
        </div>
    );
}

export default SideNavbar;