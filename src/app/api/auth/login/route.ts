import { NextResponse } from "next/server";
import { withRasp } from "@/lib/withRasp";

// Definimos la lógica del login
const loginHandler = async (req: Request) => {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Lógica de negocio (simulada para tu prueba)
    const nombreFromEmail = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
    const token = `demo-token-${email}`;

    return NextResponse.json({ 
      token, 
      user: { 
        email,
        nombre: nombreFromEmail,
        fechaRegistro: new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long" })
      } 
    });
  } catch (err) {
    console.error("Error en el proceso de Login:", err);
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }
};

// Exportamos la función POST protegida por el RASP
export const POST = withRasp(loginHandler);