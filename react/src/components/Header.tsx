"use client";

import { cn } from "@/lib/utils";

type Props = {
    title: string,
    className?: string
};

function Header({ title, className }: Props) {
    return (
        <h1 className={cn("text-2xl font-semibold w-full px-6 pb-4", className)}>{title}</h1>
    )
}

export default Header;