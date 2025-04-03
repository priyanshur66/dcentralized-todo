import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Handle GET request for a specific task
export async function GET(
  request: NextRequest
) {
  const taskId = request.nextUrl.pathname.split('/').pop();
  const authHeader = request.headers.get('Authorization');
  
  try {
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || `Failed to fetch task ${taskId}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy fetch task error:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a specific task
export async function PUT(
  request: NextRequest
) {
  const taskId = request.nextUrl.pathname.split('/').pop();
  const authHeader = request.headers.get('Authorization');
  
  try {
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || `Failed to update task ${taskId}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy update task error:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a specific task
export async function DELETE(
  request: NextRequest
) {
  const taskId = request.nextUrl.pathname.split('/').pop();
  const authHeader = request.headers.get('Authorization');
  
  try {
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const response = await fetch(`${API_URL}/api/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || `Failed to delete task ${taskId}` },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Proxy delete task error:`, error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}