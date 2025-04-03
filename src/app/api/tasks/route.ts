import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Handle GET requests to fetch all tasks
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/v1/tasks`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to fetch tasks' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy tasks error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Handle POST requests to create a new task
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/v1/tasks`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to create task' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy create task error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
} 