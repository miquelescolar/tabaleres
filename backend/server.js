import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/api/events", async (req, res) => {
  const { data, error } = await supabase
    .from("events")
    .select("id, name, event_date, location, event_types(name)")
    .order("event_date", { ascending: false });

  if (error) return res.status(400).json({ error });
  res.json(data.map(e => ({
    id: e.id,
    name: e.name,
    date: e.event_date,
    type: e.event_types.name,
    location: e.location
  })));
});

app.post("/api/events", async (req, res) => {
  const { name, type_id, event_date, start_time, end_time, location, description } = req.body;

  const { data, error } = await supabase
    .from("events")
    .insert([{ name, type_id, event_date, start_time, end_time, location, description }])
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

app.get("/api/students", async (req, res) => {
  const { data, error } = await supabase.from("students").select("*").order("name");
  if (error) return res.status(400).json({ error });
  res.json(data);
});

app.post("/api/attendance", async (req, res) => {
  const { student_id, event_id, status, notes } = req.body;

  const { data, error } = await supabase
    .from("attendance")
    .upsert({ student_id, event_id, status, notes }, { onConflict: "student_id,event_id" })
    .select()
    .single();

  if (error) return res.status(400).json({ error });
  res.json(data);
});

app.get("/api/attendance/:event_id", async (req, res) => {
  const { event_id } = req.params;

  const { data, error } = await supabase
    .from("attendance")
    .select("status, notes, students(name)")
    .eq("event_id", event_id);

  if (error) return res.status(400).json({ error });

  res.json(data.map(a => ({
    student: a.students.name,
    status: a.status,
    notes: a.notes
  })));
});

app.get("/", (req, res) => {
  res.send("🎸 Tabaleres API is running!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
