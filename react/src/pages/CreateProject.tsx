"use client";

import axios from "@/api/axios";
import Header from "@/components/Header";
import SideNavbar from "@/components/SideNavbar";
import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger
// } from "@/components/ui/popover";
// import { cn } from "@/lib/utils";
// import { formatISO } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    // Calendar as CalendarIcon,
    CircleX,
    Save,
    ScrollText
} from "lucide-react";
import {
    useEffect,
    useState
} from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "Zod";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "@/components/DatePicker";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { toast, Toaster } from "sonner";



const FormSchema = z.object({
    projectCode: z.string().min(1, {
        message: "Please enter a valid Project Code."
    }),
    projectName: z.string().min(1, {
        message: "Please enter a valid Project Name."
    }),
    projectDesc: z.string().optional(),
    projectValue: z.coerce.number().refine((val) => !Number.isNaN(val) && val > 0, {
        message: "Expected number, received a string"
    }),
    targetHour: z.coerce.number().refine((val) => !Number.isNaN(val) && val > 0, {
        message: "Expected number, received a string"
    }),
    targetCost: z.coerce.number().refine((val) => !Number.isNaN(val) && val > 0, {
        message: "Expected number, received a string"
    }),
    startDate: z.date(),
    endDate: z.date(),
    createdBy: z.number().nonnegative().optional(),
    createdDate: z.coerce.date().optional(),
    updatedBy: z.number().nonnegative().optional(),
    updatedDate: z.coerce.date().optional()
});

const AssignFormSchema = z.object({
    userKey: z.string({ errorMap: () => ({ message: "Please select at least one user to assign" }) }),
    commissionPer: z.coerce.number().refine((val) => val > 0 && val <= 100, {
        message: "Please enter range from 0 to 100%"
    }),
});

interface UserOption {
    userKey: number;
    userCode: string;
    userName: string;
}

