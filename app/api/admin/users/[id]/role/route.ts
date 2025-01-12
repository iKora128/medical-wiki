import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyAuth, verifyRole, handleAuthError, ROLES } from "@/lib/auth"
import { successResponse, errorResponse } from "@/lib/api-response"
import { z } from "zod"

const roleUpdateSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.USER])
})

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request)
    await verifyRole(user, ROLES.ADMIN)

    const body = await request.json()
    const { role } = roleUpdateSchema.parse(body)

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return successResponse(updatedUser, 'ユーザーロールを更新しました')
  } catch (error) {
    return handleAuthError(error)
  }
} 