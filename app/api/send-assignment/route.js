import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    console.log('=== Assignment Email API Called ===');
    const { giverName, giverEmail, receiverName } = await request.json();
    console.log('Assignment data:', { giverName, giverEmail, receiverName });

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [giverEmail],
      subject: '🎁 Your MIAM Magical Drawer Assignment is Here!',
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
                font-size: 64px;
                animation: bounce 2s infinite;
              }
              @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
              .content {
                color: #333;
                line-height: 1.6;
                font-size: 16px;
              }
              .assignment-box {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 30px;
                border-radius: 15px;
                margin: 30px 0;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              }
              .assignment-box h2 {
                margin: 0 0 15px 0;
                font-size: 24px;
              }
              .receiver-name {
                font-size: 36px;
                font-weight: bold;
                margin: 15px 0;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              }
              .gift-emoji {
                font-size: 48px;
                margin: 20px 0;
              }
              .instructions {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 20px;
                border-radius: 10px;
                margin: 20px 0;
              }
              .instructions h3 {
                color: #667eea;
                margin-top: 0;
              }
              .secret-warning {
                background: #fff3cd;
                border: 2px solid #ffc107;
                padding: 15px;
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
              .confetti {
                display: inline-block;
                margin: 0 5px;
                font-size: 24px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="emoji">🎉</div>
                <h1>The Draw is Complete!</h1>
                <p style="color: #666;">MIAM Magical Drawer Results</p>
              </div>
              
              <div class="content">
                <p>Hello <strong>${giverName}</strong>,</p>
                
                <p>🎊 The magical moment has arrived! The draw has been completed, and it's time to reveal your special assignment!</p>
                
                <div class="assignment-box">
                  <h2>🎁 You are giving a musical note to:</h2>
                  <div class="gift-emoji">🎵</div>
                  <div class="receiver-name">${receiverName}</div>
                  <div class="gift-emoji">🎵</div>
                </div>
                
                <div class="secret-warning">
                  <strong>🤫 Remember: This is a SECRET!</strong>
                  <p style="margin: 10px 0 0 0;">Don't tell ${receiverName} that you're their Secret Santa!</p>
                </div>
                
                <div class="instructions">
                  <h3>📝 Next Steps:</h3>
                  <ul style="margin: 10px 0;">
                    <li><strong>Prepare your musical note gift</strong> for ${receiverName}</li>
                    <li><strong>Keep it secret</strong> until the reveal day!</li>
                    <li><strong>Have fun</strong> with your creative musical gift! 🎶</li>
                  </ul>
                </div>
                
                <p>We can't wait to see what musical surprises you have in store! Remember, the best gifts come from the heart (and maybe a little creativity! 🎵)</p>
                
                <p style="text-align: center; margin-top: 30px;">
                  <span class="confetti">🎉</span>
                  <span class="confetti">🎊</span>
                  <span class="confetti">✨</span>
                  <span class="confetti">🎁</span>
                  <span class="confetti">🎵</span>
                  <span class="confetti">⭐</span>
                  <span class="confetti">🎄</span>
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

    console.log('Assignment email sent successfully!', data);
    return NextResponse.json({ success: true, id: data.id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
