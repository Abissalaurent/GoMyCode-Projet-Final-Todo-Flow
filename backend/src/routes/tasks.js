import express from 'express';
import Task from '../models/Task.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      status,
      dueDate,
      isCompleted: status === 'done',
    });

    return res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, dueDate, isCompleted } = req.body;

    const task = await Task.findOne({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) {
      task.status = status;
      if (status === 'done') {
        task.isCompleted = true;
      }
    }
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;

    await task.save();
    return res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

