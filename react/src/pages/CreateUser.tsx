"use client";

import axios from "@/api/axios";
import Header from "@/components/Header";
import SideNavbar from "@/components/SideNavbar";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { sha1 } from "js-sha1";
import {
    CircleX,
    Save
} from "lucide-react";
import {
    useEffect,
    useState
} from "react";
import { useForm } from "react-hook-form";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import { z } from "Zod";

// const FormSchema = z.object({
//     userCode: z.string().min(1, {
//         message: "Please enter a valid User Code."
//     }),
//     userName: z.string().min(1, {
//         message: "Please enter a valid User Name."
//     }),
//     userDesc: z.string().optional(),
//     role: z.enum(["user", "admin"]),
//     position: z.string().optional(),
//     email: z.string().email({
//         message: "Please enter a valid email address."
//     }),
//     password: z.string().min(1, {
//         message: "Password is required."
//     })
//     // password: z.string().optional()
//     // TODO Use zod superrefine
// });

function getSchema(isEdit: boolean) {
    return z.object({
        userCode: z.string().min(1, {
            message: "Please enter a valid User Code."
        }),
        userName: z.string().min(1, {
            message: "Please enter a valid User Name."
        }),
        userDesc: z.string().optional(),
        role: z.enum(["user", "admin"]),
        position: z.string().optional(),
        email: z.string().email({
            message: "Please enter a valid email address."
        }),
        password: isEdit ? z.string().optional() : z.string().min(1, { message: "Please enter a valid Password." })
    });
}

// const CreateSchema = getSchema(false);

// const EditSchema = getSchema(true);

function CreateUser() {
    // * For cookies
    axios.defaults.withCredentials = true;

    const navigate = useNavigate();

    // * Set Save button status
    const [saving, setSaving] = useState(false);

    // * Display save status
    const [saveStatus, setSaveStatus] = useState("");

    // * Get userKey
    const keyData = useParams();
    const key = keyData.id;

    /*
    TODO To be used for updatedBy & updatedDate
    * // * Get userKey from localStorage
    * const userData = localStorage.getItem('user');
    * const userJson = JSON.parse(userData);
    * const userKey = userJson.userKey;
    *
    * // * Get current datetime for createdDate
    * const currentDateTime = formatISO(new Date());
    */

    // * Cancel button
    // TODO add checking before discarding changes using form.formState.isDirty
    function back() {
        navigate('/user');
    }

    // * Use different set of fields depending on Create/Edit
    const setSchema = () => {
        if (key) {
            return getSchema(true);
        } else {
            return getSchema(false);
        }
    };

    const FormSchema = setSchema();

    const form = useForm<Zod.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {}
    });

    // * Reset & prefill default values
    const { reset } = form;

    // * onSubmit for Create
    function onSubmit(data: Zod.infer<typeof FormSchema>) {
        // * To disable save button being pressed many times
        setSaving(true);

        // * Hash password
        data.password = sha1(data.password!);

        // * Create new user
        axios.post('/createuser', { data })
            .then((res) => {
                if (res.data.message) {
                    setSaveStatus(res.data.message);
                } else {
                    navigate('/user');
                    // TODO add a Sonner (toast) to display successful creation
                }

                setSaving(false);
            })
            .catch(() => {
                setSaveStatus("Server/network error.");
                setSaving(false);
            })
    };

    // * onSubmit for Edit
    function onEditSubmit(data: Zod.infer<typeof FormSchema>) {
        // * To disable save button being pressed many times
        setSaving(true);

        if (data.password) {
            // * Update with password
            data.password = sha1(data.password);

            axios.post('/updateuser', { data, key })
                .then((res) => {
                    if (res.data.message) {
                        setSaveStatus(res.data.message);
                    } else {
                        navigate('/user');
                        // TODO add a Sonner (toast) to display successful update
                    }

                    setSaving(false);
                })
                .catch(() => {
                    setSaveStatus("Server/network error.");
                    setSaving(false);
                })
        } else {
            // * Update without updating password
            axios.post('/updateuserwopass', { data, key })
                .then((res) => {
                    if (res.data.message) {
                        setSaveStatus(res.data.message);
                    } else {
                        navigate('/user');
                        // TODO add a Sonner (toast) to display successful update
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

        axios.post('/getuser', { key })
            .then((res) => {
                if (res.data.message) {
                    setSaveStatus(res.data.message);
                } else {
                    if (key) {
                        // * Reset & prefill default values
                        reset({
                            userCode: res.data.data.userCode,
                            userName: res.data.data.userName,
                            userDesc: res.data.data.userDesc || undefined,
                            role: res.data.data.role == 1 ? "admin" : "user",
                            position: res.data.data.position || undefined,
                            email: res.data.data.email
                        });
                    } else {
                        // TODO reset({updatedBy & updatedDate})
                    }
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);

    return (
        <div className="flex items-stretch">
            <SideNavbar />
            <div className="p-3 w-5/6 h-screen">
                <Header title={key ? 'Update User' : 'Create New User'} />
                <Form {...form}>
                    <form onSubmit={key ? form.handleSubmit(onEditSubmit) : form.handleSubmit(onSubmit)}>
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
                                    // * User Code
                                    name="userCode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>User Code</FormLabel>
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
                                    // * User Name
                                    name="userName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>User Name</FormLabel>
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
                                // * User Description
                                name="userDesc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Description</FormLabel>
                                        <FormControl>
                                            {/* // TODO change max-h-56 to percentage */}
                                            <Textarea className="max-h-48" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex justify-items-center">
                            <div className="w-3/6 px-2 py-3">
                                <FormField
                                    control={form.control}
                                    // * Position
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="w-3/12 px-2 py-3">
                                <FormField
                                    control={form.control}
                                    // * Role
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    // value={field.value}
                                                    {...field}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose one..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
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
                                    // * Email
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
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
                                    // * Password
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default CreateUser;