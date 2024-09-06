"use client";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { createCourseApi, updateCourseApi, getCourseByIdApi } from "@/app/api";
import { ICourse } from "@/app/interfaces/interfaces";
import { useUser } from "@/app/hooks/auth.hook";

const validationSchema = Yup.object({
  courseName: Yup.string().required("Course name is required"),
  tags: Yup.array().min(1, "At least one tag is required"),
  description: Yup.string().required("Description is required"),
  materials: Yup.array().of(Yup.string().url("Must be a valid URL")),
});

interface FormValues {
  courseName: string;
  tags: string[];
  description: string;
  materials: string[];
  tagsInput: string;
  materialsInput: string;
}

interface CourseFormProps {
  courseId?: string;
}

export default function CourseForm({ courseId }: CourseFormProps) {
  const user = useUser();
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const formik = useFormik<FormValues>({
    initialValues: {
      courseName: "",
      tags: [],
      description: "",
      materials: [],
      tagsInput: "",
      materialsInput: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const newCourse: ICourse = {
        id: courseId,
        name: values.courseName,
        tags: values.tags,
        description: values.description,
        materials: values.materials,
        authorId: user!.id,
      };

      try {
        if (courseId) {
          await updateCourseApi(newCourse);
        } else {
          await createCourseApi(newCourse);
        }
        router.push("/courses-list");
      } catch (error) {
        console.error(error);
      }
    },
  });

  useEffect(() => {
    if (courseId) {
      setIsLoading(true);
      getCourseByIdApi(courseId)
        .then((course) => {
          formik.setValues({
            courseName: course.name || "",
            tags: course.tags || [],
            description: course.description || "",
            materials: course.materials || [],
            tagsInput: "",
            materialsInput: "",
          });
          setTags(course.tags || []);
          setMaterials(course.materials || []);
        })
        .catch((error) => {
          console.error("Failed to fetch course data", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [courseId]);

  const handleAddTag = () => {
    if (formik.values.tagsInput) {
      setTags((prevTags) => [...prevTags, formik.values.tagsInput]);
      formik.setFieldValue("tags", [
        ...formik.values.tags,
        formik.values.tagsInput,
      ]);
      formik.setFieldValue("tagsInput", "");
    }
  };

  const handleAddMaterial = () => {
    if (formik.values.materialsInput) {
      setMaterials((prevMaterials) => [
        ...prevMaterials,
        formik.values.materialsInput,
      ]);
      formik.setFieldValue("materials", [
        ...formik.values.materials,
        formik.values.materialsInput,
      ]);
      formik.setFieldValue("materialsInput", "");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prevTags) => prevTags.filter((t) => t !== tag));
    formik.setFieldValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  };

  const handleRemoveMaterial = (material: string) => {
    setMaterials((prevMaterials) =>
      prevMaterials.filter((m) => m !== material)
    );
    formik.setFieldValue(
      "materials",
      materials.filter((m) => m !== material)
    );
  };

  if (isLoading) {
    return <div>Loading...</div>; // Можно сделать лучшее отображение загрузки
  }

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {courseId ? "Edit Course" : "Create a Course"}
      </h1>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Поле для названия курса */}
        <div className="form-control">
          <label
            htmlFor="courseName"
            className="block text-gray-700 font-medium mb-2"
          >
            Course Name
          </label>
          <input
            id="courseName"
            name="courseName"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.courseName}
            className={`w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 ${
              formik.touched.courseName && formik.errors.courseName
                ? "border-red-500"
                : ""
            }`}
          />
          {formik.touched.courseName && formik.errors.courseName ? (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.courseName}
            </div>
          ) : null}
        </div>

        {/* Поле для тегов */}
        <div className="form-control">
          <label
            htmlFor="tagsInput"
            className="block text-gray-700 font-medium mb-2"
          >
            Tags
          </label>
          <div className="flex items-center gap-2 mb-4">
            <input
              id="tagsInput"
              name="tagsInput"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.tagsInput}
              className="flex-grow p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Tag
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full border border-gray-300 flex items-center gap-2"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          {formik.touched.tags && formik.errors.tags ? (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.tags}
            </div>
          ) : null}
        </div>

        {/* Описание курса */}
        <div className="form-control">
          <label
            htmlFor="description"
            className="block text-gray-700 font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
            className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            rows={3}
          />
          {formik.touched.description && formik.errors.description ? (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.description}
            </div>
          ) : null}
        </div>

        {/* Материалы */}
        <div className="form-control">
          <label
            htmlFor="materialsInput"
            className="block text-gray-700 font-medium mb-2"
          >
            Materials
          </label>
          <div className="flex items-center gap-2 mb-4">
            <input
              id="materialsInput"
              name="materialsInput"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.materialsInput}
              className="flex-grow p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={handleAddMaterial}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Add Material
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {materials.map((material, index) => (
              <div
                key={index}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full border border-gray-300 flex items-center gap-2"
              >
                <span>{material}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(material)}
                  className="text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          {formik.touched.materials && formik.errors.materials ? (
            <div className="text-red-500 text-sm mt-1">
              {formik.errors.materials}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {courseId ? "Update Course" : "Create Course"}
        </button>
      </form>
    </div>
  );
}