import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useActionData } from "@remix-run/react";
import { PrismaClient } from "@prisma/client";
import { getUserId } from "../utils/session.server";
import GameLogButton from "../components/GameLogButton";
import { useState, useRef, useEffect } from "react";

export const loader = async ({ request }: { request: Request }) => {
  const prisma = new PrismaClient();
  // Get userId from session
  let userId: string | null = null;
  try {
    const { getUserSession } = await import("../utils/session.server");
    const session = await getUserSession(request);
    userId = session.get("userId") || null;
  } catch {
    // ignore
  }
  const games = await prisma.game.findMany({
    select: { id: true, title: true, categoryId: true },
    orderBy: { title: "asc" },
  });
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, username: true, profilePicUrl: true } },
      game: { select: { title: true, imageUrl: true } },
    },
  });
  const categories = await prisma.category.findMany({
    select: { id: true, title: true },
    orderBy: { title: "asc" },
  });
  await prisma.$disconnect();
  return json({ games, posts, userId, categories });
};

export const action = async ({ request }: { request: Request }) => {
  const userId = await getUserId(request);
  if (!userId) return json({ error: "You must be logged in to post." }, { status: 401 });
  const form = await request.formData();
  const intent = form.get("intent");
  if (intent === "delete") {
    const postId = form.get("postId");
    if (typeof postId !== "string") return json({ error: "Invalid post ID." }, { status: 400 });
    const prisma = new PrismaClient();
    // Only allow delete if user owns the post
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) {
      await prisma.$disconnect();
      return json({ error: "Unauthorized." }, { status: 403 });
    }
    await prisma.blogPost.delete({ where: { id: postId } });
    await prisma.$disconnect();
    return redirect("/blog");
  }
  if (intent === "edit") {
    const postId = form.get("postId");
    const title = form.get("title");
    const content = form.get("content");
    const gameId = form.get("gameId");
    if (
      typeof postId !== "string" ||
      typeof title !== "string" ||
      typeof content !== "string" ||
      typeof gameId !== "string"
    ) {
      return json({ error: "Invalid form data." }, { status: 400 });
    }
    const prisma = new PrismaClient();
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post || post.userId !== userId) {
      await prisma.$disconnect();
      return json({ error: "Unauthorized." }, { status: 403 });
    }
    await prisma.blogPost.update({
      where: { id: postId },
      data: { title, content, gameId },
    });
    await prisma.$disconnect();
    return redirect("/blog");
  }
  if (intent === "report") {
    // For now, just return a success message (could be extended to notify admin)
    return json({ success: true, message: "Post reported. Thank you!" });
  }
  // Default: create post
  const title = form.get("title");
  const content = form.get("content");
  const gameId = form.get("gameId");
  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    typeof gameId !== "string"
  ) {
    return json({ error: "Invalid form data." }, { status: 400 });
  }
  const prisma = new PrismaClient();
  await prisma.blogPost.create({
    data: { title, content, userId, gameId },
  });
  await prisma.$disconnect();
  return redirect("/blog");
};

