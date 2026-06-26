import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_PASSWORD = "090485";
const ADMIN_TOKEN = "admin-session-token";

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
    const body = await req.json();
    const { action, token } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Public routes
    if (action === "login") {
      if (body.password === ADMIN_PASSWORD) {
        return jsonResponse({ token: ADMIN_TOKEN });
      }
      return jsonResponse({ error: "Invalid password" }, 401);
    }

    if (action === "get_mod_info") {
      const { data, error } = await supabase
        .from("mod_info")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (action === "get_comments") {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(data);
    }

    if (action === "submit_comment") {
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

    // Admin-protected routes
    if (token !== ADMIN_TOKEN) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    if (action === "get_all_comments") {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return jsonResponse(data);
    }

    if (action === "update_comment") {
      const { data, error } = await supabase
        .from("comments")
        .update({ status: body.status })
        .eq("id", body.id)
        .select()
        .single();
      if (error) throw error;
      return jsonResponse(data);
    }

    if (action === "delete_comment") {
      const { error } = await supabase.from("comments").delete().eq("id", body.id);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (action === "update_mod_info") {
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

    if (action === "update_download_url") {
      const { data: existing } = await supabase
        .from("mod_info")
        .select("id")
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("mod_info")
          .update({
            download_url: body.downloadUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ downloadUrl: body.downloadUrl, filename: body.downloadUrl });
      } else {
        const { data, error } = await supabase
          .from("mod_info")
          .insert({
            download_url: body.downloadUrl,
          })
          .select()
          .single();
        if (error) throw error;
        return jsonResponse({ downloadUrl: body.downloadUrl, filename: body.downloadUrl });
      }
    }

    return jsonResponse({ error: "Invalid action" }, 400);
  } catch (err: any) {
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
});
