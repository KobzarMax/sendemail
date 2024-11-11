const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {
  // Ensure this is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
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
        template_id: 'd-94b1142e7c0e4e9dbacb9cb7ce646514', // Use your actual SendGrid template ID
      };

    // Send the email
    await sgMail.send(msg);

    // Return a success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully!' }),
    };
  } catch (error) {
    console.error(error);

    // Return an error response
    return {
      statusCode: error.code || 500,
      body: JSON.stringify({ error: error.message || 'Failed to send email' }),
    };
  }
};
