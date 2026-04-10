import { NextRequest, NextResponse } from "next/server";

// ─── PATRONES DE DETECCIÓN ───────────────────────────────────────────────────

const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|OR|AND)\s/i,
  /(EXEC|EXECUTE|CAST|CONVERT|CHAR|NCHAR)\s*\(/i,
];

const XSS_PATTERNS = [
   /<script[^>]*>[^<]*<\/script>/i,
  /javascript\s*:/i,
  /on\w+\s*=\s*["'][^"']*["']/i,
  /<[^>]{1,200}\son\w{1,50}\s*=/i,
];

// ─── RATE LIMITER MANUAL (por IP) ────────────────────────────────────────────

const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60_000; // 1 minuto

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return false; // No bloqueado
  }

  record.count++;
  if (record.count > MAX_ATTEMPTS) {
    return true; // Bloqueado
  }
  return false;
}

// ─── LOG ESTRUCTURADO ────────────────────────────────────────────────────────

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

// Después
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

      // 3. RATE LIMITING (login/fuerza bruta)
      if (path.includes("/auth") || path.includes("/login")) {
        const blocked = checkRateLimit(ip);
        if (blocked) {
          raspLog("WARNING", "Fuerza bruta detectada - IP bloqueada temporalmente", {
            ip, path, method,
          });
          return NextResponse.json(
            { error: "Demasiados intentos. Espera un momento." },
            { status: 429 }
          );
        }
      }

      // 4. LOG DE ACCESO A RUTAS CRÍTICAS
      const rutasCriticas = ["/admin", "/checkout", "/pedidos", "/usuario"];
      if (rutasCriticas.some((r) => path.startsWith(r))) {
        raspLog("INFO", "Acceso a ruta crítica monitoreado", { ip, path, method });
      }

      // 5. PROTECCIÓN DE CABECERAS
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