import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const GroupList = ({ groups, users, onRemoveUser, onDeleteGroup }) => {
  const navigate=useNavigate()
  console.log(groups)
  return (
    <ul className="space-y-4">
      {groups.map((group) => (
        <li key={group._id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">{group.groupName}</h3>
            <div className="space-x-2">
              <button
                onClick={() => onDeleteGroup(group._id)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-red-600 text-white hover:bg-red-600/90 h-9 rounded-md px-3"
              >
                Delete Group
              </button>
            </div>
          </div>
          <button onClick={()=>navigate(`/group/${group._id}`)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mb-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-green-600 text-white hover:bg-green-600/90 h-9 rounded-md px-3">
            Join Virtual Chat
          </button>
          <ul className="space-y-1">
            {group.members.map((member) => {
              const user = users.find((u) => u._id === member._id); 
              return user ? (
                <li
                  key={user._id}
                  className="flex items-center justify-between"
                >
                  <span>{user.userName}</span>
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => onRemoveUser(user._id, group._id)}
                  >
                    Remove
                  </Button>
                </li>
              ) : (
                <li
                  key={memberId}
                  className="flex items-center justify-between"
                >
                  <span>User not found</span> 
                </li>
              );
            })}
          </ul>
        </li>
      ))}
    </ul>
  );
};

export default GroupList;
