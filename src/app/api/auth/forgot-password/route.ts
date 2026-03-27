// src/app/api/auth/forgot-password/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { withRasp } from "@/lib/withRasp";


async function forgotPasswordHandler(req: NextRequest) {
  try {
    const { email } = await req.json();

    // AQUÍ VA TU LÓGICA DE BACKEND
    // 1. Verificar si el email existe en tu base de datos
    // 2. Generar un token de reseteo
    // 3. Enviar el email (usando Nodemailer, Resend, etc.)

    console.log("Solicitud de recuperación para:", email);

    // Respuesta de éxito temporal
    return NextResponse.json({ message: "Instrucciones enviadas correctamente" }, { status: 200 });

  } catch (error) {
  console.error("Error en forgot-password:", error); // Ahora sí se usa la variable
  return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
}}
export const POST = withRasp(forgotPasswordHandler);