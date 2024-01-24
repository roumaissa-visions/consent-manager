const template = (vars: { [key: string]: any }) => `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Test email</title>
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
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Test email</h1>
            <p>Hello,</p>
            <p>
                This is a sample test email
            </p>
            <br/>
            <h2>Test variables inputted</h2>
            <ul>
            ${Object.values(vars).map((value) => {
              return `<li>${value}</li>`;
            })} 
            </ul>
        </div>
    </body>
</html>
`;

export default template;
