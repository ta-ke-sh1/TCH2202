import nodeMailer from "nodemailer";
import * as constants from "../utils/constants.mjs";
import { fetchAllCoordinatorsByDepartment } from "./firebaseHelper.mjs";

const transporter = nodeMailer.createTransport({
    port: 465,
    host: "smtp.gmail.com",
    auth: {
        user: constants.emailHost,
        pass: constants.emailPassword,
    },
    secure: true,
});

async function sendMail(reciever, header, content) {
    const mailData = {
        from: constants.emailHost,
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

async function sendMailToUser(user, content) {
    await sendMail(
        user,
        "New Comment has been added",
        "New Comment has been added<br>" + content
    );
}

async function sendMailToCoordinator(department, content) {
    const coordinators = await fetchAllCoordinatorsByDepartment(department);
    for (let i = 0; i < coordinators.length; i++) {
        await sendMail(
            coordinators[i].email,
            "New Idea added",
            "New Idea has been added<br>" + content
        );
        console.log("email sent");
    }
}

async function getMailContent() {}

export { sendMail, sendMailToCoordinator, sendMailToUser, getMailContent };
