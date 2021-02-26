# SCILL Webhooks

These cloud functions are automatically published to a Firebase project `scill-webhooks` where they are accessible
by developers to chain specific challenges together. 

These webhooks are available:

## sendEventIfFinished

If the challenge is finished (i.e. type changes from `unclaimed` to `finished`) this webhook will send an event. You
can specific the event with query parameters:

|Parameter|Description|
|---------|-----------|
| `event_name` | The name of the event (i.e. `craft-item` or `collect-item`) |
| `event_type` | The type of the event (i.e. `single` or `group` defaults to `single`)|
| `session_id` | The session id, if not provided defaults to the session id available in the webhook payload |

In addition to that, you can specify addition query parameters which are then packed in the `meta_data` part of
the event payload. 

**Please note**: You must specify them required parameters. Most events for example require an `amount` property to
be set.

For example, if you want to send an event if a challenge is finished, set this webhook in the Admin Panel:
https://europe-west1-scill-webhooks.cloudfunctions.net/sendEventfFinished?event_name=trigger-event&amount=1&event_type=challenge_completed

This will trigger a [trigger-event](https://developers.scillgame.com/events.html#trigger-event) with the meta data
`amount=1` and `event_type=challenge_completed`. This way, you could create another challenge that listens on the
`trigger-event` with `event_type=challenge_completed` and says: "Complete 100 challenges".

## collectXPIfFinished

This webhook will send a [collect-item](https://developers.scillgame.com/events.html#collect-item) event with `amount`
being the value set for `challenge_xp` in Admin Panel. I.e. for every completed challenge, this webhook will
send a `collect-item` with the number of XP set for that challenge. This way you can create another challenge
that says: "Collect 1000 XP". This is especially useful if you want to drive usage of your platform by linking
daily and weekly challenges together with a ranking based battle pass.

This way, users will only climb up in the battle pass level hierarchy if they also achieve personal challenges.

You just need to set this webhook in the Admin Panel to implement that type of functionality:
https://europe-west1-scill-webhooks.cloudfunctions.net/collectXPIfFinished
