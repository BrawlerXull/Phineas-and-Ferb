import { useState, useEffect } from "react";
import { Button, Input, Typography, Box, Grid, Card, CardContent } from "@mui/material";
import axios from "axios";
import UserSearch from "./UserSearch";
import GroupList from "./GroupList";
import CreateGroupModal from "./CreateGroupModal.jsx";

const UserGroupManagement = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/viewAllUsers", { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data && response.data.users) {
        setUsers(response.data.users);
      } else {
        console.error("Users not found in API response");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  // Fetch groups for the logged-in user
  const fetchUserGroups = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("currentUser");

      if (!userId) {
        console.error("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/v1/user/viewUserGroups",
        { userId }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data && response.data.groups) {
        setGroups(response.data.groups);
      } else {
        console.error("Groups not found in API response");
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchUserGroups();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter((user) =>
    (user.userName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addUserToGroup = async (userId, groupId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/addUserToGroup",
        {
          userId,
          groupId,
        }
      );

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, members: [...new Set([...group.members, userId])] }
            : group
        )
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error adding user to group:", error);
    }
  };

  const removeUserFromGroup = async (userId, groupId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/removeUserFromGroup",
        {
          userId,
          groupId,
        }
      );

      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, members: group.members.filter((id) => id !== userId) }
            : group
        )
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error removing user from group:", error);
    }
  };

  const createGroup = () => {
    setShowCreateGroupModal(false);
  };

  const deleteGroup = async (groupId) => {
    try {
      const response = await axios.delete(
        "http://localhost:4000/api/v1/user/deleteGroup",
        {
          data: { id: groupId },
        }
      );

      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );

      alert(response.data.message);
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  return (
    <Box sx={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <Grid container spacing={4}>
        {/* Header Section */}
        <Grid item xs={12} container justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold">User Group Management</Typography>
          <Button
            href="/group/global"
            variant="contained"
            color="primary"
            sx={{ borderRadius: "8px" }}
          >
            Back
          </Button>
        </Grid>

        {/* Search Users Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: "20px" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Search Users</Typography>
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              sx={{
                borderRadius: "8px",
                padding: "10px",
                marginBottom: "20px",
                borderColor: "lightgray",
              }}
            />
            <div style={{ maxHeight: "450px", overflowY: "auto" }}>
              <UserSearch
                users={filteredUsers}
                groups={groups}
                onAddToGroup={addUserToGroup}
              />
            </div>
          </Card>
        </Grid>

        {/* Groups Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ padding: "20px" }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Groups</Typography>
            <Button
              onClick={() => setShowCreateGroupModal(true)}
              variant="contained"
              color="secondary"
              sx={{ borderRadius: "8px", marginBottom: "20px" }}
            >
              Create New Group
            </Button>
            <div style={{ maxHeight: "450px", overflowY: "auto" }}>
              <GroupList
                groups={groups}
                users={users}
                onRemoveUser={removeUserFromGroup}
                onDeleteGroup={deleteGroup}
              />
            </div>
          </Card>
        </Grid>
      </Grid>

      {/* Create Group Modal */}
      {showCreateGroupModal && (
        <CreateGroupModal
          users={users}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={createGroup}
        />
      )}
    </Box>
  );
};

export default UserGroupManagement;
