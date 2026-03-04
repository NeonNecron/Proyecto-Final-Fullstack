/* ======================================================
   COLLECTION: users
   ====================================================== */

const UsersCollection = {
  name: {
    type: "String",
    required: true,
    trim: true
  },

  email: {
    type: "String",
    required: true,
    unique: true,
    lowercase: true,
    index: true // Unique index for fast lookup
  },

  password: {
    type: "String",
    required: true,
    minlength: 6,
    select: false // Not returned by default
  },

  role: {
    type: "String",
    enum: ["admin", "user"],
    default: "user"
  },

  createdAt: {
    type: "Date",
    auto: true
  },

  updatedAt: {
    type: "Date",
    auto: true
  }
};



/* ======================================================
   COLLECTION: tasks
   ====================================================== */

const TasksCollection = {
  title: {
    type: "String",
    required: true
  },

  description: {
    type: "String"
  },

  status: {
    type: "String",
    enum: ["todo", "in-progress", "done"],
    default: "todo"
  },

  priority: {
    type: "String",
    enum: ["low", "medium", "high"],
    default: "medium"
  },

  dueDate: {
    type: "Date"
  },

  completed: {
    type: "Boolean",
    default: false
  },

  user: {
    type: "ObjectId",
    ref: "users",
    required: true,
    index: true // Improves performance for user queries
  },

  createdAt: {
    type: "Date",
    auto: true
  },

  updatedAt: {
    type: "Date",
    auto: true
  }
};



/* ======================================================
   INDEXES
   ====================================================== */

/**
 * Users:
 *  - Unique index on email
 *
 * Tasks:
 *  - Index on user (for fast filtering by owner)
 *  - Optional compound index: { user, status }
 */


/* ======================================================
   DESIGN JUSTIFICATION
   ====================================================== */

/**
 * 1. NoSQL database selected for flexibility and scalability.
 *
 * 2. One-to-many relationship implemented using ObjectId reference.
 *
 * 3. Role-based access control supported at schema level.
 *
 * 4. Indexing strategy:
 *      - email unique constraint
 *      - user reference indexed for performance
 *
 * 5. Timestamps allow auditing and sorting.
 */

module.exports = {
  UsersCollection,
  TasksCollection
};