import { json, redirect } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { getUserId, sessionStorage } from "../utils/session.server";
import { sendAccountDeletedEmail } from "../utils/email.server";

export const action = async ({ request }: { request: Request }) => {
  const userId = await getUserId(request);
  if (!userId) return redirect("/login");
  const prisma = new PrismaClient();
  // Get user email before deleting
  const user = await prisma.user.findUnique({ where: { id: userId } });
  // Delete all games for this user (if you want to keep DB clean)
  await prisma.game.deleteMany({ where: { userId } });
  // Delete the user
  await prisma.user.delete({ where: { id: userId } });
  await prisma.$disconnect();
  // Send confirmation email if user email exists
  if (user?.email) {
    await sendAccountDeletedEmail(user.email);
  }
  // Destroy session
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
};

export default function DeleteAccountRoute() {
  return null; // No UI, just API
}
