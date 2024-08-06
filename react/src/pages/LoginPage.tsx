"use client";

import {
    Card,
    CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "Zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { sha1 } from "js-sha1";
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";

const FormSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address."
    }),
    password: z.string().min(1, {
        message: "Password is required."
    })
});

// TODO add div for mobile app

function LoginPage() {
    // * For cookies
    axios.defaults.withCredentials = true;

    // * for navigating/routing pages
    const navigate = useNavigate();

    // * set Login button status
    const [loading, setLoading] = useState(false);

    //* display login status (login success/fail)
    const [loginStatus, setLoginStatus] = useState("");

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // * set loading to true to disable login button
        setLoading(true);

        data.password = sha1(data.password);

        axios.post('/login', { data })
            .then((res) => {
                if (res.data.message) {
                    setLoginStatus(res.data.message);
                } else {
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                    navigate('/');
                }

                // * set loading back to false to enable login button
                setLoading(false);
            })
            .catch(() => {
                setLoginStatus("Server/network error.");
                // * set loading back to false to enable login button
                setLoading(false);
            })
    };

    useEffect(() => {
        axios.get('/login')
            .then((res) => {
                if (res.data.loggedIn == true) {
                    navigate('/');
                }
            })
    });

    return (
        <div className="h-screen flex items-center justify-center">
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <CardTitle>Log In</CardTitle>
                    <CardDescription>Log in to your account using email</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="example@email.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            &nbsp;
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="pt-4 pb-1">
                                <p className="flex justify-center text-red-500 font-semibold">{loginStatus}</p>
                            </div>
                            <Button className="w-full" type="submit" disabled={loading}>
                                {loading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                {/* <CardFooter>
                    <p>Forgot password?</p>
                    <p>Register an account<p/>
                    // TODO add a card to download mobile app
                </CardFooter> */}
            </Card>
        </div>
    )
}

export default LoginPage;