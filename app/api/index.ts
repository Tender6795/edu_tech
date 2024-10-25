import { boolean } from "yup";
import {
  IAuth,
  ICourse,
  ICourseWithAuthor,
  ILesson,
  ILessonWithCourse,
  ITeam,
  IUser,
} from "../interfaces/interfaces";
import { get, post, patch, httpDelete } from "./axios";

export const login = (body: IAuth) =>
  post("/auth/login", body).then((res: any) => {
    localStorage.setItem("token", res.accessToken);
    return res;
  });
export const register = (body: IAuth) =>
  post("/auth/register", body).then((res: any) => {
    localStorage.setItem("token", res.accessToken);
    return res;
  });

// /* users requests */
export const currentUser = () => post("/user/currentUser");
export const updateUser = (formData: any) =>
  patch("/user/currentUser", formData);
export const getAllUsers = () => get("/user");
export const getAllTeamLeaders = ({ withTeam }: { withTeam: boolean }) =>
  get(`/user/teamleaders/${withTeam}`);
export const getAllWorkers = () => get(`/user/workers`);
export const updateUserMultiple = (body: IUser[]) =>
  patch("/user/updateUserMultiple", body);

// /* skill */ //
export const getSkills = () => get("/skill");

// /* teams requests */
export const getAllTeams = () => get("/team");
export const createTeamApi = (body: Pick<ITeam, "teamName" | "teamLeaderId">) => post("/team", body);

// /* courses requests */
export const createCourseApi = (body: FormData) => post("/courses", body);
export const updateCourseApi = (corseId: string, body: FormData) =>
  patch(`/courses/${corseId}`, body);
export const getCourseByIdApi = (courseId: string): Promise<ICourse> =>
  get(`/courses/${courseId}`);
export const getAllCourseApi = (): Promise<ICourseWithAuthor[]> =>
  get(`/courses`);
export const deleteCourseApi = (id: string) => httpDelete(`/courses/${id}`);

// /* lessons requests */
export const addLessonToCourseApi = (body: ILesson) => post(`/lessons`, body);
export const deleteLessonByIdApi = (id: string) => httpDelete(`/lessons/${id}`);
export const updateLessonByIdApi = (id: string, body: ILesson) =>
  patch(`/lessons/${id}`, body);
export const getLessonByIdApi = (id: string): Promise<ILessonWithCourse> =>
  get(`/lessons/${id}`);
