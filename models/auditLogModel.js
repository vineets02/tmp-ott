const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String, // e.g., "Movie", "User", "Subscription"
      required: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    metadata: {
      type: Object, // Stores any additional context like old values vs new values
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
