import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request)
    if ("error" in authResult) {
      return authResult.error
    }

    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      totalRevenue,
      upcomingEvents,
      totalCustomers,
    ] = await Promise.all([
      prisma.event.count(),
      prisma.event.count({ where: { status: "PENDING" } }),
      prisma.event.count({ where: { status: "CONFIRMED" } }),
      prisma.event.count({ where: { status: "COMPLETED" } }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.event.count({
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          eventDate: { gte: new Date() },
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ])

    // Recent bookings (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentBookings = await prisma.event.count({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
    })

    return NextResponse.json({
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        upcomingEvents,
        totalCustomers,
        recentBookings,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

