"use client";
import { getAllWorkers, updateUserMultiple } from "@/app/api";
import { useRouter } from "next/navigation";
import { IUser } from "@/app/interfaces/interfaces";
import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Image from "next/image";
import { getFullUrl } from "@/app/helpers/image.helper";

interface UpdateParticipantsModalProps {
  teamId: string;
  updateParticipants: (selectedWorkers: IUser[]) => void;
}

const UpdateParticipantsModal: React.FC<UpdateParticipantsModalProps> = ({
  teamId,
  updateParticipants,
}) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [workers, setWorkers] = useState<IUser[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<IUser[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!isModalOpen) return;
    init();
  }, [isModalOpen]);

  const init = async () => {
    try {
      const respWorkers = (await getAllWorkers()) as IUser[];

      // Remove members of other teams
      const filteredWorkers = respWorkers.filter(
        (worker) => worker.teamId === teamId || worker.teamId === null
      );

      //Selected to top
      const sortedWorkers = filteredWorkers.sort((a, b) =>
        a.teamId === teamId ? -1 : 1
      );

      setWorkers(sortedWorkers);
      setFilteredWorkers(sortedWorkers);

      const preSelectedWorkers = new Set(
        sortedWorkers
          .filter((worker) => worker.teamId === teamId)
          .map((worker) => worker.id)
      );
      setSelectedWorkers(preSelectedWorkers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleCheckboxChange = (workerId: string) => {
    setSelectedWorkers((prevSelectedWorkers) => {
      const updatedSelectedWorkers = new Set(prevSelectedWorkers);
      const updatedWorkers = workers.map((worker) => {
        if (worker.id === workerId) {
          if (updatedSelectedWorkers.has(workerId)) {
            updatedSelectedWorkers.delete(workerId);
            return { ...worker, teamId: null };
          } else {
            updatedSelectedWorkers.add(workerId);
            return { ...worker, teamId: teamId };
          }
        }
        return worker;
      });

      setWorkers(updatedWorkers);
      return updatedSelectedWorkers;
    });
  };

  const handleUpdateParticipants = async () => {
    const selectedWorkersList = workers
      .filter((worker) => selectedWorkers.has(worker.id))
      .map((worker) => ({ ...worker, teamId }));
    await updateUserMultiple(workers);
    updateParticipants(selectedWorkersList);
    closeModal();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    if (!query) {
      setFilteredWorkers(workers);
      return;
    }
    setFilteredWorkers(
      workers.filter(
        (worker) =>
          worker.firstName.toLowerCase().includes(query) ||
          worker.lastName.toLowerCase().includes(query)
      )
    );
  };
console.log('filteredWorkers', filteredWorkers)
  return (
    <>
      <button
        onClick={openModal}
        className="text-green-500 hover:text-green-700"
      >
        <FaEdit size={16} />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-[50%] min-h-[60vh] max-h-[80vh] overflow-hidden flex flex-col">
            {" "}
            <h2 className="text-lg font-bold mb-4">Update Participants</h2>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search workers..."
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex-grow overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                {filteredWorkers.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex flex-col items-center gap-2 mb-4 cursor-pointer"
             
                  >
                    <div
                    className="flex flex-col items-center"
                           onClick={() => {
                            console.log('worker', worker)
                            router.push(`/user/${worker?.id}`);
      
                          }}
                    >
    <Image
                      src={worker?.avatarUrl ? getFullUrl(worker?.avatarUrl) : "https://www.w3schools.com/howto/img_avatar.png"}
                      alt="avatar"
                      width={60}
                      height={60}
               
                      className="w-[60px] h-[60px] rounded-full object-cover"
                    />
                    <span className="text-gray-800 text-center">
                      {worker.firstName} {worker.lastName}
                    </span>

                    </div>
                
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWorkers.has(worker.id)}
                        onChange={() => handleCheckboxChange(worker.id)}
                        className="hidden"
                      />
                      <span
                        className={`w-5 h-5 border-2 ${
                          selectedWorkers.has(worker.id)
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-300"
                        } rounded-sm flex items-center justify-center`}
                      >
                        {selectedWorkers.has(worker.id) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        )}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateParticipants}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UpdateParticipantsModal;
