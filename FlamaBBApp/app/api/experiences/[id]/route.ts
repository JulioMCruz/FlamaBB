import { NextRequest, NextResponse } from 'next/server'

// In a real app, this would be stored in a database
// For now, we'll use a simple in-memory store
const experiences = new Map()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  // Check if we have stored data for this experience
  const storedExperience = experiences.get(id)
  
  if (storedExperience) {
    console.log('📖 Returning stored experience data for:', id)
    return NextResponse.json(storedExperience)
  }
  
  // Fallback to placeholder if no stored data
  console.log('⚠️ No stored data found for experience:', id, '- returning placeholder')
  const experience = {
    id: id,
    title: "Amazing Experience",
    description: "Join me for an incredible experience! This is a placeholder for the actual experience details that would be fetched from the blockchain.",
    location: "123 Main Street, City, Country",
    venue: "Amazing Venue",
    price: "0.05",
    maxParticipants: 12,
    date: "2025-08-31T12:45:00",
    time: "12:45 PM",
    creator: "0x1234...5678",
    status: "Active",
    transactionHash: id
  }

  return NextResponse.json(experience)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  
  console.log('💾 Storing experience data for ID:', id, body)
  
  // Store the experience data
  experiences.set(id, body)
  
  return NextResponse.json({ success: true, id })
}
