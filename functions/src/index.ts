// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';
import * as SCILL from '@scillgame/scill-js';

// Testing SCILL Webhooks
exports.sendEventIfFinished = functions
.region('europe-west1')
.https.onRequest((req, res) => {

  const webhookData = req.body;
  if (webhookData && webhookData.user_token && webhookData.webhook_type === "challenge-changed" && webhookData.new_challenge) {
    const user_id = webhookData.new_challenge.user_id;
    const session_id = req.query.session_id ? req.query.session_id : webhookData.new_challenge.session_id;
    const event_type = req.query.event_type ? req.query.event_type : 'single';
    const event_name = req.query.event_name;

    // Check if challenge has been claimed and has XP - otherwise we just do nothing
    if (webhookData.old_challenge.type === "unclaimed" && webhookData.new_challenge.type === "finished") {
      if (!session_id) {
        return res.status(400).send({
          success: false,
          error: "Please provide session_id as query parameter"
        });
      }

      if (!event_name) {
        return res.status(400).send({
          success: false,
          error: "Please provide event_name as query parameter"
        });
      }

      // Compile meta data of query params that are not event_name or session_id
      const meta_data = {};
      for (const [key, value] of Object.entries(req.query)) {
        if (key !== "event_name" && key !== "session_id" && key !== "event_type") {
          meta_data[key] = value;
        }
      }

      // Event payload
      const payload = {
        event_name: event_name,
        event_type: event_type,
        session_id: session_id,
        user_id: user_id,
        meta_data: meta_data
      }

      const eventsApi = SCILL.getEventsApi(webhookData.user_token);
      eventsApi.sendEvent(payload).then((response => {
        return res.status(400).send({
          success: true,
          message: "Sent event",
          response: response
        });
      })).catch(error => {
        return res.status(400).send({
          success: false,
          error: "Failed sending events",
          response: error
        });
      });
    }
  }

  return res.status(200).send({
    success: true,
    message: "Nothing to do"
  });
});

exports.collectXPIfFinished = functions
.region('europe-west1')
.https.onRequest((req, res) => {

  const webhookData = req.body;
  if (webhookData && webhookData.user_token && webhookData.webhook_type === "challenge-changed" && webhookData.new_challenge) {
    const user_id = webhookData.new_challenge.user_id;
    const xp = webhookData.new_challenge.challenge_xp;

    // Check if challenge has been claimed and has XP - otherwise we just do nothing
    if (webhookData.old_challenge.type === "unclaimed" && webhookData.new_challenge.type === "finished" && xp > 0) {
      // Create event payload for sending a collect-item event
      const payload = {
        event_name: "collect-item",
        event_type: "single",
        session_id: "persistent",  // Set the session_id to something that does not change
        user_id: user_id,
        meta_data: {
          amount: xp,
          item_type: "xp"
        }
      }

      const eventsApi = SCILL.getEventsApi(webhookData.user_token);
      return eventsApi.sendEvent(payload).then((response => {
        return res.status(400).send({
          success: true,
          message: "Sent event",
          response: response
        });
      })).catch(error => {
        return res.status(400).send({
          success: false,
          error: "Failed sending events",
          response: error,
          event: payload
        });
      });
    }
  }

  return res.status(200).send({
    success: true,
    message: "Nothing to do"
  });
});
