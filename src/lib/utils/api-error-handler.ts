import { NextResponse } from "next/server";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      [key: string]: any;
    };
  };
  message?: string;
}

export const handleApiError = (error: ApiError) => {
  // If it's a 401 error with an invalid token, return a specific error
  if (error.response?.status === 401 && error.response?.data?.detail === 'Invalid token.') {
    return NextResponse.json(
      { 
        error: "Token expirado",
        detail: "Invalid token.",
        shouldLogout: true 
      }, 
      { status: 401 }
    );
  }

  // For other 401 errors
  if (error.response?.status === 401) {
    return NextResponse.json(
      { error: "Não autorizado" }, 
      { status: 401 }
    );
  }

  // For other errors
  return NextResponse.json(
    { 
      error: "Erro interno do servidor",
      details: error.response?.data || error.message 
    },
    { status: error.response?.status || 500 }
  );
};

export const isInvalidTokenError = (error: ApiError): boolean => {
  return error.response?.status === 401 && error.response?.data?.detail === 'Invalid token.';
}; 