function CreateProject() {
    // * For cookies
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    // * Set Save button status
    const [saving, setSaving] = useState(false);

    // * Display save status
    const [saveStatus, setSaveStatus] = useState("");

    // * Handle Tab Switching 
    const [switchTab, setSwitchTab] = useState("projectDetails")

    // * Handle Alert Dialog on tab switching
    const [alertTab, setAlertTab] = useState(false);

    // * Get projectKey
    const keyData = useParams();
    const key = keyData.id;

    // * Get userKey from localStorage
    const userData = localStorage.getItem('user');
    const userJson = JSON.parse(userData!);
    const userKey = userJson.userKey;

    // * Get current datetime for createdDate
    const currentDateTime = new Date();

    // * Options user for assign project 
    const [options, setOptions] = useState<{ data?: UserOption[] }>({});

    // * Set open status for dialog in assign tab
    const [isOpen, setIsOpen] = useState(false);

    // * Cancel button
    // TODO add checking before discarding changes using form.formState.isDirty
    function back() {
        navigate('/project');
    }

    // *  assign project Data
    const [assignData, setAssignData] = useState([]);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {}
    });

    // * Assign Data Form
    const assignForm = useForm<z.infer<typeof AssignFormSchema>>({
        resolver: zodResolver(AssignFormSchema),
        defaultValues: {}
    });

    // * Reset & prefill default values
    const { reset } = form;

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // * To disable save button being pressed many times
        setSaving(true);

        if (key) {
            // * Update project
            axios.post('/updateproject', { data, key })
                .then((res) => {
                    if (res.data.message) {
                        setSaveStatus(res.data.message);
                    } else {
                        navigate('/project');
                        // TODO add a Sonner (toast) to display successful update
                    }

                    setSaving(false);
                })
                .catch(() => {
                    setSaveStatus("Server/network error.");
                    setSaving(false);
                })

        } else {
            // * Create new project
            axios.post('/createproject', { data })
                .then((res) => {
                    if (res.data.message) {
                        setSaveStatus(res.data.message);
                    } else {
                        navigate('/project');
                        // TODO add a Sonner (toast) to display successful creation
                    }

                    setSaving(false);
                })
                .catch(() => {
                    setSaveStatus("Server/network error.");
                    setSaving(false);
                })
        }
    };

    useEffect(() => {
        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == false) {
                    navigate('/login');
                }
            })

        axios.post('/getproject', { key })
            .then((res) => {
                if (res.data.message) {
                    setSaveStatus(res.data.message);
                } else {
                    if (key) {
                        // * Reset & prefill default values
                        reset({
                            ...res.data.data,
                            projectDesc: res.data.data.projectDesc || undefined,
                            startDate: new Date(res.data.data.startDate),
                            endDate: new Date(res.data.data.endDate),
                            updatedBy: userKey,
                            updatedDate: currentDateTime
                        });
                    } else {
                        reset({
                            createdBy: userKey,
                            createdDate: currentDateTime
                        });
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            })

        // Fetch the option for assign user 
        assignUserOption();

        // Fetch Assign Table
        updateAssignTable();

    }, []);

    // submit function for assign project
    function onSubmitAssignProject(data: z.infer<typeof AssignFormSchema>) {

        axios.post('/assignproject', { data, key, userKey })
            .then((res) => {
                if (res.data.message) {
                    //setSaveStatus(res.data.message);
                    console.log("fail assign")
                } else {
                    // Close the dialog and reset the assignForm
                    updateAssignTable().then(() => {
                        setIsOpen(false);
                        assignForm.reset();
                    });

                    // Update the user assign option
                    assignUserOption();

                }


            })
            .catch(() => {
            })

    };

    // Fetch the assign table 
    async function updateAssignTable() {
        axios.post('/getassignproject', { key })
            .then((res) => {
                setAssignData(res.data)
            })
            .catch((err) => {
                console.log(err);
            });
    }

    // Fetch option for assign (user option)
    function assignUserOption() {
        axios.post('/getuseroption', { key })
            .then((res) => {
                if (res.data.message) {

                } else {
                    // * Reset & prefill default values
                    setOptions(res.data);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    function deleteAssign(assignUserKey: number, assignUserName: string) {
        axios.post('/deleteassign', { assignUserKey, key })
            .then((res) => {
                if (res.data.message) {
                    toast.error(res.data.message, {
                        description: "Encountered an error while deleting " + assignUserName,
                    });
                } else {
                    //  Update assign user option
                    assignUserOption();

                    // Update assign table
                    updateAssignTable()
                    toast.success("Deleted", {
                        description: "Successfully deleted " + assignUserName,
                    });


                }
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const handleSwitchTab = (newTab: string) => {

        if (newTab == "assignProject") {
            console.log("here")
            checkCreateStatus(newTab);

        } else {
            setSwitchTab(newTab)
        }

    }

    // function to check the project is create or update then block tab switch and pop alert
    function checkCreateStatus(newTab: string) {
        if (!key) {
            setAlertTab(true)
        } else {
            setSwitchTab(newTab)
        }

    }


    // DataTable for assign 
    const AssignCols: ColumnDef<{ userKey: number, userName: string, commissionPer: number }>[] = [
        {
            accessorKey: "userName",
            header: "User Name",
        },
        {
            accessorKey: "commissionPer",
            header: "Commission (%)",
        },
        {
            accessorKey: "actions",
            header: "Actions",
            cell: ({ row }) => {
                return (
                    <div>
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
                                    <AlertDialogAction onClick={() => deleteAssign(row.original.userKey, row.original.userName)}>Delete</AlertDialogAction>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )
            }
        },
    ];


    return (
        <div className="flex items-stretch">
            <SideNavbar />
            <div className="p-3 w-5/6 h-screen">
                <Header title={key ? 'Update Project' : 'Create New Project'} />
                <Tabs value={switchTab} onValueChange={handleSwitchTab}>
                    <TabsList className="grid w-[450px] grid-cols-2">
                        <TabsTrigger value="projectDetails">Project Details</TabsTrigger>
                        <TabsTrigger value="assignProject">Assign</TabsTrigger>
                        <AlertDialog open={alertTab} onOpenChange={setAlertTab}>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Error</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Not allowed to assign user<br />
                                        Please create a project first
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="items-center">
                                    <AlertDialogCancel>OK</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TabsList>
                    <TabsContent value="projectDetails">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="p-1">
                                    <Button className="w-1/12" disabled={saving}>
                                        {saving ? "Saving..." : <><Save /> &nbsp;Save</>}
                                    </Button>
                                    &nbsp;
                                    <Button className="w-1/12" variant={"destructive"} onClick={back}>
                                        <CircleX /> &nbsp;Cancel
                                    </Button>
                                    <div>
                                        <p className="flex justify-start text-red-500 font-semibold">{saveStatus}</p>
                                    </div>
                                </div>
                                <div className="flex justify-items-center">
                                    <div className="w-3/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Project Code
                                            name="projectCode"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Code</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-3/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Project Name
                                            name="projectName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="px-2 py-3">
                                    <FormField
                                        control={form.control}
                                        // * Project Description
                                        name="projectDesc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Project Description</FormLabel>
                                                <FormControl>
                                                    {/* // TODO change max-h-56 to percentage */}
                                                    <Textarea {...field} className="max-h-48" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex justify-items-center">
                                    <div className="w-2/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Project Value
                                            name="projectValue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Value</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-2/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Target Hour
                                            name="targetHour"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Hour</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-2/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Target Cost
                                            name="targetCost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Target Cost</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-items-center">
                                    <div className="w-3/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * Start Date
                                            name="startDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project Start Date</FormLabel>
                                                    <br />
                                                    <DatePicker
                                                        value={field.value}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                form.setValue('startDate', date)
                                                            }
                                                        }}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="w-3/6 px-2 py-3">
                                        <FormField
                                            control={form.control}
                                            // * End Date
                                            name="endDate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Project End Date</FormLabel>
                                                    <br />
                                                    <DatePicker
                                                        value={field.value}
                                                        onChange={(date) => {
                                                            if (date) {
                                                                form.setValue('endDate', date)
                                                            }
                                                        }}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>
                    <TabsContent value="assignProject">
                        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
                            <AlertDialogTrigger asChild>
                                <Button className="w-2/12 h-9 rounded-md m-1">
                                    <ScrollText /> &nbsp; Assign Project
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="sm:max-w-[525px]">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Assign Project</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Form {...assignForm}>
                                    <form onSubmit={assignForm.handleSubmit(onSubmitAssignProject)}>
                                        <div className="grid gap-4 py-4">
                                            <FormField
                                                control={assignForm.control}
                                                name="userKey"
                                                render={({ }) => (
                                                    <div className="grid grid-cols-4 items-center gap-4">

                                                        <Label htmlFor="userKey" className="text-right">
                                                            UserID
                                                        </Label>
                                                        <Select onValueChange={(value) => { assignForm.setValue("userKey", value) }}>
                                                            <SelectTrigger className="col-span-3">
                                                                <SelectValue placeholder="Select an user" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {options.data ? (
                                                                    options.data.map((item) => (
                                                                        <SelectItem key={item.userKey} value={item.userKey.toString()}>
                                                                            {item.userCode + " - " + item.userName}
                                                                        </SelectItem>
                                                                    ))
                                                                ) : (
                                                                    <option>Loading...</option>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="col-start-2 col-span-3" />
                                                    </div>
                                                )}

                                            />



                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <FormField
                                                    control={assignForm.control}
                                                    // * Project Description
                                                    name="commissionPer"
                                                    render={({ field }) => (
                                                        <FormItem className="col-span-4 grid grid-cols-4 items-center gap-4">
                                                            <FormLabel className="col-span-1 text-right">Commision Percentage</FormLabel>
                                                            <FormControl className="col-span-3">
                                                                <Input {...field} type="number" className="" placeholder="%" />
                                                            </FormControl>
                                                            <FormMessage className="col-start-2 col-span-3" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                        <AlertDialogFooter>
                                            <Button type="submit">
                                                Assign</Button>
                                            <AlertDialogCancel onClick={() => {
                                                // Reset the form when close
                                                assignForm.reset();
                                            }}>Cancel</AlertDialogCancel>
                                        </AlertDialogFooter>
                                    </form>
                                </Form>
                            </AlertDialogContent>
                        </AlertDialog>

                        <div className="p-1 max-w-7xl text-center">
                            <DataTable columns={AssignCols} data={assignData} />
                        </div>
                    </TabsContent>
                </Tabs>
                <Toaster closeButton />
            </div>
        </div >
    )
}

export default CreateProject;