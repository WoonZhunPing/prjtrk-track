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
    CirclePlus,
    Pencil,
    Trash2
} from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
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
import {
    toast,
    Toaster
} from "sonner";
import { Project } from "@/types/Project";

function ProjectPage() {
    // * For cookies
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    const [projectData, setProjectData] = useState([]);

    const [lastDeleted, setLastDeleted] = useState("");

    // TODO Add max-width to each columns
    const ProjectCols: ColumnDef<Project>[] = [
        {
            accessorKey: "projectCode",
            header: "Project Code",
        },
        {
            accessorKey: "projectName",
            header: "Project Name",
        },
        {
            accessorKey: "projectDesc",
            header: "Project Description",
        },
        {
            accessorKey: "projectValue",
            header: "Project Value",
        },
        {
            accessorKey: "targetHour",
            header: "Target Hour",
        },
        {
            accessorKey: "targetCost",
            header: "Target Cost",
        },
        {
            accessorKey: "startDate",
            header: "Start Date",
        },
        {
            accessorKey: "endDate",
            header: "End Date",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <div>
                        <Button variant={"outline"} className="p-2" onClick={() => { editProject(row.original.projectKey) }}>
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
                                    <AlertDialogTitle>Delete {row.original.projectName}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure? <br />
                                        This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction onClick={() => { deleteProject(row.original.projectKey, row.original.projectName) }}>Delete</AlertDialogAction>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            }
        },
    ];

    function createProject() {
        navigate('/createproject');
    }

    function editProject(id: number) {
        navigate('/createproject/' + id);
    };

    function deleteProject(id: number, name: string) {
        axios.post('/deleteproject', { data: id })
            .then((res) => {
                if (res.data.message) {
                    toast.error(res.data.message, {
                        description: "Encountered an error while deleting " + name,
                    });
                } else {
                    toast.success("Deleted", {
                        description: "Successfully deleted " + name,
                    });

                    // * Need to only reload project table
                    setLastDeleted(name);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    };

    useEffect(() => {
        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == false) {
                    navigate('/login');
                }
            })

        axios.get('/getallprojects')
            .then((res) => {
                setProjectData(res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, [lastDeleted]);

    return (
        <div className="flex items-stretch">
            <SideNavbar />
            <div className="p-3 w-5/6 h-screen">
                <Header title='Manage Projects' />
                <div className="p-1">
                    <Button className="p-2" onClick={createProject}>
                        <CirclePlus />&nbsp; Create Project
                    </Button>
                </div>
                <div className="p-1 max-w-7xl text-center">
                    <DataTable columns={ProjectCols} data={projectData} />
                </div>
                <Toaster closeButton />
            </div>
        </div>
    )
}

export default ProjectPage;