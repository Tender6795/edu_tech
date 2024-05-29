// import { useParams, usePathname } from "next/navigation";
import { getCoursesById } from "../action";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
// import Button from "../../../components/button/index";
import Modal from "../components/Modal/Modal";
import CourseDetails from "./components/CourseDetails/CourseDetails";
import Lessons from "./components/Lessons/Lessons";
import handleClick from "./action";
import { CTAButton } from "./components/button-action";

const Page = async ({ params: { id } }) => {
  const supabase = createClient();
  const heads = headers();
  const pathname = heads.get("x-pathname");

  let { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id);
  // @ts-ignore

  if (course && course.length > 0) {
    console.log(course[0]);
    console.log("questions", course[0]);
    return (
      <div>
        {" "}
        <div className="hero min-h-screen bg-base-200">
          <div className="flex lg:flex-row-reverse">
            <embed
              width="600"
              height="400"
              src={course[0].video_url}
              allowFullScreen
            ></embed>
            <CourseDetails course={course} id={id} />
          </div>
        </div>
        <div className="flex justify-center bg-base-200 ">
          {" "}
          <div className="flex flex-col">
            <div className="flex jus">
              <CTAButton />
              {/* <Button handleChange={handleClick} text={"Create new lesson"} /> */}
            </div>
            <div className="flex ">
              {" "}
              <Lessons />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    console.log("Course not found");
    return <div>Course not found</div>;
  }
};

export default Page;
