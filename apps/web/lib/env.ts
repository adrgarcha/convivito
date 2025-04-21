import { z } from "zod";

const envSchema = z.object({
    TURSO_CONNECTION_URL: z.string().url(),
    TURSO_AUTH_TOKEN: z.string().min(1, "El token de autenticación de Turso es requerido"),
    TURSO_DB_NAME: z.string().min(1, "El nombre de la base de datos de Turso es requerido"),
    RESEND_API_KEY: z.string().min(1, "La clave de la API de Resend es requerida"),
    RESEND_EMAIL: z.string().email("El correo electrónico de Resend no es válido"),
})

const { success, error, data } = envSchema.safeParse(process.env);

if (!success) {
    console.error("❌ Error en las variables de entorno:", error.format());
    throw new Error("❌ Error en las variables de entorno");
}

export const {
    TURSO_CONNECTION_URL,
    TURSO_AUTH_TOKEN,
    TURSO_DB_NAME,
    RESEND_API_KEY,
    RESEND_EMAIL
} = data;