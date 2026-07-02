// Middleware para manejo de errores del servidor

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      status: error.statusCode,
      data: {
        success: false,
        error: error.message,
      },
    };
  }

  return {
    status: 500,
    data: {
      success: false,
      error: 'Error interno del servidor',
    },
  };
};
