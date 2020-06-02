"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.sendNotification = functions.firestore
  .document("notifications/{notification_id}")
  .onCreate((data, context) => {
    const notification_id = context.params.notification_id;

    let community = data._fieldsProto.community.stringValue;
    let content = data._fieldsProto.content.stringValue;
    let from = data._fieldsProto.from.stringValue;
    let title = data._fieldsProto.title.stringValue;
    let type = data._fieldsProto.type.stringValue;

    const payload = {
      notification: {
        title: title,
        body: content,
        icon: "default",
        click_action: "com.alpha.community.TARGETNOTIFICATION",
      },
      data: {
        community: community,
        content: content,
        userFrom: from,
        title: title,
        type: type,
      },
    };

    return admin
      .messaging()
      .sendToTopic(community, payload)
      .then((response) => {
        console.log("Notification sent: " + response + "\n" + payload);
        db.collection("notifications")
          .doc(notification_id)
          .delete()
          .then((response) => {
            console.log(`Document ${notification_id} deleted: ${response}`);
          });
      });
  });
