require("../instrument");
import express, { Request as ExpressRequest, Response } from "express";
import { authenticateToken } from "../utils/auth";
import morgan from "morgan";
import {
  getTopLevelTasks,
  createTask,
  updateTask,
  deleteTask,
  searchTasks,
  getSubtasks
} from "../db/tasks/taskActions";
import { NewTask, TaskUpdate, TaskSearchParams } from "../db/schema";
import { getGmailMessages, getGoogleCalendarEvents } from "../api/thirdParty/google";
const app = express();
interface Request extends ExpressRequest {
  user?: {
    user_id: string;
  };
}

app.use(express.json());
app.use(morgan("dev"));

/**
 * @api {get} /api/tasks Get Top-Level Tasks
 * @apiName GetTopLevelTasks
 * @apiGroup Tasks
 * @apiDescription Retrieves all top-level tasks for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiSuccess {Object[]} tasks List of top-level tasks.
 * @apiSuccess {String} tasks.id Unique identifier of the task.
 * @apiSuccess {String} tasks.userId ID of the user who owns the task.
 * @apiSuccess {String} tasks.description Task description.
 * @apiSuccess {Boolean} tasks.completed Whether the task is completed.
 * @apiSuccess {String} tasks.status Task status (todo, in_progress, done).
 * @apiSuccess {String} tasks.priority Task priority (none, low, medium, high).
 * @apiSuccess {String} tasks.dueDate Due date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.createdAt Creation date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.updatedAt Last update date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.parentId ID of the parent task (null for top-level tasks).
 * @apiSuccess {String[]} tasks.children IDs of child tasks.
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to fetch tasks.
 */
app.get(
  "/api/tasks",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const topLevelTasks = await getTopLevelTasks(req.user.user_id);
      res.json(topLevelTasks);
    } catch (error) {
      console.error("Error fetching top-level tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }
);

/**
 * @api {post} /api/tasks Create New Task
 * @apiName CreateTask
 * @apiGroup Tasks
 * @apiDescription Creates a new task for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiParam {String} description Task description.
 * @apiParam {Boolean} [completed=false] Whether the task is completed.
 * @apiParam {String} [status="todo"] Task status (todo, in_progress, done).
 * @apiParam {String} [priority="none"] Task priority (none, low, medium, high).
 * @apiParam {String} [dueDate] Due date of the task (ISO 8601 format).
 * @apiParam {String} [parentId] ID of the parent task (if creating a subtask).
 * 
 * @apiSuccess {Object} task Created task object.
 * @apiSuccess {String} task.id Unique identifier of the created task.
 * @apiSuccess {String} task.userId ID of the user who owns the task.
 * @apiSuccess {String} task.description Task description.
 * @apiSuccess {Boolean} task.completed Whether the task is completed.
 * @apiSuccess {String} task.status Task status.
 * @apiSuccess {String} task.priority Task priority.
 * @apiSuccess {String} task.dueDate Due date of the task (ISO 8601 format).
 * @apiSuccess {String} task.createdAt Creation date of the task (ISO 8601 format).
 * @apiSuccess {String} task.updatedAt Last update date of the task (ISO 8601 format).
 * @apiSuccess {String} task.parentId ID of the parent task (null for top-level tasks).
 * @apiSuccess {String[]} task.children Empty array (as it's a new task).
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to create task.
 */
app.post(
  "/api/tasks",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const newTask: NewTask = { ...req.body, userId: req.user.user_id };
      const createdTask = await createTask(newTask, req.user.user_id);
      res.status(201).json(createdTask);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  }
);

/**
 * @api {put} /api/tasks/:id Update Task
 * @apiName UpdateTask
 * @apiGroup Tasks
 * @apiDescription Updates an existing task for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiParam {String} id Task ID to update.
 * 
 * @apiBody {String} [description] Updated task description.
 * @apiBody {Boolean} [completed] Updated completion status.
 * @apiBody {String} [status] Updated task status (todo, in_progress, done).
 * @apiBody {String} [priority] Updated task priority (none, low, medium, high).
 * @apiBody {String} [dueDate] Updated due date (ISO 8601 format).
 * 
 * @apiSuccess {Object} task Updated task object.
 * @apiSuccess {String} task.id Unique identifier of the updated task.
 * @apiSuccess {String} task.userId ID of the user who owns the task.
 * @apiSuccess {String} task.description Updated task description.
 * @apiSuccess {Boolean} task.completed Updated completion status.
 * @apiSuccess {String} task.status Updated task status.
 * @apiSuccess {String} task.priority Updated task priority.
 * @apiSuccess {String} task.dueDate Updated due date (ISO 8601 format).
 * @apiSuccess {String} task.createdAt Creation date of the task (ISO 8601 format).
 * @apiSuccess {String} task.updatedAt Last update date of the task (ISO 8601 format).
 * @apiSuccess {String} task.parentId ID of the parent task (null for top-level tasks).
 * @apiSuccess {String[]} task.children IDs of child tasks.
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to update task.
 */
app.put(
  "/api/tasks/:id",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const taskId = req.params.id;
      const updates: TaskUpdate = req.body;
      const updatedTask = await updateTask(taskId, updates, req.user.user_id);
      res.json(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  }
);

