import { json, redirect, LoaderFunctionArgs } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const { token } = params;
  if (!token || typeof token !== "string") {
    return json({ error: "Invalid verification link." }, { status: 400 });
  }
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) {
    await prisma.$disconnect();
    return json({ error: "Invalid or expired verification link." }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
    },
  });
  await prisma.$disconnect();
  return redirect("/login?verified=1");
}

export default function VerifyEmail() {
  const data = useLoaderData<typeof loader>();
  if (data?.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="bg-gray-900 p-8 rounded shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
          <p className="text-red-400">{data.error}</p>
        </div>
      </div>
    );
  }
  return null;
}
