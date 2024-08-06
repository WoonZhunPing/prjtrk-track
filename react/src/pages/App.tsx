"use client";

import {
    useEffect,
    useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '@/api/axios';
import '../css/App.css';
import SideNavbar from "../components/SideNavbar";
import Header from '@/components/Header';
import {
    Card,
    CardContent,
    CardHeader
} from '@/components/ui/card';
import {
    BriefcaseBusiness,
    Users,
    Wrench
} from 'lucide-react';
import { Overview } from '@/types/Overview';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/DataTable';

function App() {
    // * For cookies
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    const [noOfProject, setNoOfProject] = useState(0);

    const [noOfUser, setNoOfUser] = useState(0);

    const [overviewData, setOverviewData] = useState([]);

    const OverviewCols: ColumnDef<Overview>[] = [
        {
            accessorKey: "projectCode",
            header: "Project Code",
        },
        {
            accessorKey: "projectName",
            header: "Project Name",
        },
        {
            accessorKey: "count",
            header: "Number of User(s) Assigned",
        },
    ];

    useEffect(() => {
        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == false) {
                    navigate('/login');
                }
            })
            .catch((err) => {
                console.log(err);
            })

        // * Get number of projects
        axios.get('/noofproject')
            .then((res) => {
                if (res.data.message) {
                    console.log(res.data.message);
                } else {
                    setNoOfProject(res.data.count);
                }
            })
            .catch((err) => {
                console.log(err);
            })

        // * Get number of users
        axios.get('/noofuser')
            .then((res) => {
                if (res.data.message) {
                    console.log(res.data.message);
                } else {
                    setNoOfUser(res.data.count);
                }
            })
            .catch((err) => {
                console.log(err);
            })

        // * Get assign table but with sum (overview)
        axios.get('/noofassigneduser')
            .then((res) => {
                if (res.data.message) {
                    console.log(res.data.message);
                } else {
                    setOverviewData(res.data);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);

    return (
        <div className='flex items-start'>
            <SideNavbar />
            <div className="p-3 w-5/6 h-screen">
                <Header title='Dashboard' />
                <div className='flex gap-4 px-4 pb-3'>
                    <div className='flex items-center w-2/6'>
                        <Card className='w-full'>
                            <CardHeader>
                                <div className="flex flex-row items-center justify-between">
                                    <h3 className='text-md font-medium'>Ongoing Projects</h3>
                                    <BriefcaseBusiness />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h1 className='text-5xl font-bold'>{noOfProject}</h1>
                                <p className="text-xs text-muted-foreground">Number of Ongoing Project(s)</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className='flex items-center w-2/6'>
                        <Card className='w-full'>
                            <CardHeader>
                                <div className="flex flex-row items-center justify-between">
                                    <h3 className='text-md font-medium'>Current Engineers</h3>
                                    <Users />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h1 className="text-5xl font-bold">{noOfUser}</h1>
                                <p className="text-xs text-muted-foreground">Current Number of Engineer(s)</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <div className='flex px-4 py-1'>
                    <Card className='w-full'>
                        <CardHeader>
                            <div className="flex flex-row items-center justify-between">
                                <h3 className='text-md font-medium'>Current Engineers Assigned</h3>
                                <Wrench />
                            </div>
                        </CardHeader>
                        <CardContent className='py-0 text-center'>
                            <DataTable columns={OverviewCols} data={overviewData} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default App;
