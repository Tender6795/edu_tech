"use client";

import { useEffect, useState } from "react";
import { get } from "../../../api/axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getFullUrl } from "@/app/helpers/image.helper";

interface UserDetailsProps {
  params: {
    id: string;
  };
}

interface Worker {
  avatarUrl: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  skills: any;
}

export default function UserDetails({ params }: UserDetailsProps) {
  const { id } = params;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWorker = async () => {
      try {
        console.log("currentis", id);
        const response = await get<Worker>(`/user/${id}`);
        console.log("response", response);
        setWorker(response);
      } catch (error) {
        console.error("Error fetching worker data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWorker();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!worker) return <div>No worker found</div>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <button
        onClick={() => router.push(`/account/team`)}
        className="absolute top-4 left-4 text-white hover:text-black transition-colors mt-16"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <div className="relative min-w-[450px] mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col items-center p-8">
          <Image
            src={
              worker?.avatarUrl
                ? getFullUrl(worker?.avatarUrl)
                : "https://www.w3schools.com/howto/img_avatar.png"
            }
            alt="avatar"
            width={120}
            height={120}
            className="w-[250px] h-[250px] rounded-full object-cover"
          />
          <h2 className="mt-4 text-lg font-bold">{`${worker.firstName} ${worker.lastName}`}</h2>
          <p className="text-gray-600">{worker.email}</p>
          <div className="mt-2">
            {worker.roles.map((role) => (
              <div key={role}>
                <div className="flex justify-center">
                  <span className="inline-block bg-primary text-black text-xs font-semibold px-2 py-1 rounded-full mr-2">
                    {role}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 justify-center mt-2">
                  {worker?.skills?.map((skill:any) => (
                    <div
                      key={skill.id}
                      className="bg-[#FF9B73] text-black text-xs font-semibold px-2 py-1 rounded-full flex justify-center"
                    >
                      {skill?.skill.title + " " + skill?.skill.level}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
