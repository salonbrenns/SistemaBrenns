// src/server/controllers/AuthController.ts
import { ApiResponse, Usuario } from '@/types';

export class AuthController {
  static async login(_correo: string, _password: string): Promise<ApiResponse<{ user: Usuario; token: string }>> {
    try {
      return {
        success: true,
        data: {
          user: {} as Usuario,
          token: '',
        },
      };
    } catch {
      return {
        success: false,
        error: 'Error al iniciar sesión',
      };
    }
  }

  static async register(_datos: Partial<Usuario>, _password: string): Promise<ApiResponse<Usuario>> {
    try {
      return {
        success: true,
        data: {} as Usuario,
      };
    } catch {
      return {
        success: false,
        error: 'Error al registrar usuario',
      };
    }
  }
}