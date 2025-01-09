import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@radix-ui/react-accordion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Cve } from "~/pages/report";

interface LongDescriptionProps {
  cve: Cve;
}

export const Remediation = ({ cve }: LongDescriptionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Accordion
      defaultValue="item-1"
      type="single"
      collapsible
      className="mt-4 w-full text-xl"
    >
      <AccordionItem value="item-1">
        <AccordionTrigger className="w-full" onClick={() => setIsOpen(!isOpen)}>
          <div className="flex items-center rounded-md border border-violet-200/60 bg-black/30 p-2 shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`feather feather-chevron-down ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
            <span className="ml-2 font-orbitron text-xs font-bold uppercase tracking-wider text-violet-100">
              Remediation Plan
            </span>
          </div>
        </AccordionTrigger>

        <AccordionContent className="AccordionContent">
          <div className="mt-4 space-y-4 font-roboto">
            <ReactMarkdown>{cve.Analysis.remediation_plan}</ReactMarkdown>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
