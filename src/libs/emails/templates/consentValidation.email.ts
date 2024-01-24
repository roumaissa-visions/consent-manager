const template = (vars: { [key: string]: string }) => `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Consent validation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #666;
            }
            button {
                background-color: #007bff;
                color: #fff;
                padding: 10px 20px;
                border: none;
                border-radius: 5px;
                text-decoration: none;
                cursor: pointer;
            }
            button:hover {
                background-color: #0056b3; /* Change color on hover */
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h4>Verify your consent request</h4>
            <p>A consent grant attempt has been triggered using this email. Was it you ? <br/>
            <br/>

            If it was you, click the button below to confirm the consent grant. or copy the following url and paste in in your browser: <br/>
            ${vars.url}</p>

            <button>
                <a href="${vars.url}" style="text-decoration: none; color: inherit;">Confirm Consent</a>
            </button>
        </div>
    </body>
</html>
`;

export default template;
