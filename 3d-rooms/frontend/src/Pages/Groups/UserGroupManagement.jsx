import { useState, useEffect } from "react";
import { Button, Input } from "@mui/material";
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
        "http://localhost:4000/api/v1/user/viewAllUsers",{headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}
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

      // Retrieve user ID from localStorage
      const userId = localStorage.getItem("currentUser");

      if (!userId) {
        console.error("User ID not found in localStorage");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:4000/api/v1/user/viewUserGroups",
        { userId },{headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}
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

      // Update the group members in the state if the user is successfully added
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, members: [...new Set([...group.members, userId])] }
            : group
        )
      );

      alert(response.data.message);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        console.error("Error adding user to group:", error);
      }
    }
  };

  // Handle removing user from group
  const removeUserFromGroup = async (userId, groupId) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/removeUserFromGroup",
        {
          userId,
          groupId,
        }
      );

      // Update the group members in the state after successful removal
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group._id === groupId
            ? { ...group, members: group.members.filter((id) => id !== userId) }
            : group
        )
      );

      alert(response.data.message);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        console.error("Error removing user from group:", error);
      }
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

      // Update the frontend state if the group is successfully deleted
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group._id !== groupId)
      );

      alert(response.data.message);
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      } else {
        console.error("Error deleting group:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 px-10 font-sans">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-6">User Group Management</h1>
        <a
          href="/group/global"
          className="mb-4 py-[13px] bg-green-500 px-3 rounded-md text-white font-semibold"
          variant="contained"
        >
          Back
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Search Users</h2>
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            className="border border-gray-200 mb-5 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div
            style={{
              maxHeight: "450px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
            className="bg-white border border-gray-300 rounded-lg p-4"
          >
            <UserSearch
              users={filteredUsers}
              groups={groups}
              onAddToGroup={addUserToGroup}
            />
          </div>
        </div>
        <div className="">
          <h2 className="text-xl font-semibold mb-2">Groups</h2>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="mb-4 py-[13px] bg-blue-500 px-3 rounded-md text-white font-semibold"
            variant="contained"
          >
            CREATE NEW GROUP
          </button>
          <div
            style={{
              maxHeight: "450px",
              overflowY: "auto",
              paddingRight: "10px",
            }}
            className="bg-white border border-gray-300 rounded-lg p-4 mt-[5px]"
          >
            <GroupList
              groups={groups}
              users={users}
              onRemoveUser={removeUserFromGroup}
              onDeleteGroup={deleteGroup}
            />
          </div>
        </div>
      </div>

      {showCreateGroupModal && (
        <CreateGroupModal
          users={users}
          onClose={() => setShowCreateGroupModal(false)}
          onGroupCreated={createGroup}
        />
      )}
    </div>
  );
};

export default UserGroupManagement;
