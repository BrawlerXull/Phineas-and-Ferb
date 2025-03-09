import { Button, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

const UserSearch = ({ users, groups, onAddToGroup }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleMenuClick = (event, user) => {
    // setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  //console.log(users);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  return (
    <ul className="space-y-5 mt-3">
      {users
        .filter((user) => user._id !== localStorage.getItem("currentUser"))
        .map((user) => (
          <li
            key={user._id}
            className="flex items-center justify-between bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition-shadow"
          >
            <span className="text-lg font-medium text-gray-800">
              {user.userName}
            </span>
            {/* <button
              onClick={(e) => handleMenuClick(e, user)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mb-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-white text-blue-600 hover:bg-white/90 h-9 rounded-md px-3 border-blue-600 border"
            >
              Add to Group
            </button> */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(selectedUser && selectedUser.id === user.id)}
              onClose={handleMenuClose}
            >
              {groups.map((group) => (
                <MenuItem
                  key={group._id}
                  onClick={() => {
                    onAddToGroup(user._id, group._id);
                    handleMenuClose();
                  }}
                >
                  {group.groupName}
                </MenuItem>
              ))}
            </Menu>
          </li>
        ))}
    </ul>
  );
};

export default UserSearch;
