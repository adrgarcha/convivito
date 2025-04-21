'use server'

import { turso } from "@/lib/db";
import { RESEND_EMAIL, TURSO_DB_NAME } from "@/lib/env";
import { resend } from "@/lib/resend";
import { WaitlistWelcome } from "transactional";

export async function sendEmail(prevState: any, formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return { error: true, message: "Algo salió mal. Inténtalo de nuevo." }
    }

    try {
        await turso.execute({
            sql: `INSERT INTO ${TURSO_DB_NAME} (email) VALUES (?)`,
            args: [email],
        })

        await resend.emails.send({
            from: `Convivito <${RESEND_EMAIL}>`,
            to: email,
            subject: "👋 ¡Bienvenido a la Waitlist de Convivito!",
            react: <WaitlistWelcome email={email} />,
        })
    } catch (error) {
        console.error("Error inserting or sending email:", error);
        return { error: true, message: "Algo salió mal. Inténtalo de nuevo." }
    }

    return { error: false, message: `¡Listo! Comprueba tu bandeja de entrada.` }
}