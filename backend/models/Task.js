import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate: { type: Date },
  status: { type: String, enum: ["pending", "in progress", "done"], default: "pending" }, // 👈 track task status
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 👈 link to User
  createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model("Task", taskSchema);
export default Task;
