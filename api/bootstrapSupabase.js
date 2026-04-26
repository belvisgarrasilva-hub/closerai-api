import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 IMPORTANTE (NO anon key)
);

// 🔥 SQL CREATE TABLES
const createLeadsSQL = `
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  phone text unique,
  name text,
  intent text,
  score int,
  business_id text,
  revenue numeric default 0,
  is_hot boolean default false,
  updated_at timestamp default now()
);
`;

const createMessagesSQL = `
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  phone text,
  message text,
  reply text,
  intent text,
  stage text,
  score int,
  business_id text,
  revenue_estimate numeric default 0,
  converted boolean default false,
  created_at timestamp default now()
);
`;

export default async function handler(req, res) {
  try {
    let status = {
      leads: "unknown",
      messages: "unknown"
    };

    // 🔥 1. CHECK LEADS
    const leadsCheck = await supabase
      .from("leads")
      .select("id")
      .limit(1);

    if (leadsCheck.error) {
      console.log("Leads missing → creating...");

      const { error } = await supabase.rpc("exec_sql", {
        query: createLeadsSQL
      });

      status.leads = error ? "error" : "created";
    } else {
      status.leads = "ok";
    }

    // 🔥 2. CHECK MESSAGES
    const msgCheck = await supabase
      .from("messages")
      .select("id")
      .limit(1);

    if (msgCheck.error) {
      console.log("Messages missing → creating...");

      const { error } = await supabase.rpc("exec_sql", {
        query: createMessagesSQL
      });

      status.messages = error ? "error" : "created";
    } else {
      status.messages = "ok";
    }

    return res.status(200).json({
      ok: true,
      status
    });

  } catch (err) {
    console.error("BOOTSTRAP ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
}
