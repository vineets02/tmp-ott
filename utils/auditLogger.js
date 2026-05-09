const auditLogModel = require("../models/auditLogModel");

const logAdminAction = async (adminId, action, resource, details = "", metadata = {}, req = null) => {
  try {
    const ipAddress = req ? req.ip || req.connection.remoteAddress : "Unknown";
    await new auditLogModel({
      admin: adminId,
      action,
      resource,
      details,
      metadata,
      ipAddress
    }).save();
  } catch (error) {
    console.error("Audit Logging Error:", error);
  }
};

module.exports = logAdminAction;
