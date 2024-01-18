# Nodemailer setup

Nodemailer is the quickest setup for a small app and if email sending doesn't go above a provider's email sending per day. For instance, using gmail enables to send to up to 500 individual recipients per day (a recipient in "to" and one in "cc" counts as 2).

## Overview

The lib provides a NodemailerClient constant which enables quick and easy access to methods for sending emails and sending with custom local pre-defined templates

## Configuration

Configuration is set through the following environment variables
|variable|description|
|-|-|
|`NODEMAILER_SERVICE`|The service to use (ex: gmail)|
|`NODMAILER_USER`|The email used for sending emails|
|`NODEMAILER_PASS`|The password for the corresponding email. In the case of gmail, this would be the App Password|

## Activation

If any of the variables from the configuration above are missing from the environment, the NodemailerClient will not be activated.

When not activated, sendMessages functions will be blocked and return void.

## Example Usage

### Send an email

```js
await NodemailerClient.sendMessage(
    {
        to: "foo@bar.com",
        subject: "Email from Nodemailer",
        html: "<h1>Hello World</h1>,
    },
);
```

### Send an email with a local template

```js
await NodemailerClient.sendMessageFromLocalTemplate(
    {
        to: "foo@bar.com",
        subject: "Email from Nodemailer",
    },
    "myTemplate",
    { myVariable: "123", foo: "bar" }
);
```

## Using Gmail

Using Gmail in nodemailer is simple with the use of "less secure" apps and "app passwords" set by google.

See [how to generate App Passwords](https://knowledge.workspace.google.com/kb/how-to-generate-an-app-passwords-000009237)

## Packages

Packages for nodemailer specifically

```bash
pnpm add nodemailer && pnpm add -D @types/nodemailer
```
