import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email } = await request.json();

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: '🎄 Welcome to MIAM Magical Drawer!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
              }
              .header h1 {
                color: #c41e3a;
                font-size: 32px;
                margin: 10px 0;
              }
              .emoji {
                font-size: 48px;
              }
              .content {
                color: #333;
                line-height: 1.6;
                font-size: 16px;
              }
              .highlight {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
                text-align: center;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #eee;
                color: #666;
                font-size: 14px;
              }
              .snowflake {
                display: inline-block;
                margin: 0 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎁</div>
                <h1>MIAM Magical Drawer</h1>
                <p style="color: #666;">Musical Note Exchange</p>
              </div>
              
              <div class="content">
                <p>Hello <strong>${name}</strong>,</p>
                
                <p>🎉 <strong>Congratulations!</strong> You've successfully registered for the MIAM Magical Drawer!</p>
                
                <div class="highlight">
                  <h2 style="margin: 0 0 10px 0;">✨ You're In! ✨</h2>
                  <p style="margin: 0;">Your spot is secured for this festive musical note exchange!</p>
                </div>
                
                <p><strong>What happens next?</strong></p>
                <ul>
                  <li>🕐 Wait for the registration deadline</li>
                  <li>🎲 The magical draw will be performed</li>
                  <li>📧 You'll receive another email with your assignment</li>
                  <li>🎵 Prepare your musical note gift!</li>
                </ul>
                
                <p>Keep an eye on your inbox - we'll let you know who you'll be gifting to!</p>
                
                <p style="text-align: center; margin-top: 30px;">
                  <span class="snowflake">❄️</span>
                  <span class="snowflake">⭐</span>
                  <span class="snowflake">🎄</span>
                  <span class="snowflake">⭐</span>
                  <span class="snowflake">❄️</span>
                </p>
              </div>
              
              <div class="footer">
                <p><strong>MIAM Magical Drawer</strong></p>
                <p>Spreading musical joy, one note at a time! 🎵</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
