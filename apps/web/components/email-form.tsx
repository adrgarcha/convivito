'use client'

import { sendEmail } from "@/app/actions";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const initialState = {
    error: false,
    message: "",
}

export default function EmailForm() {
    const [state, formAction, pending] = useActionState(sendEmail, initialState)

    useEffect(() => {
        if (!state.message) return

        if (state.error) {
            toast.error(state.message)
            return;
        }

        toast.success(state.message)
    }, [state])

    return (
        <form action={formAction} className="flex">
            <Input name="email" type="email" placeholder="Escribe tu email..." className="rounded-e-none bg-white/80 text-sm placeholder:text-sm" />
            <Button type="submit" disabled={pending} className="rounded-s-none hover:cursor-pointer">
                <span>Suscríbete <span className="hidden lg:inline">a la Waitlist</span></span>
            </Button>
        </form>
    )
}