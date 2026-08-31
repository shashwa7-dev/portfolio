/**
 * Copy shared by the chat endpoint and the chat widget.
 *
 * The route and the component both have to be able to put words in the
 * assistant's bubble when something goes wrong, and a visitor should get the
 * same sentence either way. Kept here rather than in the route because the
 * route is server-only: importing it from a client component would drag
 * nodemailer and the file-read of `data/agent-memory.md` into the browser
 * bundle.
 */

/** Where "email him directly" points. The route also sends mail here. */
export const RECIPIENT_EMAIL = "shashwa7.dev@gmail.com";

/**
 * Shown when the assistant could not do its job: the model call throwing, the
 * request handler erroring, or a stream that finished having produced nothing
 * at all.
 *
 * Deliberately not used for a scope refusal, which is the assistant
 * understanding a request fine and choosing not to fulfil it. Pointing that
 * visitor at Shashwat's inbox would relay the out-of-scope ask to him instead
 * of declining it.
 */
export const CONNECTION_TROUBLE = `Sorry, I'm having trouble connecting right now. Feel free to email Shashwat directly at ${RECIPIENT_EMAIL}!`;
