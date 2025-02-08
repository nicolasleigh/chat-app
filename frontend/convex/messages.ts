import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getUserByClerkId } from "./_utils";
import { paginationOptsValidator } from "convex/server";

export const get = query({
  args: {
    paginationOpts: paginationOptsValidator,
    id: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const currentUser = await getUserByClerkId({ ctx, clerkId: identity.subject });

    if (!currentUser) {
      throw new ConvexError("User not found");
    }

    const membership = await ctx.db
      .query("conversationMembers")
      .withIndex("by_memberId_conversationId", (q) => q.eq("memberId", currentUser._id).eq("conversationId", args.id))
      .unique();

    if (!membership) {
      throw new ConvexError("You aren't a member of this conversation");
    }

    // Paginated Queries: https://docs.convex.dev/database/pagination
    const results = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.id))
      .order("desc")
      .paginate(args.paginationOpts);
    // .collect();

    // What about N+1: https://stack.convex.dev/functional-relationships-helpers#what-about-n1
    // const messageWithUsers = Promise.all(
    //   results.page.map(async (message) => {
    //     const messageSender = await ctx.db.get(message.senderId);

    //     if (!messageSender) {
    //       throw new ConvexError("Could not find sender of message");
    //     }

    //     return {
    //       message,
    //       senderImage: messageSender.imageUrl,
    //       senderName: messageSender.username,
    //       isCurrentUser: messageSender._id === currentUser._id,
    //     };
    //   })
    // );

    // return messageWithUsers;
    return {
      ...results,
      page: await Promise.all(
        results.page.map(async (message) => {
          const messageSender = await ctx.db.get(message.senderId);

          if (!messageSender) {
            throw new ConvexError("Could not find sender of message");
          }
          return {
            message,
            senderImage: messageSender.imageUrl,
            senderName: messageSender.username,
            isCurrentUser: messageSender._id === currentUser._id,
          };
        })
      ),
    };
  },
});
