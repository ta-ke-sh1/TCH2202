import nodeMailer from "nodemailer";
import * as constants from "../utils/constants.mjs";

const transporter = nodeMailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: constants.emailHost,
        pass: constants.emailPassword,
    },
    secure: true,
});

function sendMail(reciever, header, content) {
    const mailData = {
        from: "trunght.yrc@gmail.com",
        to: reciever,
        text: header,
        html:
            "<b>Hello</b><br>A new post just been added to the database!<br>" +
            content,
    };

    transporter.sendMail(mailData, function (err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
}

export { sendMail };
