import { pgTable, uuid, text, timestamp, boolean, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

// Define enums
export const taskStatusEnum = pgEnum('task_status', ['todo', 'in_progress', 'done']);
export const taskPriorityEnum = pgEnum('task_priority', ['none', 'low', 'medium', 'high']);

// Use enums in table definition
export const tasks = pgTable('tasks', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').notNull(),
    description: text('description').notNull(),
    completed: boolean('completed').notNull().default(false),
    status: taskStatusEnum('status').notNull().default('todo'),
    priority: taskPriorityEnum('priority').notNull().default('none'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const taskRelationships = pgTable('task_relationships', {
    id: uuid('id').defaultRandom().primaryKey(),
    parentTaskId: uuid('parent_task_id').references(() => tasks.id),
    childTaskId: uuid('child_task_id').notNull().references(() => tasks.id),
}, (table) => {
    return {
        uniqRelationship: uniqueIndex('uniq_parent_child').on(table.parentTaskId, table.childTaskId),
    }
});

// TypeScript types for status and priority
export type TaskStatus = typeof taskStatusEnum.enumValues[number];
export type TaskPriority = typeof taskPriorityEnum.enumValues[number];

export type TaskSelect = InferSelectModel<typeof tasks>;
export type TaskInsert = InferInsertModel<typeof tasks>;
export type TaskUpdate = Partial<Omit<TaskInsert, 'id' | 'createdAt' | 'updatedAt'>>;

export type TaskRelationshipSelect = InferSelectModel<typeof taskRelationships>;
export type TaskRelationshipInsert = InferInsertModel<typeof taskRelationships>;
export type TaskRelationshipUpdate = Partial<TaskRelationshipInsert>;

export type Task = TaskSelect & {
    parentId: TaskSelect['id'] | null;
    children: TaskSelect['id'][];
};

export type NewTask = Omit<TaskInsert, 'id' | 'createdAt' | 'updatedAt'> & {
    parentId: TaskSelect['id'] | null;
};
// Updated TaskSearchParams to use enum types
export type TaskSearchParams = {
    query?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    completed?: boolean;
    dueDate?: Date | null;
};

// New type for hierarchical representation. Used for providing context to LLM
export type TaskNode = Omit<Task, 'children'> & {
    children: TaskNode[];
};