export default function Blog() {
  const { games, posts, userId, categories } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "all");
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const tabListRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  function handleClickOutside(event: MouseEvent) {
    Object.values(menuRefs.current).forEach((ref) => {
      if (ref && !ref.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    });
  }
  // Attach/detach listener
  useEffect(() => {
    if (openMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  const scrollTabs = (dir: "left" | "right") => {
    if (!tabListRef.current) return;
    const { scrollLeft, clientWidth } = tabListRef.current;
    const scrollAmount = clientWidth * 0.7;
    tabListRef.current.scrollTo({
      left: dir === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-16 px-4 max-w-3xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-cyan-400 drop-shadow">GameLog Message Board</h1>
        <div className="bg-gray-900 rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Create a Blog Post</h2>
          <Form method="post" className="flex flex-col gap-4">
            <input
              name="title"
              type="text"
              placeholder="Post Title"
              required
              className="p-3 rounded bg-gray-800 border border-gray-700 text-white"
            />
            <textarea
              name="content"
              placeholder="Write your post..."
              required
              className="p-3 rounded bg-gray-800 border border-gray-700 text-white min-h-[100px]"
            />
            <select
              name="gameId"
              required
              className="p-3 rounded bg-gray-800 border border-gray-700 text-white"
            >
              <option value="">Select a Game</option>
              {games.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
            <GameLogButton type="submit" className="w-full" variant="primary" size="md">
              Post
            </GameLogButton>
            {actionData && 'error' in actionData && (
              <p className="text-red-400 text-sm mt-2">{actionData.error}</p>
            )}
            {actionData && 'success' in actionData && (
              <p className="text-teal-400 text-sm mt-2">{actionData.message}</p>
            )}
          </Form>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-6 text-white">Recent Posts</h2>
          {/* Category tabs */}
          <div className="relative mb-8">
            <button
              type="button"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 border border-cyan-700 shadow-lg rounded-full p-2 flex items-center justify-center hover:bg-cyan-800 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,255,255,0.10)' }}
              onClick={() => scrollTabs("left")}
              aria-label="Scroll categories left"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0f172a"/><path d="M14.5 7l-5 5 5 5" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <div
              ref={tabListRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-12"
              style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <button
                className={`px-4 py-2 rounded-full font-semibold transition text-sm whitespace-nowrap ${activeCategory === "all" ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-cyan-900"}`}
                onClick={() => setActiveCategory("all")}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full font-semibold transition text-sm whitespace-nowrap ${activeCategory === cat.id ? "bg-cyan-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-cyan-900"}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.title}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-900 border border-cyan-700 shadow-lg rounded-full p-2 flex items-center justify-center hover:bg-cyan-800 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
              style={{ boxShadow: '0 2px 8px 0 rgba(0,255,255,0.10)' }}
              onClick={() => scrollTabs("right")}
              aria-label="Scroll categories right"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0f172a"/><path d="M9.5 7l5 5-5 5" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          {posts.filter(post => {
            if (activeCategory === "all") return true;
            // Find the game's categoryId for this post
            const game = games.find(g => g.id === post.gameId);
            return game && game.categoryId === activeCategory;
          }).length === 0 ? (
            <p className="text-gray-400 text-center">No posts yet in this category.</p>
          ) : (
            <div className="flex flex-col gap-8">
              {posts.filter(post => {
                if (activeCategory === "all") return true;
                const game = games.find(g => g.id === post.gameId);
                return game && game.categoryId === activeCategory;
              }).map((post) => {
                const isOwner = userId && post.user?.id === userId;
                return (
                  <div key={post.id} className="bg-black rounded-lg shadow p-6 flex flex-col gap-2 border border-gray-800 relative">
                    {/* 3-dot menu button */}
                    <div className="absolute top-4 right-4 z-10">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 focus:outline-none"
                        onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                        aria-label="Open post menu"
                      >
                        <span className="text-2xl text-gray-400">&#8942;</span>
                      </button>
                      {openMenu === post.id && (
                        <div
                          ref={el => (menuRefs.current[post.id] = el)}
                          className="absolute right-0 mt-2 w-32 bg-gray-900 rounded-lg shadow-lg border border-gray-800 animate-fade-in"
                        >
                          {isOwner ? (
                            <>
                              {/* Edit Form Toggle */}
                              <button
                                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                                onClick={() => {
                                  setOpenMenu(null);
                                  setEditingPost(post.id);
                                }}
                              >Edit</button>
                              <Form method="post" onSubmit={() => setOpenMenu(null)}>
                                <input type="hidden" name="intent" value="delete" />
                                <input type="hidden" name="postId" value={post.id} />
                                <button
                                  type="submit"
                                  className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900"
                                >Delete</button>
                              </Form>
                            </>
                          ) : (
                            <Form method="post">
                              <input type="hidden" name="intent" value="report" />
                              <input type="hidden" name="postId" value={post.id} />
                              <button
                                type="submit"
                                className="block w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-yellow-900"
                                onClick={() => setOpenMenu(null)}
                              >Report</button>
                            </Form>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Edit form (inline) */}
                    {editingPost === post.id ? (
                      <Form method="post" className="flex flex-col gap-2 mb-2 bg-gray-800 p-4 rounded" onSubmit={() => setEditingPost(null)}>
                        <input type="hidden" name="intent" value="edit" />
                        <input type="hidden" name="postId" value={post.id} />
                        <input
                          name="title"
                          defaultValue={post.title}
                          required
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white mb-2"
                        />
                        <textarea
                          name="content"
                          defaultValue={post.content}
                          required
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white mb-2 min-h-[80px]"
                        />
                        <select
                          name="gameId"
                          defaultValue={post.gameId}
                          required
                          className="p-2 rounded bg-gray-900 border border-gray-700 text-white mb-2"
                        >
                          <option value="">Select a Game</option>
                          {games.map((game) => (
                            <option key={game.id} value={game.id}>{game.title}</option>
                          ))}
                        </select>
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="px-4 py-2 rounded bg-gray-700 text-white" onClick={() => setEditingPost(null)}>Cancel</button>
                          <GameLogButton type="submit" variant="primary" size="sm">Save</GameLogButton>
                        </div>
                      </Form>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 mb-2">
                          {post.user?.profilePicUrl ? (
                            <img src={post.user.profilePicUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold text-cyan-400">
                              {post.user?.username?.[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">{post.user?.username || "Unknown User"}</div>
                            <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <span className="inline-block bg-cyan-900/60 text-cyan-300 text-xs px-3 py-1 rounded-full font-semibold">
                            {post.game?.title || "Unknown Game"}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-cyan-300 mb-1">{post.title}</h3>
                        <p className="text-gray-200 whitespace-pre-line mb-2">{post.content}</p>
                        {post.game?.imageUrl && (
                          <img 
                            src={post.game.imageUrl} 
                            alt={post.game.title} 
                            className="w-full max-w-xs h-32 object-cover rounded-xl border-2 border-cyan-900 shadow-md mx-auto mt-2 mb-2"
                          />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
