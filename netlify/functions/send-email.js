import fetch from 'node-fetch';

export async function handler(event) {
  const { recipientEmail, firstName, orderId, totalPrice } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`).toString('base64')}`
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: "your-email@example.com",
              Name: "Your Name"
            },
            To: [
              {
                Email: recipientEmail,
                Name: firstName
              }
            ],
            TemplateID: your_template_id,
            TemplateLanguage: true,
            Subject: "Your Subject Here",
            Variables: {
              first_name: firstName,
              order_id: orderId,
              total_price: totalPrice
            }
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
