"use client";
import { newSkillTodo } from "@/types/skillDashboardTypes";
import gsap from "gsap";
import { ChevronUp, Ellipsis, PlusIcon } from "lucide-react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import TagInput from "./tag-input";

//defining the props expected by the skilltodoform component
//these are the callback props as they will be passed functions from parent component of TodoList
interface SkillTodoFormProps {
  onAddSkillTodo: (todo: Omit<newSkillTodo, "skillId">) => void; //function to call when the form is submitted successfully
  onCancel: () => void; //function to call when the cancel button is clicked
  isSubmitting?: boolean; //optional prop to indicate if the parent component is currently processing the submission
}
//and after we have made the props to pass to the functional component i. SkillTodoForm we will destructure the props
// and with destructuring we will pass default value for isSubmitting
export default function SkillTodoForm({
  onAddSkillTodo,
  onCancel,
  isSubmitting = false,
}: SkillTodoFormProps) {
  // expanding the form
  const [isExpanded, setIsExpanded] = useState(false);
  // use of react hooks and using local state to define the value of form inputs
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [resourceLink, setResourceLink] = useState("");
  //and local state to manage and display the validation error for the form
  const [validationError, setValidationError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const formFieldsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // handling Expanded state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Animation for expanding /collapsing
  useEffect(() => {
    if (!drawerRef.current || !formFieldsRef.current || !formRef.current)
      return;

    const drawer = drawerRef.current;
    const formFields = formFieldsRef.current;
    const formElements = Array.from(formFields.children);
    const form = formRef.current;

    if (isExpanded) {
      //first the initial state of the form will be
      gsap.set(drawer, { height: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" });
      gsap.set(formFields, { opacity: 0, y: 20 });
      gsap.set(formElements, { opacity: 0, y: 15, scale: 0.98 });

      //animation timeline
      const tl = gsap.timeline();

      //expand the drawer first
      tl.to(form, {
        scale: 1.01,
        duration: 0.2,
        ease: "power2.out",
      })
        .to(drawer, {
          height: "auto",
          duration: 0.35,
          ease: "back.out(1.1)",
        })
        .to(
          drawer,
          {
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            duration: 0.3,
            ease: "power2.out",
          },
          "-=0.25"
        )

        //fade in the form container
        .to(
          formFields,
          {
            opacity: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
          },
          "-=0.1"
        )
        //stagger reveal form elements
        .to(
          formElements,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.06,
            duration: 0.25,
            ease: "power2.out",
            onComplete: () => {
              ///focus on the title input when expanded
              inputRef.current?.focus();
            },
          },
          "-=0.15"
        )
        .to(
          form,
          {
            scale: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          "-=0.2"
        );
    } else {
      //collapse animation
      const tl = gsap.timeline();

      //hide the form elements first
      tl.to(formElements, {
        opacity: 0,
        y: 10,
        stagger: 0.03,
        duration: 0.15,
        ease: "power2.in",
      })
        //then fade out container
        .to(
          formFields,
          {
            opacity: 0,
            y: 15,
            duration: 0.2,
            ease: "power2.in",
          },
          "-=0.1"
        )
        //finally collapse the drawer
        .to(
          drawer,
          {
            height: 0,
            duration: 0.25,
            ease: "power2.in",
          },
          "-=0.15"
        );
    }
  }, [isExpanded]);
  // event handlers and calling this function when the submit button is clicked

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //client side validation to ensure the title is not empty or blank whitespace
    if (!title.trim()) {
      setValidationError("Task name is required");
      return; //stop submission if validation fails
    }
    // --call parent handler to pass the collected data up to the parent component
    //so that parent component can add the skillId before calling the server action
    onAddSkillTodo({
      title: title.trim(),
      resourceLink: resourceLink.trim() || null,
      tags: tags,
    });
    // reset form after submission
    setTitle("");
    setResourceLink("");
    setTags([]);
    setValidationError("");
  };

  //handle input change and clear validation error on typing
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };
  return (
    <div className=" flex justify-center items-end z-50">
      <div className="w-full max-w-3xl mx-auto ">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className=" relative  flex flex-col  shadow-md border border-gray-200 overflow-hidden rounded-xl"
        >
          {/* main input bar - visible always */}
          <div className="relative z-20 flex items-center justify-between">
            <button
              onClick={toggleExpand}
              type="button"
              className={`p-3 transition-colors ${
                isExpanded ? "text-blue-600" : ""
              }`}
            >
              <ChevronUp
                size={20}
                className={` transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* task title input field */}
            <div className=" relative w-full  ">
              <input
                ref={inputRef}
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className={`flex-1  p-3  rounded-lg focus:outline-none  w-full  ${
                  validationError ? "border-red-500" : ""
                }`}
                placeholder="Add task for the skill"
                aria-required="true"
                aria-invalid={!!validationError}
                disabled={isSubmitting}
                autoFocus
              />
              {validationError && (
                <span className="  text-red-500 text-xs mt-1">
                  {validationError}
                </span>
              )}
            </div>
            <button
              type="submit"
              className="p-3  text-blue-600 hover:bg-blue-800 hover:text-white rounded-lg"
            >
              {isSubmitting ? "adding..." : <PlusIcon size={20} />}
            </button>
            <button onClick={onCancel} className="p-2">
              <Ellipsis />
            </button>
          </div>

          {/* Expandable drawer containing tag and description field */}
          <div
            ref={drawerRef}
            className=" relative z-10 overflow-hidden h-0 bg-gradient-to-b  border-t border-gray-100 "
          >
            <div ref={formFieldsRef} className="p-4 space-y-4 opacity-0">
              {/* tag input field */}
              <div>
                <label
                  htmlFor="tags"
                  className="block text-sm font-medium mb-1"
                >
                  Tags (optional)
                </label>
                <TagInput tags={tags} setTags={setTags} />
              </div>
              {/* description input field */}
              <div>
                <label
                  htmlFor="resourceLink"
                  className="block text-sm font-medium mb-1"
                >
                  ResourceLink (optional)
                </label>
                <input
                  id="resourceLink"
                  className="w-full px-3 py-2  border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resource"
                  value={resourceLink}
                  onChange={(e) => setResourceLink(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
