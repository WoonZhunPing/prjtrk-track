"use client";

import {
    useEffect,
    useState
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";
import SideNavbar from "@/components/SideNavbar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
    Pencil,
    Trash2,
    UserPlus
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { User } from "@/types/User";
import {
    toast,
    Toaster
} from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";

function UserPage() {
    // * For cookies
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    const [userData, setUserData] = useState([]);

    const [lastDeleted, setLastDeleted] = useState("");

    const UserCols: ColumnDef<User>[] = [
        {
            accessorKey: "userCode",
            header: "Code",
        },
        {
            accessorKey: "userName",
            header: "Name",
        },
        {
            accessorKey: "userDesc",
            header: "Description",
        },
        {
            accessorKey: "role",
            header: "Role",
        },
        {
            accessorKey: "position",
            header: "Position",
        },
        {
            accessorKey: "email",
            header: "E-mail",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <div>
                        <Button variant={"outline"} className="p-2" onClick={() => { editUser(row.original.userKey) }}>
                            <Pencil />
                        </Button>
                        &nbsp;
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant={"destructive"} className="p-2">
                                    <Trash2 />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {row.original.userName}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure? <br />
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction onClick={() => { deleteUser(row.original.userKey, row.original.userName) }}>Delete</AlertDialogAction>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            }
        },
    ];

    function createUser() {
        navigate('/createuser');
    }

    function editUser(id: number) {
        navigate('/createuser/' + id);
    }

    function deleteUser(id: number, name: string) {
        axios.post('/deleteuser', { data: id })
            .then((res) => {
                if (res.data.message) {
                    toast.error(res.data.message, {
                        description: "Encountered an error while deleting " + name,
                    });
                } else {
                    toast.success("Deleted", {
                        description: "Successfully deleted " + name,
                    });

                    // * Need to only reload user table
                    setLastDeleted(name);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    useEffect(() => {
        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == false) {
                    navigate('/login');
                }
            })

        axios.get('/getallusers')
            .then((res) => {
                setUserData(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [lastDeleted]);

    return (
        <div className="flex items-start">
            <SideNavbar />
            <div className="p-3 w-5/6 h-screen">
                <Header title='Manage Users' />
                <div className="p-1">
                    <Button onClick={createUser}>
                        <UserPlus />&nbsp; Create User
                    </Button>
                </div>
                <div className="p-1 max-w-7xl text-center">
                    <DataTable columns={UserCols} data={userData} />
                </div>
                <Toaster closeButton />
            </div>
        </div>
    )
}

export default UserPage;