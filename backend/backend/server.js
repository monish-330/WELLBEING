require("dotenv").config();

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const SelfCare = require("./models/SelfCare");

const authRoutes = require("./routes/authRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const counselorRoutes = require("./routes/counselorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const moodRoutes = require("./routes/moodRoutes");
const journalRoutes = require("./routes/journalRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const selfCareRoutes = require("./routes/selfCareRoutes");
const savedContentRoutes = require("./routes/savedContentRoutes");
const forumRoutes = require("./routes/forumRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const mongoose = require("mongoose");

const app = express();
const port = Number(process.env.PORT) || 5001;


function buildDefaultSelfCareCategories() {
  return [
    { name: "Happy", order: 1 },
    { name: "Sad", order: 2 },
    { name: "Stress", order: 3 },
    { name: "Relaxation", order: 4 },
    { name: "Breathing", order: 5 },
    { name: "Sleep", order: 6 },
    { name: "PCOD", order: 7 },
    { name: "Anxiety", order: 8 },
    { name: "Anger", order: 9 }
  ];
}

function buildDefaultSelfCareItems() {
  return [
    {title:"Smile Practice",category:"Happy",image:"/images/Smile_Practice.jpg",steps:["Stand in front of a mirror.","Smile gently for one minute.","Notice how your face and body feel."]},
{title:"Dance Break",category:"Happy",image:"/images/dance_break_happy.jpg",steps:["Play one favorite song.","Move freely for two to three minutes.","Pause and notice your energy."]},
{title:"Positive Affirmations",category:"Happy",image:"/images/positive_happy.jpg",steps:["Say three kind statements to yourself.","Repeat them aloud slowly.","Pick one line to remember today."]},
{title:"Watch Comedy",category:"Happy",image:"/images/watch_comedy_happy.jpg",steps:["Open a short funny clip.","Watch without multitasking.","Notice if your body feels lighter after it ends."]},
{title:"Color Therapy",category:"Happy",image:"/images/color_therapy_happy.jpg",steps:["Pick colors that feel bright and warm.","Color for ten minutes.","Let the activity stay playful, not perfect."]},
{title:"Music Boost",category:"Happy",image:"/images/music_boote_happy.jpg",steps:["Play an uplifting playlist.","Sit or walk while listening.","Choose the song that changes your mood most."]},
{title:"Release Sadness",category:"Sad",image:"/images/release sadness_sad.jpg",steps:["Give yourself permission to feel sad.","Take three soft breaths.","Write or say what is hurting right now."]},
{title:"Comfort Music",category:"Sad",image:"/images/comfort_music_sad.jpg",steps:["Choose music that feels safe.","Sit quietly and listen.","Let the song finish before checking your phone."]},
{title:"Comfort Breathing",category:"Sad",image:"/images/comfortable_breathing_sad.jpg",steps:["Inhale for four counts.","Exhale for six counts.","Repeat until your body softens a little."]},
{title:"Soft Music Therapy",category:"Sad",image:"/images/softmusictherapy_sad.webp",steps:["Put on soft instrumental music.","Close your eyes.","Focus on one sound at a time."]},
{title:"Self Hug",category:"Sad",image:"/images/self_hug_sad.jpg",steps:["Wrap your arms around yourself.","Take slow breaths.","Stay there for thirty seconds and soften your shoulders."]},
{title:"Talk to Friend",category:"Sad",image:"/images/talk to friend_sad.jpg",steps:["Message or call someone safe.","Tell them you need a small check-in.","Share honestly, even if briefly."]},
{title:"Gentle Walk",category:"Sad",image:"/images/gentle_walk_sad.jpg",steps:["Walk slowly for five to ten minutes.","Notice the sky, trees, or sounds.","Return without rushing yourself."]},
{title:"Stress Reset",category:"Stress",image:"/images/stress_resetstress.jpg",steps:["Stop what you are doing for one minute.","Breathe in slowly and unclench your jaw.","Pick just one next task."]},
{title:"Desk Stretch",category:"Stress",image:"/images/desk_strect_stress.jpg",steps:["Roll your shoulders back.","Stretch your neck gently.","Open and close your hands ten times."]},
{title:"Hydrate Break",category:"Stress",image:"/images/hydrated_break_stress.jpg",steps:["Drink a full glass of water.","Step away from your screen.","Take five deep breaths before returning."]},
{title:"Calm Body Scan",category:"Relaxation",image:"/images/calmbodyscan_relax.jpg",steps:["Close your eyes.","Relax each body part from head to toe.","Pause longer where you feel tension."]},
{title:"Nature Visualization",category:"Relaxation",image:"/images/nature_relaxation.jpg",steps:["Imagine a peaceful natural place.","Picture the colors and sounds.","Stay with that scene for two minutes."]},
{title:"Tea Pause",category:"Relaxation",image:"/images/tea_relax.webp",steps:["Make a warm drink.","Hold the cup with both hands.","Sip slowly without distractions."]},
{title:"4-7-8 Breathing",category:"Breathing",image:"/images/4-7-8-Breathing.webp",steps:["Inhale for 4 counts.","Hold for 7 counts.","Exhale slowly for 8 counts."]},
{title:"Box Breathing",category:"Breathing",image:"/images/box breathing_breath.jpg",steps:["Inhale for 4 counts.","Hold for 4 counts.","Exhale for 4 counts.","Hold for 4 counts."]},
{title:"Belly Breathing",category:"Breathing",image:"/images/bellybreathing_breathing.png",steps:["Place a hand on your stomach.","Breathe so your belly rises.","Exhale longer than you inhale."]},
{title:"Screen Off Ritual",category:"Sleep",image:"/images/screen0gg_sleep.jpg",steps:["Turn off bright screens.","Set an alarm now.","Keep the room quieter and darker."]},
{title:"Night Journal",category:"Sleep",image:"/images/night_journal_sleep.jpeg",steps:["Write down lingering thoughts.","Note one thing to do tomorrow.","Close the journal and let the day end."]},
{title:"Gentle Stretch",category:"PCOD",image:"/images/gentlestretch_pcod.avif",steps:["Do a short full-body stretch.","Move gently and breathe evenly.","Stop if anything feels painful."]},
{title:"Warm Water Sip",category:"PCOD",image:"/images/warm water_pcod.jpg",steps:["Prepare warm water.","Sip slowly.","Use the moment as a small reset."]},
{title:"Mood Care Note",category:"PCOD",image:"/images/mood_care_pcod.jpg",steps:["Write how your body feels today.","Note your energy and mood.","Choose one supportive action for yourself."]},
{title:"Safe Thought Note",category:"Anxiety",image:"/images/safe_tpught_anxety.jpg",steps:["Write one balanced thought.","Read it twice.","Return to it when your mind races."]},
{title:"Reach Out",category:"Anxiety",image:"/images/reachout_anxiety.jpg",steps:["Text someone you trust.","Say you feel anxious.","Ask for a brief grounding conversation."]},
{title:"Pause Before Reply",category:"Anger",image:"/images/pausereply_anger.jpg",steps:["Step away for one minute.","Breathe before responding.","Choose calmer words when you return."]},
{title:"Cooling Breath",category:"Anger",image:"/images/colling breathing_anger.avif",steps:["Inhale through your nose.","Exhale slowly as if cooling hot tea.","Repeat until your shoulders drop."]},
{title:"Water Break",category:"Anger",image:"/images/water break_anger.jpg",steps:["Drink water slowly.","Loosen your hands and jaw.","Delay the reaction until you feel steadier."]},
{title:"Shoulder Release",category:"Tesion",image:"/images/desk_strect_stress.jpg",steps:["Lift your shoulders up.","Drop them on the exhale.","Repeat ten times."]},
{title:"Neck Roll",category:"Tesion",image:"/images/desk_strect_stress.jpg",steps:["Tilt your head gently side to side.","Move slowly in a small circle.","Stop if you feel strain."]},
{title:"Jaw Release",category:"Tesion",image:"/images/desk_strect_stress.jpg",steps:["Unclench your jaw.","Massage the jaw joint softly.","Take three slow breaths."]},
  ];
}

app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/auth", authRoutes);
app.use("/api/student", assessmentRoutes);
app.use("/api/counselor", counselorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/journals", journalRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/selfcare", selfCareRoutes);
app.use("/api/saved", savedContentRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/counselors", counselorRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/posts", require("./routes/postRoutes"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Server error" });
});

async function seedDefaults() {
  const password = await bcrypt.hash("admin123", 10);
  const users = [
    {
      name: "Admin User",
      username: "admin",
      email: "admin@example.com",
      role: "admin"
    },
  ];

  for (const userData of users) {
    await User.findOneAndUpdate(
      { username: userData.username },
      { ...userData, password },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const defaultCategories = buildDefaultSelfCareCategories();
  for (const category of defaultCategories) {
    await Category.findOneAndUpdate(
      { name: category.name },
      { $set: { order: category.order } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const defaultSelfCareItems = buildDefaultSelfCareItems();
  for (const item of defaultSelfCareItems) {
    await SelfCare.findOneAndUpdate(
      { title: item.title, category: item.category },
      { $setOnInsert: item },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function start() {
  await connectDB();

  await seedDefaults();

  try {
    await mongoose.connection.collection("users").dropIndex("anonymousName_1");
    console.log("✅ Dropped old anonymousName index");
  } catch (err) {
    console.log("");
  }

  const ports = [...new Set([port, 5000, 3000])];
  ports.forEach((listenPort) => {
    const server = app.listen(listenPort, () => {
      console.log(`Backend running on http://localhost:${listenPort}`);
    });
    server.on("error", (err) => {
      console.error(`⚠️ Failed to listen on port ${listenPort}:`, err.message);
    });
  });
}

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
