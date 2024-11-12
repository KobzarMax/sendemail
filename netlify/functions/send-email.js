const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  const allowedOrigins = ["https://lesenokbags-ua.webflow.io", "https://www.lesenok.ua"];
  const origin = event.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

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
    // Parse and validate the request body
    const { email, name, surname, orderNumber, formattedTotalPrice, formattedOrderItems } = JSON.parse(event.body);

    if (!email || !name || !surname || !orderNumber || !formattedTotalPrice || !formattedOrderItems) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
        },
        body: JSON.stringify({ message: "Missing required fields in request body" }),
      };
    }

    // Convert formattedOrderItems to a single formatted string
    const orderItemsString = formattedOrderItems
      .map(item => `• ${item.itemName}, - ${item.itemQuantity} x ${item.itemPrice}`)
      .join("\n");

    // Construct the email message
    const msg = {
      personalizations: [
        {
          to: [{ email }],
          dynamic_template_data: {
            first_name: `${name} ${surname}`,
            order_id: orderNumber,
            total_price: formattedTotalPrice,
            order_items: orderItemsString, // Pass as formatted string
          },
        },
      ],
      from: { email: 'lesenokbags@gmail.com' },
      template_id: process.env.SENDGRID_TEMPLATE_ID,
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
    console.error("Error sending email:", {
      message: error.message,
      code: error.code,
      response: error.response && error.response.body
    });

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
