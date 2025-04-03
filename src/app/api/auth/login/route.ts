import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Login failed' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 