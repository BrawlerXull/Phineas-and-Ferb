import React, { useState, useEffect } from "react";
import { Modal, Button, Checkbox, Input } from "@mui/material"; // Ensure Modal is imported
import axios from "axios";

const CreateGroupModal = ({ users, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      alert("Group name and at least one member are required!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/createUserGroup",
        { groupName, userIds: selectedUsers,  authenticatedUserId:localStorage.getItem('currentUser')},
        {headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}}
      );

      if (response.data && response.data.group) {
        alert("Group created successfully!");
        //onGroupCreated();
        onClose();
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert("Failed to create group.");
    }
  };

  return (
    <Modal open={true} onClose={onClose}>
      <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-20">
        <h2 className="text-xl font-semibold mb-4">Create New Group</h2>
        <Input
          fullWidth
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mb-4"
        />
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
          }}
          className="border rounded p-2"
        >
          {users
            .filter((user) => user._id !== localStorage.getItem("currentUser"))
            .map((user) => (
              <div key={user._id} className="flex items-center mb-2">
                <Checkbox
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => toggleUserSelection(user._id)}
                />
                <span>{user.userName}</span>
              </div>
            ))}
        </div>
        <div className="mt-4">
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateGroup}
          >
            Create Group
          </Button>
          <Button onClick={onClose} className="ml-2">
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateGroupModal;
