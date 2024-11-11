const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Parse the request body
  const { recipientEmail, firstName, orderId, totalPrice } = JSON.parse(event.body);

  try {
    // Send the email using Mailjet API
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
              Email: "lesenokbags@gmail.com",
            },
            To: [
              {
                Email: recipientEmail,
                Name: firstName
              }
            ],
            TemplateID: 6460031,
            TemplateLanguage: true,
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
};