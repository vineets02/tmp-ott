const roleModel = require("../models/roleModel");
const userModel = require("../models/userModel");

// Seed Initial System Roles
module.exports.seedRoles = async () => {
  const count = await roleModel.countDocuments();
  if (count === 0) {
    await new roleModel({
      name: "Super Admin",
      isSystemRole: true,
      permissions: ["manage_content", "view_finance", "manage_finance", "manage_users", "manage_reviews", "manage_settings"],
      description: "Full access to all system features"
    }).save();
    console.log("System roles seeded successfully");
  }
};

// Get All Roles
module.exports.getAllRolesController = async (req, res) => {
  try {
    const roles = await roleModel.find({});
    res.status(200).send({ success: true, roles });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching roles", error });
  }
};

// Create Custom Role
module.exports.createRoleController = async (req, res) => {
  try {
    const { name, permissions, description } = req.body;
    if (!name || !permissions) return res.status(400).send({ message: "Name and permissions are required" });

    const existing = await roleModel.findOne({ name });
    if (existing) return res.status(400).send({ message: "Role name already exists" });

    const role = await new roleModel({ name, permissions, description }).save();
    res.status(201).send({ success: true, message: "Role created successfully", role });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error creating role", error });
  }
};

// Assign Role to User
module.exports.assignRoleController = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    // If roleId is null, it means revoking staff access
    const update = roleId ? { dynamicRole: roleId, role: 1 } : { dynamicRole: null, role: 0 };
    
    const user = await userModel.findByIdAndUpdate(userId, update, { new: true }).populate("dynamicRole");
    
    const logAdminAction = require("../utils/auditLogger");
    await logAdminAction(req.user._id, "ASSIGN_ROLE", "User", `Assigned role ${user.dynamicRole?.name || "None"} to ${user.name}`, { userId, roleId }, req);

    res.status(200).send({ success: true, message: "Role assigned successfully", user });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error assigning role", error });
  }
};

// Update Role
module.exports.updateRoleController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, description } = req.body;

    const role = await roleModel.findById(id);
    if (!role) return res.status(404).send({ message: "Role not found" });
    if (role.isSystemRole) return res.status(403).send({ message: "System roles cannot be modified" });

    role.name = name || role.name;
    role.permissions = permissions || role.permissions;
    role.description = description || role.description;
    await role.save();

    const logAdminAction = require("../utils/auditLogger");
    await logAdminAction(req.user._id, "UPDATE_ROLE", "Role", `Updated role ${role.name}`, { roleId: id }, req);

    res.status(200).send({ success: true, message: "Role updated successfully", role });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating role", error });
  }
};

// Delete Role
module.exports.deleteRoleController = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await roleModel.findById(id);
    if (!role) return res.status(404).send({ message: "Role not found" });
    if (role.isSystemRole) return res.status(403).send({ message: "System roles cannot be deleted" });

    // Check if any user is using this role
    const usersWithRole = await userModel.countDocuments({ dynamicRole: id });
    if (usersWithRole > 0) return res.status(400).send({ message: "Cannot delete role while it is assigned to users" });

    await role.deleteOne();

    const logAdminAction = require("../utils/auditLogger");
    await logAdminAction(req.user._id, "DELETE_ROLE", "Role", `Deleted role ${role.name}`, { roleId: id }, req);

    res.status(200).send({ success: true, message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error deleting role", error });
  }
};

