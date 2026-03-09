import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const callerId = caller.id;

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });

    if (roleError) throw roleError;
    if (!isAdmin) return jsonResponse({ error: "Forbidden: admin only" }, 403);

    const { action, ...params } = await req.json();

    if (action === "create_user") {
      const { email, password, full_name, role } = params;
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });
      if (createError) throw createError;

      if (role && role !== "collaborator") {
        const { error: roleUpdateError } = await supabaseAdmin
          .from("user_roles")
          .update({ role })
          .eq("user_id", newUser.user!.id);
        if (roleUpdateError) throw roleUpdateError;
      }

      return jsonResponse({ user: newUser.user });
    }

    if (action === "update_user") {
      const { user_id, email, full_name, department_id, new_password } = params;

      const authUpdate: Record<string, unknown> = {};
      if (email) authUpdate.email = email;
      if (full_name) authUpdate.user_metadata = { full_name };
      if (new_password) authUpdate.password = new_password;

      if (Object.keys(authUpdate).length > 0) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, authUpdate);
        if (error) throw error;
      }

      const profileUpdate: Record<string, unknown> = {};
      if (email) profileUpdate.email = email;
      if (full_name) profileUpdate.full_name = full_name;
      if (department_id !== undefined) profileUpdate.department_id = department_id || null;

      if (Object.keys(profileUpdate).length > 0) {
        const { error } = await supabaseAdmin
          .from("profiles")
          .update(profileUpdate)
          .eq("user_id", user_id);
        if (error) throw error;
      }

      return jsonResponse({ success: true });
    }

    if (action === "delete_user") {
      const { user_id } = params;

      const [{ error: permsError }, { error: rolesError }, { error: profileError }] = await Promise.all([
        supabaseAdmin.from("user_permissions").delete().eq("user_id", user_id),
        supabaseAdmin.from("user_roles").delete().eq("user_id", user_id),
        supabaseAdmin.from("profiles").delete().eq("user_id", user_id),
      ]);

      if (permsError) throw permsError;
      if (rolesError) throw rolesError;
      if (profileError) throw profileError;

      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;

      return jsonResponse({ success: true });
    }

    if (action === "reset_password") {
      const { user_id, new_password } = params;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
        password: new_password,
      });
      if (error) throw error;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (error: any) {
    console.error("admin-user-management error:", error);
    return jsonResponse({ error: error?.message || "Unexpected error" }, 400);
  }
});
