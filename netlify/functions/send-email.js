const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

exports.handler = async (event) => {
  const allowedOrigins = [
    "https://lesenokbags-ua.webflow.io",
    "https://www.lesenok.ua",
  ];
  const origin = event.headers.origin;
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

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
    const {
      email,
      name,
      surname,
      orderNumber,
      formattedTotalPrice,
      formattedOrderItems,
      comments,
    } = JSON.parse(event.body);

    const orderItemsString = formattedOrderItems
      .map(
        (item) =>
          `• ${item.itemName}, - ${item.itemQuantity} x ${item.itemPrice}`
      )
      .join("\n");

    // Construct Mailjet message
    const request = mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "lesenokbags@gmail.com",
            Name: "Lesenok Bags",
          },
          To: [
            {
              Email: email,
              Name: `${name} ${surname}`,
            },
          ],
          TemplateID: 12454498, // Replace with your Mailjet template ID
          TemplateLanguage: true,
          Variables: {
            first_name: `${name} ${surname}`,
            order_id: orderNumber,
            comments: comments,
            total_price: formattedTotalPrice,
            order_items: orderItemsString,
          },
        },
      ],
    });

    await request;

    // Return a success response
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ message: "Email sent successfully!" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);

    // Return an error response
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ error: error.message || "Failed to send email" }),
    };
  }
};
