const auditLogModel = require("../models/auditLogModel");

module.exports.getAuditLogsController = async (req, res) => {
  try {
    const logs = await auditLogModel.find({})
      .populate("admin", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).send({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching logs", error });
  }
};
