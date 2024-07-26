"use client";

import { getTeam } from "@/app/(user_layout)/(admins)/manage_users/action";
import {
  setUser,
  getTeamName,
} from "@/app/(user_layout)/(admins)/manage_users/action"; // Імпортуйте функцію setUser
import {  IUser, IUserWithTeam } from "@/app/interfaces/interfaces";
import React, { FC, useEffect, useState } from "react";




interface UserProps {
  users: IUserWithTeam[];
  teamId: any;
}

const Users: FC<UserProps> = ({ users, teamId }) => {
  const [usersM, setUsersM] = useState<IUserWithTeam[]>();
  const [searchTerm, setSearchTerm] = useState("");
  const [teamNames, setTeamNames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const getUsersWithTeam = async () => {
      const profilesWithTeams = await Promise.all(
        users.map(async (profile: IUserWithTeam) => {
          const teams = await getTeam(profile.id);
          return { ...profile, teams: teams || [] };
        })
      );

      setUsersM(profilesWithTeams.map((profile: IUserWithTeam) => profile));

      // Fetch team names
      const names: { [key: string]: string } = {};
      await Promise.all(
        profilesWithTeams.flatMap((profile) =>
          profile?.teams?.map(async (team) => {
            const teamName = await getTeamName(team.team_id);
            names[team.team_id] = teamName;
          })
        )
      );

      setTeamNames(names);
    };

    getUsersWithTeam();
  }, [users]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = usersM?.filter((user) =>
    user?.first_name?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const setUserFunction = async (userId: any) => {
    try {
      const result = await setUser({ id: userId, teamId });
      console.log("User set successfully", result);
    } catch (error) {
      console.error("Failed to set user", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="tepxt-3xl font-bold mb-6">Invite new users</h1>
      <input
        type="text"
        placeholder="Search users"
        value={searchTerm}
        onChange={handleSearch}
        className="mb-5 p-2 w-full border border-gray-300 rounded"
      />
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers?.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-4 bg-white shadow rounded"
          >
            <div className="text-lg font-medium">{user.first_name}</div>
            <div className="flex items-center space-x-4">
              {user?.teams?.length > 0 ? (
                <div className="text-sm text-gray-600">
                  {user.teams
                    .map((team: any) => teamNames[team.team_id] || "Loading...")
                    .join(", ")}
                </div>
              ) : (
                <button
                  onClick={() => setUserFunction(user.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Invite user
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