/**
 * @api {delete} /api/tasks/:id Delete Task
 * @apiName DeleteTask
 * @apiGroup Tasks
 * @apiDescription Deletes a task and all its subtasks for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiParam {String} id Task ID to delete.
 * 
 * @apiSuccess (204) {null} No Content Task successfully deleted.
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to delete task.
 */
app.delete(
  "/api/tasks/:id",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const taskId = req.params.id;
      await deleteTask(taskId, req.user.user_id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  }
);

/**
 * @api {get} /api/tasks/search Search Tasks
 * @apiName SearchTasks
 * @apiGroup Tasks
 * @apiDescription Searches tasks based on provided parameters for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiQuery {String} [query] Search query to match against task descriptions.
 * @apiQuery {String} [status] Filter by task status (todo, in_progress, done).
 * @apiQuery {String} [priority] Filter by task priority (none, low, medium, high).
 * @apiQuery {Boolean} [completed] Filter by completion status.
 * @apiQuery {String} [dueDate] Filter by due date (ISO 8601 format).
 * 
 * @apiSuccess {Object[]} tasks List of tasks matching the search criteria.
 * @apiSuccess {String} tasks.id Unique identifier of the task.
 * @apiSuccess {String} tasks.userId ID of the user who owns the task.
 * @apiSuccess {String} tasks.description Task description.
 * @apiSuccess {Boolean} tasks.completed Whether the task is completed.
 * @apiSuccess {String} tasks.status Task status.
 * @apiSuccess {String} tasks.priority Task priority.
 * @apiSuccess {String} tasks.dueDate Due date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.createdAt Creation date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.updatedAt Last update date of the task (ISO 8601 format).
 * @apiSuccess {String} tasks.parentId ID of the parent task (null for top-level tasks).
 * @apiSuccess {String[]} tasks.children IDs of child tasks.
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to search tasks.
 */
app.get(
  "/api/tasks/search",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const searchParams: TaskSearchParams = {
        ...req.query,
        dueDate: req?.query?.dueDate ? new Date(req?.query?.dueDate as string) : undefined
      };
      const searchResults = await searchTasks(searchParams, req.user.user_id);
      res.json(searchResults);
    } catch (error) {
      console.error("Error searching tasks:", error);
      res.status(500).json({ error: "Failed to search tasks" });
    }
  }
);

/**
 * @api {get} /api/tasks/:id/subtasks Get Subtasks
 * @apiName GetSubtasks
 * @apiGroup Tasks
 * @apiDescription Retrieves all subtasks of a given task for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiParam {String} id Parent task ID.
 * 
 * @apiSuccess {Object[]} subtasks List of subtasks.
 * @apiSuccess {String} subtasks.id Unique identifier of the subtask.
 * @apiSuccess {String} subtasks.userId ID of the user who owns the subtask.
 * @apiSuccess {String} subtasks.description Subtask description.
 * @apiSuccess {Boolean} subtasks.completed Whether the subtask is completed.
 * @apiSuccess {String} subtasks.status Subtask status.
 * @apiSuccess {String} subtasks.priority Subtask priority.
 * @apiSuccess {String} subtasks.dueDate Due date of the subtask (ISO 8601 format).
 * @apiSuccess {String} subtasks.createdAt Creation date of the subtask (ISO 8601 format).
 * @apiSuccess {String} subtasks.updatedAt Last update date of the subtask (ISO 8601 format).
 * @apiSuccess {String} subtasks.parentId ID of the parent task.
 * @apiSuccess {String[]} subtasks.children IDs of child tasks (if any).
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to fetch subtasks.
 */
app.get(
  "/api/tasks/:id/subtasks",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const taskId = req.params.id;
      const subtasks = await getSubtasks(taskId, req.user.user_id);
      res.json(subtasks);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      res.status(500).json({ error: "Failed to fetch subtasks" });
    }
  }
);

/**
 * @api {get} /api/calendar/events Get Google Calendar Events
 * @apiName GetGoogleCalendarEvents
 * @apiGroup Calendar
 * @apiDescription Retrieves Google Calendar events for the authenticated user.
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiSuccess {Object[]} events List of calendar events.
 * @apiSuccess {String} events.id Unique identifier of the event.
 * @apiSuccess {String} events.summary Event summary or title.
 * @apiSuccess {Object} events.start Event start time information.
 * @apiSuccess {String} events.start.dateTime Start date and time of the event (ISO 8601 format).
 * @apiSuccess {String} events.start.timeZone Time zone of the start time.
 * @apiSuccess {Object} events.end Event end time information.
 * @apiSuccess {String} events.end.dateTime End date and time of the event (ISO 8601 format).
 * @apiSuccess {String} events.end.timeZone Time zone of the end time.
 * 
 * @apiError (401) {Object} Unauthorized Authentication failed.
 * @apiError (500) {Object} InternalServerError Failed to fetch calendar events.
 */
app.get(
  "/api/calendar/events",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const calendarEvents = await getGoogleCalendarEvents(req.user.user_id);
      res.json(calendarEvents);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  }
);

app.get(
  "/api/gmail/messages",
  [authenticateToken],
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      const messages = await getGmailMessages(req.user.user_id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching Gmail messages:", error);
      res.status(500).json({ error: "Failed to fetch Gmail messages" });
    }
  }
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`
    🚀 Server ready at: http://localhost:${port}
  `);
});

module.exports = app;