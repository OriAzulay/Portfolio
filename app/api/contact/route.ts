import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, recipientEmail } = body;

    // Validate required fields
    if (!name || !email || !message || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || !emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // Log the message to console when email service is not configured
      console.log("=== CONTACT FORM SUBMISSION (Email not configured) ===");
      console.log(`From: ${name} <${email}>`);
      console.log(`To: ${recipientEmail}`);
      console.log(`Message: ${message}`);
      console.log("=====================================================");
      
      // Still return success so the form works during development
      return NextResponse.json({ 
        success: true, 
        note: "Email service not configured - message logged to console" 
      });
    }

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Portfolio Contact <onboarding@resend.dev>", // Use your verified domain in production
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #5bc0be; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #555;">From:</strong> ${name}
            </p>
            <p style="margin: 0 0 10px 0;">
              <strong style="color: #555;">Email:</strong> 
              <a href="mailto:${email}" style="color: #5bc0be;">${email}</a>
            </p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
            <div style="background: #fff; padding: 15px; border-left: 4px solid #5bc0be; color: #444; line-height: 1.6;">
              ${message.replace(/\n/g, "<br>")}
            </div>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #888; font-size: 12px;">
            This message was sent from your portfolio contact form.
            <br>
            Reply directly to this email to respond to ${name}.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to send email";
      if (error.message?.includes("verify")) {
        errorMessage = "Email recipient not verified. With Resend free tier, you can only send to your own email.";
      } else if (error.message?.includes("API key")) {
        errorMessage = "Invalid Resend API key";
      }
      
      return NextResponse.json(
        { error: errorMessage, details: error.message },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

