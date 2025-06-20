"use client";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Cpu, FolderCheck, House } from "lucide-react";

interface SkillHeaderProps {
  skillSlug: string;
}

export default function SkillHeader({ skillSlug }: SkillHeaderProps) {
  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="flex items-center justify-center gap-2"
            >
              {" "}
              <House size={15} /> Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              href="/dashboard"
              className="flex items-center justify-center gap-2"
            >
              <Cpu size={15} />
              Skills
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="flex items-center justify-center gap-2">
              {" "}
              <FolderCheck size={15} />
              {skillSlug}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
