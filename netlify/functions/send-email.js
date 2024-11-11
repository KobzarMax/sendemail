const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  const allowedOrigin = "https://lesenokbags-ua.webflow.io";

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "CORS preflight response" }),
    };
  }

  // Ensure this is a POST request
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    // Parse the request body
    const { email, name, surname, orderNumber, formattedTotalPrice, formattedOrderItems } = JSON.parse(event.body);

    // Construct the email message
    const msg = {
      personalizations: [
        {
          to: [{ email }],
          dynamic_template_data: {
            first_name: `${name} ${surname}`,
            order_id: orderNumber,
            total_price: formattedTotalPrice,
            order_items: formattedOrderItems,
          },
        },
      ],
      from: { email: 'lesenokbags@gmail.com' },
      template_id: 'd-94b1142e7c0e4e9dbacb9cb7ce646514', // Replace with your actual SendGrid template ID
    };

    // Send the email
    await sgMail.send(msg);

    // Return a success response
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    console.error("Error sending email:", error);

    // Return an error response
    return {
      statusCode: error.code || 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ error: error.message || 'Failed to send email' }),
    };
  }
};
