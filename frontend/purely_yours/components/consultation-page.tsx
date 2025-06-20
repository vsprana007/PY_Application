"use client"

import { useState } from "react"
import { Calendar, Phone, Video, MessageCircle } from "lucide-react"

export function ConsultationPage() {
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [consultationType, setConsultationType] = useState("video")

  const doctors = [
    {
      id: "1",
      name: "Dr. Priya Sharma",
      specialization: "Ayurvedic Medicine",
      experience: "15 years",
      rating: 4.8,
      image: "/placeholder.svg?height=80&width=80",
      fee: 500,
    },
    {
      id: "2",
      name: "Dr. Rajesh Kumar",
      specialization: "Herbal Medicine",
      experience: "12 years",
      rating: 4.7,
      image: "/placeholder.svg?height=80&width=80",
      fee: 450,
    },
    {
      id: "3",
      name: "Dr. Meera Patel",
      specialization: "Nutrition & Wellness",
      experience: "10 years",
      rating: 4.9,
      image: "/placeholder.svg?height=80&width=80",
      fee: 600,
    },
  ]

  const timeSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
  ]

  const upcomingConsultations = [
    {
      id: "1",
      doctor: "Dr. Priya Sharma",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "Video Call",
      status: "Confirmed",
    },
  ]

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Doctor Consultation</h1>
        <p className="text-gray-600">Book a consultation with our wellness experts</p>
      </div>

      {/* Upcoming Consultations */}
      {upcomingConsultations.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">Upcoming Consultations</h2>
          {upcomingConsultations.map((consultation) => (
            <div key={consultation.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{consultation.doctor}</h3>
                  <p className="text-sm text-gray-600">
                    {consultation.date} at {consultation.time}
                  </p>
                  <p className="text-sm text-gray-600">{consultation.type}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{consultation.status}</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm">Join Call</button>
                <button className="flex-1 border border-gray-300 py-2 rounded text-sm">Reschedule</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book New Consultation */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Book New Consultation</h2>

        {/* Consultation Type */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Consultation Type</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setConsultationType("video")}
              className={`p-3 rounded-lg border text-center ${
                consultationType === "video" ? "border-green-600 bg-green-50" : "border-gray-300"
              }`}
            >
              <Video className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Video Call</span>
            </button>
            <button
              onClick={() => setConsultationType("phone")}
              className={`p-3 rounded-lg border text-center ${
                consultationType === "phone" ? "border-green-600 bg-green-50" : "border-gray-300"
              }`}
            >
              <Phone className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Phone Call</span>
            </button>
            <button
              onClick={() => setConsultationType("chat")}
              className={`p-3 rounded-lg border text-center ${
                consultationType === "chat" ? "border-green-600 bg-green-50" : "border-gray-300"
              }`}
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-1" />
              <span className="text-xs">Chat</span>
            </button>
          </div>
        </div>

        {/* Select Doctor */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Doctor</h3>
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor.id)}
                className={`border rounded-lg p-3 cursor-pointer ${
                  selectedDoctor === doctor.id ? "border-green-600 bg-green-50" : "border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <h4 className="font-medium">{doctor.name}</h4>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600">{doctor.experience} experience</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{doctor.fee}</p>
                    <p className="text-sm text-gray-600">⭐ {doctor.rating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Select Date */}
        <div className="mb-4">
          <h3 className="font-medium mb-2">Select Date</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Select Time */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Select Time</h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2 rounded border text-sm ${
                  selectedTime === time ? "border-green-600 bg-green-50" : "border-gray-300"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        {/* Book Button */}
        <button
          disabled={!selectedDoctor || !selectedDate || !selectedTime}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Book Consultation
        </button>
      </div>

      {/* No Consultations Message */}
      {upcomingConsultations.length === 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium mb-2">No consultations found</h3>
          <p className="text-gray-600 text-sm">Book your first consultation with our wellness experts</p>
        </div>
      )}
    </div>
  )
}
