// app/api/forklift-arrival/route.js

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { zone, items } = body
    
    if (!zone || !items) {
      return new NextResponse('Missing required parameters', { status: 400 })
    }
    
    // Log the arrival event (would go to database in real app)
    console.log(`Forklift arrived at Zone ${zone} with ${items.length} items`)
    
    // Simulate processing delay (500-1000ms)
    const processingDelay = 500 + Math.floor(Math.random() * 500)
    
    // Simulate network delay (200-400ms)
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 200))
    
    return NextResponse.json({
      success: true,
      zone,
      itemCount: items.length,
      processingDelay,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Error in forklift-arrival API:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}