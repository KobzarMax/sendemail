const Mailjet = require("node-mailjet");

const mailjet = Mailjet.connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const allowedOrigins = [
  "https://lesenokbags-ua.webflow.io",
  "https://www.lesenok.ua",
];

function getCorsHeaders(origin) {
  const headers = {
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

exports.handler = async (event) => {
  const origin = event.headers.origin;
  const corsHeaders = getCorsHeaders(origin);

  // Preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "CORS preflight ok" }),
    };
  }

  // Block non-POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  // Block non-allowed origins
  if (!allowedOrigins.includes(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

  try {
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

    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "lesenokbags@gmail.com",
            Name: "Lesenok Bags",
          },
          To: [{ Email: email, Name: `${name} ${surname}` }],
          TemplateID: 12454498,
          Subject: `Замовлення #${orderNumber}`,
          TemplateLanguage: true,
          Variables: {
            first_name: `${name} ${surname}`,
            order_id: orderNumber,
            comments,
            total_price: formattedTotalPrice,
            order_items: orderItemsString,
          },
        },
      ],
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Email sent successfully!" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || "Failed to send email" }),
    };
  }
};
