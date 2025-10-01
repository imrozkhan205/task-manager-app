import Task from '../models/Task.js';

// Get all tasks for the logged-in user
// controllers/taskController.js - Updated with pagination

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get tasks with pagination
export const getTasksPaginated = async (req, res) => {
  try {
    // Get page and limit from query params, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    
    // Calculate skip value
    const skip = (page - 1) * limit;
    
    // Get total count for pagination info
    const totalTasks = await Task.countDocuments({ userId: req.userId });
    
    // Fetch paginated tasks
    const tasks = await Task.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate total pages
    const totalPages = Math.ceil(totalTasks / limit);
    const hasMore = page < totalPages;
    
    // Send response with pagination metadata
    res.json({
      tasks,
      currentPage: page,
      totalPages,
      totalTasks,
      hasMore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single task (only if it belongs to the logged-in user)
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// OPTIONAL: Get task statistics (for header counts)
export const getTaskStats = async (req, res) => {
  try {
    const stats = await Task.aggregate([
      { $match: { userId: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the response
    const formattedStats = {
      pending: 0,
      'in progress': 0,
      done: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
      }
      formattedStats.total += stat.count;
    });
    
    res.json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a task for the logged-in user
export const createTask = async (req, res) => {
  try {
    console.log("👤 req.userId in createTask:", req.userId);

    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      userId: req.userId, // attach the user ID
    });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a task (only if it belongs to the logged-in user)
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a task (only if it belongs to the logged-in user)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle task completion (only if it belongs to the logged-in user)
export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.completed = !task.completed;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
