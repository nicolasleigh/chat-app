import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { internal } from "./_generated/api";

const http = httpRouter();

// https://docs.convex.dev/auth/database-auth#webhook-endpoint-implementation
const handleClerkWebhook = httpAction(async (ctx, request) => {
  const event = await validatePayload(request);
  if (!event) {
    return new Response("Could not validate Clerk payload", { status: 400 });
  }
  switch (event.type) {
    case "user.created": // intentional fallthrough
      const user = await ctx.runQuery(internal.user.get, { clerkId: event.data.id });
      if (user) {
        console.log(`Updating user ${event.data.id} with: ${event.data}`);
      }

    case "user.updated":
      console.log("Creating/Updating User:", event.data.id);

      await ctx.runMutation(internal.user.create, {
        username: `${event.data.first_name} ${event.data.last_name}`,
        imageUrl: event.data.image_url,
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
      });

      break;

    default:
      console.log("Ignored Clerk webhook event", event.type);
  }

  return new Response(null, { status: 200 });
});

const validatePayload = async (req: Request): Promise<WebhookEvent | null> => {
  const payload = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  try {
    return wh.verify(payload, svixHeaders) as unknown as WebhookEvent;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    return null;
  }
};

// https://docs.convex.dev/auth/database-auth#set-up-webhooks
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

// Convex expects the router to be the default export of `convex/http.js`.
export default http;
