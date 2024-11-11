import fetch from 'node-fetch';

export async function handler(event) {
  const { recipientEmail, firstName, orderId, totalPrice } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`)}`
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: "lesenokbags@gmail.com",
            },
            To: [
              {
                Email: recipientEmail,
                Name: firstName
              }
            ],
            TemplateID: "6460031",
            Variables: {
              first_name: firstName,
              order_id: orderId,
              total_price: totalPrice
            }
          }
        ]
      })
    });

    console.log(response)

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
