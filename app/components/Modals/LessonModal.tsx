"use client";
import React, { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "@/app/store/hooks";
import {
  fetchAddLessonToCourse,
  fetchUpdateLesson,
} from "@/app/store/slices/currentCourseSlice";
import { ILesson } from "@/app/interfaces/interfaces";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  text: Yup.string(),
  materials: Yup.array().of(Yup.string()).required("Materials are required"),
  indexNumber: Yup.number()
    .required("Index number is required")
    .positive()
    .integer(),
});

interface LessonModalProps {
  courseId?: string;
  lesson?: ILesson;
}

const LessonModal = ({ courseId, lesson }: LessonModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      title: lesson?.title || "",
      text: lesson?.text || "",
      materials: lesson?.materials || [""],
      indexNumber: lesson?.indexNumber || 1,
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (lesson?.id) {
          await dispatch(fetchUpdateLesson({ lesson: values, id: lesson.id }));
        }
        if (courseId && !lesson?.id) {
          await dispatch(fetchAddLessonToCourse({ ...values, courseId }));
        }
        closeModal();
      } catch (error) {
        console.error("Failed to save lesson", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleMaterialChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const newMaterials = [...formik.values.materials];
      newMaterials[index] = event.target.value;
      formik.setFieldValue("materials", newMaterials);
    },
    [formik]
  );

  const addMaterialField = useCallback(() => {
    formik.setFieldValue("materials", [...formik.values.materials, ""]);
  }, [formik]);

  const removeMaterialField = useCallback(
    (index: number) => {
      const newMaterials = formik.values.materials.filter(
        (_, i) => i !== index
      );
      formik.setFieldValue("materials", newMaterials);
    },
    [formik]
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        {lesson?.id ? "Edit Lesson" : "Add Lesson"}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <h2 className="text-2xl font-bold mb-4">
              {lesson?.id ? "Edit Lesson" : "Create Lesson"}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Before Formik Submit");
                formik.handleSubmit(e);
                console.log("After Formik Submit");
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="title"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.title}
                  className={`w-full p-2 border rounded ${
                    formik.touched.title && formik.errors.title
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.title && formik.errors.title ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.title}
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="text"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Text
                </label>
                <textarea
                  id="text"
                  name="text"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.text}
                  className="w-full p-2 border rounded border-gray-300"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Materials
                </label>
                {formik.values.materials.map((material, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={material}
                      onChange={(event) => handleMaterialChange(index, event)}
                      className="flex-1 p-2 border rounded border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removeMaterialField(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMaterialField}
                  className="text-blue-500"
                >
                  Add Material
                </button>
                {formik.touched.materials && formik.errors.materials ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.materials}
                  </div>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="indexNumber"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Index Number
                </label>
                <input
                  id="indexNumber"
                  name="indexNumber"
                  type="number"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.indexNumber}
                  className={`w-full p-2 border rounded ${
                    formik.touched.indexNumber && formik.errors.indexNumber
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {formik.touched.indexNumber && formik.errors.indexNumber ? (
                  <div className="text-red-500 text-sm">
                    {formik.errors.indexNumber}
                  </div>
                ) : null}
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {lesson?.id ? "Update Lesson" : "Create Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonModal;
