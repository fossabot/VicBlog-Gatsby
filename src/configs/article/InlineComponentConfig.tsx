import React from "react";
import ResumeLayout from "@/layouts/ResumeLayout";
import Contacts from "@/components/Contacts";

export default {
  "resume-layout": ResumeLayout,
  "feedback-contacts": () => <Contacts color={"black"} size={1.4} />,
};