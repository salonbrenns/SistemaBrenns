import { NextRequest, NextResponse } from "next/server";

// ─── PATRONES DE DETECCIÓN ───────────────────────────────────────────────────

// Nota: OR y AND se quitaron — son palabras comunes en texto normal (notas, nombres)
// y causaban falsos positivos. Los patrones restantes cubren ataques reales.
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\s/i,
  /(EXEC|EXECUTE|CAST|CONVERT|CHAR|NCHAR)\s*\(/i,
];

const XSS_PATTERNS = [
   /<script[^>]*>[^<]*<\/script>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<[^>]{1,200}\son\w{1,50}\s*=/i,
];

// ─── LOG ESTRUCTURADO ────────────────────────────────────────────────────────
// Nota: el rate limiting por IP ya se maneja en middleware.ts — no se duplica aquí.

function raspLog(level: "INFO" | "WARNING" | "CRITICAL", message: string, details: object) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...details,
  };
  if (level === "CRITICAL") console.error("[RASP]", JSON.stringify(entry));
  else if (level === "WARNING") console.warn("[RASP]", JSON.stringify(entry));
  else console.log("[RASP]", JSON.stringify(entry));
}

// ─── WRAPPER PRINCIPAL ───────────────────────────────────────────────────────

export function withRasp(handler: (req: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (req: NextRequest, ...args: unknown[]) => {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const path = req.nextUrl.pathname;
    const method = req.method;

    try {
      const bodyText = await req.clone().text();

      // 1. DETECCIÓN DE SQL INJECTION
      const isSqlInjection = SQL_INJECTION_PATTERNS.some((p) => p.test(bodyText));
      if (isSqlInjection) {
        raspLog("CRITICAL", "SQL Injection detectado y bloqueado", {
          ip, path, method, body: bodyText.slice(0, 200),
        });
        return NextResponse.json(
          { error: "Actividad maliciosa detectada y bloqueada por RASP" },
          { status: 403 }
        );
      }

      // 2. DETECCIÓN DE XSS
      const isXss = XSS_PATTERNS.some((p) => p.test(bodyText));
      if (isXss) {
        raspLog("CRITICAL", "Intento de XSS detectado y bloqueado", {
          ip, path, method, body: bodyText.slice(0, 200),
        });
        return NextResponse.json(
          { error: "Contenido malicioso bloqueado por RASP" },
          { status: 403 }
        );
      }

      // 3. LOG DE ACCESO A RUTAS CRÍTICAS
      const rutasCriticas = ["/admin", "/checkout", "/pedidos", "/usuario"];
      if (rutasCriticas.some((r) => path.startsWith(r))) {
        raspLog("INFO", "Acceso a ruta crítica monitoreado", { ip, path, method });
      }

      // 4. PROTECCIÓN DE CABECERAS
      const response = await handler(req, ...args);
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

      return response;

    } catch (error) {
      raspLog("WARNING", "Fallo técnico en monitoreo RASP", { ip, path, error: String(error) });
      return NextResponse.json({ error: "Error en la capa de protección" }, { status: 500 });
    }
  };
}