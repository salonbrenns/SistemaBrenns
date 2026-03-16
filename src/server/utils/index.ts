// Utilidades del servidor

/**
 * Respuesta exitosa de la API
 */
export const successResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message,
  };
};

/**
 * Respuesta de error de la API
 */
export const errorResponse = (error: string, message?: string) => {
  return {
    success: false,
    error,
    message,
  };
};

/**
 * Validar que un email tenga formato correcto
 */
export const validarEmail = (email: string): boolean => {
  if (email.length > 254) return false
  const regex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}
/**
 * Validar que una contraseña sea segura
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};
