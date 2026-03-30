const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

admin.initializeApp();

// ============================================
// CONFIGURATION EMAIL
// ============================================
// Configurer via: firebase functions:config:set email.user="votre@gmail.com" email.pass="mot_de_passe_app"
// Pour Gmail, créer un "mot de passe d'application" : https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: functions.config().email.user,
        pass: functions.config().email.pass,
    },
});

// ============================================
// NOTIFICATION A CHAQUE RESERVATION
// ============================================
exports.onNewBooking = functions
    .region("europe-west1")
    .database.ref("/bookings/{slotId}")
    .onCreate(async (snapshot, context) => {
        const booking = snapshot.val();
        const slotId = context.params.slotId;

        // Email vers Florine
        const mailToFlorine = {
            from: `"Fruytier Booking" <${functions.config().email.user}>`,
            to: "marketing@fruytiergroup.com",
            subject: `Nouveau RDV - ${booking.day} ${booking.time} - ${booking.societe}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #cc1b1b; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="margin: 0;">Nouveau rendez-vous</h2>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Carrefour International du Bois 2026 - Stand XXL-D13</p>
                    </div>
                    <div style="background: white; padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518; width: 120px;">Date</td>
                                <td style="padding: 8px 0;">${booking.day}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Horaire</td>
                                <td style="padding: 8px 0;">${booking.time}</td>
                            </tr>
                            <tr style="border-top: 1px solid #eee;">
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Nom</td>
                                <td style="padding: 8px 0;">${booking.prenom} ${booking.nom}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Société</td>
                                <td style="padding: 8px 0;">${booking.societe}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Email</td>
                                <td style="padding: 8px 0;"><a href="mailto:${booking.email}">${booking.email}</a></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Téléphone</td>
                                <td style="padding: 8px 0;">${booking.telephone || "Non renseigné"}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; font-weight: bold; color: #a01518;">Demande</td>
                                <td style="padding: 8px 0;">${booking.demande}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            `,
        };

        // Email de confirmation au visiteur
        const mailToVisitor = {
            from: `"Fruytier Group" <${functions.config().email.user}>`,
            to: booking.email,
            subject: `Confirmation RDV - Fruytier Group - ${booking.day}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #cc1b1b; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h2 style="margin: 0;">Rendez-vous confirmé</h2>
                        <p style="margin: 5px 0 0; opacity: 0.9;">Fruytier Group - Carrefour International du Bois 2026</p>
                    </div>
                    <div style="background: white; padding: 25px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
                        <p>Bonjour ${booking.prenom},</p>
                        <p>Votre rendez-vous avec l'équipe Fruytier Group est confirmé :</p>
                        <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p style="margin: 5px 0;"><strong>Date :</strong> ${booking.day}</p>
                            <p style="margin: 5px 0;"><strong>Horaire :</strong> ${booking.time}</p>
                            <p style="margin: 5px 0;"><strong>Lieu :</strong> Parc des Expositions de Nantes</p>
                            <p style="margin: 5px 0;"><strong>Stand :</strong> XXL-D13</p>
                        </div>
                        <p>Nous avons hâte de vous rencontrer !</p>
                        <p style="color: #5c5c5c; font-size: 0.9em; margin-top: 20px;">
                            L'équipe Fruytier Group<br>
                            <a href="http://www.fruytier.com" style="color: #cc1b1b;">www.fruytier.com</a>
                        </p>
                    </div>
                </div>
            `,
        };

        try {
            await Promise.all([
                transporter.sendMail(mailToFlorine),
                transporter.sendMail(mailToVisitor),
            ]);
            console.log(`Emails envoyés pour ${slotId}: ${booking.prenom} ${booking.nom}`);
        } catch (error) {
            console.error("Erreur envoi email:", error);
        }
    });
