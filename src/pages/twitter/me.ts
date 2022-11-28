import type { APIRoute } from "astro";
import { TwitterApi } from "twitter-api-v2";

import { responseJsonError } from "../../utils/api";
import {
  findPotentialInstanceUrlsFromTwitter,
  findPotentialUserEmails,
} from "../../utils/fediverse";
import { Session } from "../../utils/session";

export const get: APIRoute = async function get(context) {
  const session = Session.withAstro(context);
  const accessToken = session.get("twitterAccessToken");
  const accessSecret = session.get("twitterAccessSecret");
  if (!accessToken || !accessSecret) {
    return {
      status: 403,
      statusText: "Forbidden",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "notLoggedIn" }),
    };
  }

  const client = new TwitterApi({
    appKey: import.meta.env.TWITTER_API_KEY,
    appSecret: import.meta.env.TWITTER_API_SECRET,
    accessToken,
    accessSecret,
  });

  try {
    const response = await client.v2.me({
      "user.fields": ["name", "description", "url", "location", "entities"],
    });

    const { data: user } = response;
    const { description, location, name, username } = user;
    const potentialEmails = findPotentialUserEmails(name)
      .concat(findPotentialUserEmails(description))
      .concat(findPotentialUserEmails(location));

    const potentialInstances = findPotentialInstanceUrlsFromTwitter(
      user.entities?.url?.urls,
    ).concat(
      findPotentialInstanceUrlsFromTwitter(user.entities?.description?.urls),
    );

    return {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item: {
          username,
          potentialEmails,
          potentialInstances,
        },
      }),
    };
  } catch (e) {
    console.error(e);
    return responseJsonError(500, "unknownError");
  }
};
