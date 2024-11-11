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
    const { to, subject, text } = JSON.parse(event.body);

    // Construct the email message
    const msg = {
      to,
      from: 'lesenokbags@gmail.com', // Your verified sender email on SendGrid
      subject: subject || 'Default Subject',
      text: text || 'Default Email Body',
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
