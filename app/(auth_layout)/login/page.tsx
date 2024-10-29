"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { UserIcon } from "../../components/Icons/UserIcon";
import { PasswordLockIcon } from "../../components/Icons/PasswordLockIcon";
import { Input } from "../../components/Input";
import { FormCard } from "@/app/components/FormCard";
import { useAppDispatch } from "@/app/store/hooks";
import { fetchLogin } from "@/app/store/slices/userSlice";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const dispatch = useAppDispatch();
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(fetchLogin(values));
        router.push("/");
      } catch (error) {
        console.error("Login error:", error);
      }
    },
  });

  return (
    <FormCard>
      <form className="grid grid-flow-row gap-8" onSubmit={formik.handleSubmit}>
        <h2 className="text-3xl font-semibold text-center mb-2">Login autodeploy test</h2>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email"
          icon={<UserIcon className="input-icon w-5 h-5" />}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
          className={
            formik.touched.email && formik.errors.email ? "input-error" : ""
          }
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="alert alert-error text-xs p-2 rounded">
            {formik.errors.email}
          </div>
        ) : null}

        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="Password"
          icon={<PasswordLockIcon className="input-icon w-5 h-5" />}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
          className={
            formik.touched.password && formik.errors.password
              ? "input-error"
              : ""
          }
        />
        {formik.touched.password && formik.errors.password ? (
          <div className="alert alert-error text-xs p-2 rounded">
            {formik.errors.password}
          </div>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary rounded-full w-full mt-5 text-base"
        >
          Sign In
        </button>
        <div className="flex justify-center">
          <span className="text-sm">
            Don&apos;t have an account?{" "}
            <Link href={"/signup"} className="text-primary font-semibold">
              Sign Up
            </Link>
          </span>
        </div>
      </form>
    </FormCard>
  );
}
