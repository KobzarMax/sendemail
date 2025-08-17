const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const allowedOrigins = [
  "https://lesenokbags-ua.webflow.io",
  "https://www.lesenok.ua",
];

function getCorsHeaders(origin) {
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

exports.handler = async (event) => {
  const origin = event.headers.origin || "";
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

    // Validation: check for empty variables
    const requiredFields = {
      email,
      name,
      surname,
      orderNumber,
      formattedTotalPrice,
      formattedOrderItems,
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(
        ([key, value]) =>
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
      )
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: `Missing or empty fields: ${emptyFields.join(", ")}`,
        }),
      };
    }

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
          TemplateLanguage: true,
          Data: {
            firstname: `${name} ${surname}`,
          },
          Variables: {
            order_id: orderNumber,
            comments: comments || "Без коментарів",
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
