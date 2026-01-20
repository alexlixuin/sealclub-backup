import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, customerEmail, customerName, totalAmount } = await request.json()

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.log('Email credentials not configured, skipping email notification')
      return NextResponse.json({ 
        success: true, 
        message: 'Order received, email notification skipped (credentials not configured)' 
      })
    }

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'aaravknz@gmail.com',
      subject: `Crypto Payment Notification - Order #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Crypto Payment Notification</h2>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">Order Details</h3>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Customer Email:</strong> ${customerEmail}</p>
            <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)} USD</p>
          </div>
          
          <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3;">
            <h3 style="margin-top: 0; color: #1976D2;">Action Required</h3>
            <p>The customer has indicated they have made a cryptocurrency payment for this order.</p>
            <p>Please verify the payment and process the order accordingly.</p>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            This is an automated notification from the OzPtides checkout system.
          </p>
        </div>
      `,
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending crypto payment notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
