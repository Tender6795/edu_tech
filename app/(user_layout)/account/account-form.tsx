// @ts-nocheck

"use client";

import { useCallback, useEffect, useState, createContext, memo } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, SubmitHandler } from "react-hook-form";
import { AccountFormValues as FormValues, AlertProps } from "./types";
import { Avatar } from "./avatar";
import { resizeImage } from "@/app/helpers/image.helper";
import { Alert } from "@/app/(routes)/courses/components/Alert/Alert";
import { IUser } from "@/app/interfaces/interfaces";
import {
  fetchUpdate,
  selectCurrentUser,
  fetchSkills,
} from "@/app/store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Select from "react-select";
import { MultiValue, ActionMeta } from "react-select";

// Define Avatar file prop and SkillOption types
type AvatarFileProps = { avatar_file?: FileList };
type SkillOption = { value: string; label: string };

const customStylesSelect = {
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#01010",
    border: "1px solid rgb(136, 136, 136, 0.2)",
    borderRadius: "0.5rem",
    boxShadow: "none",
    padding: "0.5rem",
    "&:hover": {
      border: "1px solid #aaa",
    },
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#03a473",
    borderRadius: "0.5rem",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#000a05",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#fff", // Цвет кнопки удаления
    "&:hover": {
      backgroundColor: "#03a473",
      borderRadius: "0.5rem",
      color: "#000a05",
    },
  }),
  indicator: (provided: any) => ({
    ...provided,
    color: "#01010", // Цвет стрелки
  }),
  indicatorSeparator: () => ({
    display: "none", // Убираем линию (дефис) между селектом и стрелкой
  }),
};

// Define initial form values
const initialValues: FormValues & AvatarFileProps = {
  firstName: "",
  lastName: "",
  avatar_url: "",
  avatar_file: undefined,
};

// Create AvatarContext with file and resetFile types
export const AvatarContext = createContext<{
  file: File | null;
  resetFile: () => void;
}>({
  file: null,
  resetFile: () => {},
});

// Main component memoized
export default memo(function AccountForm() {
  const router = useRouter();
  const { user } = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState<boolean>(true);
  const [values, setValues] = useState<FormValues & AvatarFileProps>(
    initialValues
  );
  const [alert, setAlert] = useState<AlertProps | null>(null);
  const [bufferImage, setBufferImage] = useState<File | null>(null);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentSkills, setCurrentSkills] = useState<SkillOption[]>([]);

  // Initialize useForm with proper types
  const methods = useForm<FormValues & AvatarFileProps>({
    defaultValues: initialValues,
  });

  // Fetch and set skills options
  useEffect(() => {
    const getSkills = async () => {
      const { payload } = await dispatch(fetchSkills());
      if (payload) {
        const skillOptions = payload.map(
          (skill: { id: string; title: string }) => ({
            value: skill.id,
            label: skill.title + " " + skill.level,
          })
        );

        setSkills(skillOptions);

        if (user) {
          console.log("user.skills:", user.skills);
          console.log("payload:", payload);

          // Знайти скіли, які збігаються з скілами користувача
          const filteredUserSkills = user.skills
            .map((userSkill) => {
              const matchedSkill = payload.find(
                (skill) => userSkill.skillId === skill.id
              );
              return matchedSkill
                ? {
                    value: matchedSkill.id,
                    label: matchedSkill.title,
                  }
                : null;
            })
            .filter((skill) => skill !== null); // Фільтруємо null значення

          console.log("Filtered user skills:", filteredUserSkills);

          // Оновити currentSkills
          setCurrentSkills(filteredUserSkills);
        }
      }
    };
    getSkills();
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      const newValues = {
        ...initialValues,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        avatar_url: user.avatarUrl ?? "",
        skillIds: selectedSkills,
      };
      setValues(newValues);
      methods.reset(newValues);
    }
  }, [user, selectedSkills, methods]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    resetField,
  } = methods;

  const watchedField = watch("avatar_file");

  const resetFile = () => resetField("avatar_file");

  const handleShowImage = useCallback(() => {
    if (watchedField?.length) {
      const image = watchedField[0];
      resizeImage(image).then((resizedImage) => setBufferImage(resizedImage));
    } else {
      setBufferImage(null);
    }
  }, [watchedField]);

  useEffect(() => {
    handleShowImage();
  }, [handleShowImage]);

  const onSkillsChange = (
    newValue: MultiValue<SkillOption>,
    actionMeta: ActionMeta<SkillOption>
  ) => {
    const selectedValues = newValue.map((option) => option.value);
    setSelectedSkills(selectedValues);

    // Оновлення currentSkills для відображення у селекті
    setCurrentSkills(newValue);
  };
  const updateProfileHandle: SubmitHandler<FormValues> = async ({
    firstName,
    lastName,
  }) => {
    try {
      const formData = new FormData();

      formData.append("firstName", firstName || "");
      formData.append("lastName", lastName || "");
      if (selectedSkills && selectedSkills.length > 0) {
        selectedSkills.forEach((skillId) => {
          formData.append("skillIds", skillId);
        });
      }

      formData.append("skillIds", JSON.stringify(selectedSkills));

      if (bufferImage) {
        const resized = await resizeImage(bufferImage, 300, 300);
        formData.append("avatar", resized, "avatar.jpg");
      }
      console.log(Array.from(formData.entries()));

      // Формуємо об'єкт з даними з FormData
      const payload: {
        firstName: string;
        lastName: string;
        avatar: File | null;
        skillIds: any;
      } = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        avatar: formData.get("avatar") as File | null,
        skillIds: selectedSkills,
      };

      await dispatch(fetchUpdate(payload));

      setAlert({ message: "Profile updated!" });
    } catch (error) {
      setAlert({ message: "Error updating the data!", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="grid md:grid-cols-[auto,_1fr] gap-5 mb-10 w-full justify-items-center md:justify-items-stretch">
        <AvatarContext.Provider value={{ file: bufferImage, resetFile }}>
          <Avatar url={values.avatar_url} />
        </AvatarContext.Provider>
        <div className="md:max-w-xl w-full">
          <form
            className="grid grid-flow-row gap-y-5"
            onSubmit={handleSubmit(updateProfileHandle)}
          >
            <div className="form-control">
              <label htmlFor="email" className="label label-text">
                Email
              </label>
              <input
                className="input input-bordered"
                id="email"
                type="text"
                value={user?.email || ""}
                disabled
              />
            </div>
            <div className="form-control">
              <label htmlFor="firstName" className="label label-text">
                First Name
              </label>
              <input
                {...register("firstName")}
                className="input input-bordered"
                id="firstName"
                type="text"
              />
            </div>
            <div className="form-control">
              <label htmlFor="lastName" className="label label-text">
                Last Name
              </label>
              <input
                {...register("lastName")}
                className="input input-bordered"
                id="lastName"
                type="text"
              />
            </div>

            <div className="form-control">
              <label htmlFor="skillIds" className="label label-text">
                Select Skills
              </label>
              <Select
                id="skillIds"
                isMulti
                options={skills}
                value={currentSkills}
                onChange={onSkillsChange}
                styles={customStylesSelect}
                classNamePrefix="select"
              />
            </div>

            {alert?.message && (
              <Alert
                message={alert.message}
                severity={alert.severity}
                onHide={() => setAlert(null)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                type="button"
                className="btn btn-primary btn-block btn-outline order-last md:order-none"
                onClick={() => router.push("/")}
              >
                go to Main Page
              </button>
              <button className="btn btn-primary btn-block" type="submit">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
});
