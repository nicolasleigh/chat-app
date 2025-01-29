import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// https://docs.convex.dev/functions/internal-functions
export const create = internalMutation({
  args: {
    username: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("users", args);
  },
});

// https://docs.convex.dev/functions/validation
// https://docs.convex.dev/database/reading-data/indexes
export const get = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
