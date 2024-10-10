import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
      return new Response(JSON.stringify({ detail: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await req.json();
    const { name, email, phone, message } = body;

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: "sales@keystoneuae.com",
      subject: "New Customer Request from Website",
      text: `You have received a new contact request.\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      html: `
        <h3>You have received a new contact request.</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
