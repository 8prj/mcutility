import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_PASSWORD = "090485";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/admin-api/, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Public routes
    if (req.method === "GET" && path === "/mod-info") {
      const { data, error } = await supabase
        .from("mod_info")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (req.method === "GET" && path === "/comments") {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(data);
    }

    if (req.method === "POST" && path === "/comments") {
      const body = await req.json();
      const username = String(body.username || "").trim();
      const comment = String(body.comment || "").trim();
      if (!username || !comment) {
        return jsonResponse({ error: "Username and comment are required" }, 400);
      }
      const sanitizedComment = comment
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
      const { data, error } = await supabase
        .from("comments")
        .insert({ username, comment: sanitizedComment, status: "pending" })
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (req.method === "POST" && path === "/login") {
      const body = await req.json();
      if (body.password === ADMIN_PASSWORD) {
        return jsonResponse({ token: "admin-session-token" });
      }
      return jsonResponse({ error: "Invalid password" }, 401);
    }

    // Admin-protected routes
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== "admin-session-token") {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (req.method === "GET" && path === "/admin/comments") {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(data);
    }

    if (req.method === "PUT" && path.startsWith("/admin/comments/")) {
      const id = path.split("/").pop();
      const body = await req.json();
      const { data, error } = await supabase
        .from("comments")
        .update({ status: body.status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (req.method === "DELETE" && path.startsWith("/admin/comments/")) {
      const id = path.split("/").pop();
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (req.method === "PUT" && path === "/admin/mod-info") {
      const body = await req.json();
      const { data: existing } = await supabase
        .from("mod_info")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("mod_info")
          .update({
            name: body.name,
            description: body.description,
            version: body.version,
            install_instructions: body.install_instructions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse(data);
      } else {
        const { data, error } = await supabase
          .from("mod_info")
          .insert({
            name: body.name,
            description: body.description,
            version: body.version,
            install_instructions: body.install_instructions,
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse(data);
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err: any) {
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});
