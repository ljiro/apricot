"use client";

import { cn } from "@/lib/utils";

const previewScale = 0.22;

export function TemplatePreviewBlank() {
  return (
    <div
      className="w-full h-full bg-white flex flex-col p-3"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="w-full border-b border-[#e8eaed] opacity-40"
          style={{ marginTop: i === 1 ? "0.5em" : "0.75em", height: "0.35em" }}
        />
      ))}
    </div>
  );
}

export function TemplatePreviewResume() {
  return (
    <div
      className="w-full h-full bg-white text-[#3c4043] overflow-hidden p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: `${10 / previewScale}px`,
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
        width: `${100 / previewScale}%`,
        height: `${100 / previewScale}%`,
      }}
    >
      <div style={{ padding: "8px 12px", lineHeight: 1.2 }}>
        <div style={{ fontSize: "1.4em", fontWeight: 700, marginBottom: "2px" }}>Your Name</div>
        <div style={{ fontSize: "0.85em", color: "#5f6368", marginBottom: "8px" }}>
          Email | Phone | Location
        </div>
        <div style={{ fontSize: "1em", fontWeight: 700, marginBottom: "4px" }}>Experience</div>
        <div style={{ fontSize: "0.95em", fontWeight: 600 }}>Job Title, Company</div>
        <div style={{ fontSize: "0.8em", fontStyle: "italic", color: "#5f6368", marginBottom: "2px" }}>
          Dates
        </div>
        <div style={{ fontSize: "0.85em", marginBottom: "6px" }}>
          Description of responsibilities and achievements.
        </div>
        <div style={{ fontSize: "0.95em", fontWeight: 600 }}>Job Title, Company</div>
        <div style={{ fontSize: "0.8em", fontStyle: "italic", color: "#5f6368", marginBottom: "8px" }}>
          Dates
        </div>
        <div style={{ fontSize: "1em", fontWeight: 700, marginBottom: "4px" }}>Education</div>
        <div style={{ fontSize: "0.95em", fontWeight: 600 }}>Degree, Institution</div>
        <div style={{ fontSize: "0.8em", fontStyle: "italic", color: "#5f6368" }}>Year</div>
      </div>
    </div>
  );
}

export function TemplatePreviewLetter() {
  return (
    <div
      className="w-full h-full bg-white text-[#3c4043] overflow-hidden p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: `${10 / previewScale}px`,
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
        width: `${100 / previewScale}%`,
        height: `${100 / previewScale}%`,
      }}
    >
      <div style={{ padding: "8px 12px", lineHeight: 1.3 }}>
        <div style={{ textAlign: "right", fontSize: "0.85em", marginBottom: "6px" }}>
          Your address
          <br />
          City, State, ZIP
          <br />
          Date
        </div>
        <div style={{ fontSize: "0.85em", marginBottom: "6px" }}>
          Recipient name
          <br />
          Title, Company, Address
        </div>
        <div style={{ marginBottom: "4px" }}>Dear [Recipient],</div>
        <div style={{ fontSize: "0.9em", marginBottom: "2px" }}>Opening paragraph.</div>
        <div style={{ fontSize: "0.9em", marginBottom: "2px" }}>Body paragraph.</div>
        <div style={{ fontSize: "0.9em", marginBottom: "8px" }}>Closing paragraph.</div>
        <div style={{ fontSize: "0.9em" }}>
          Sincerely,
          <br />
          Your name
        </div>
      </div>
    </div>
  );
}

export function TemplatePreviewMeeting() {
  return (
    <div
      className="w-full h-full bg-white text-[#3c4043] overflow-hidden p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: `${10 / previewScale}px`,
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
        width: `${100 / previewScale}%`,
        height: `${100 / previewScale}%`,
      }}
    >
      <div style={{ padding: "8px 12px", lineHeight: 1.25 }}>
        <div style={{ fontSize: "1.2em", fontWeight: 700, marginBottom: "2px" }}>
          Meeting: [Topic]
        </div>
        <div style={{ fontSize: "0.8em", color: "#5f6368", marginBottom: "6px" }}>
          <strong>Date:</strong> [Date] | <strong>Attendees:</strong> [Names]
        </div>
        <div style={{ fontSize: "0.95em", fontWeight: 700, marginBottom: "2px" }}>Agenda</div>
        <ul style={{ margin: "0 0 6px 12px", padding: 0 }}>
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
        <div style={{ fontSize: "0.95em", fontWeight: 700, marginBottom: "2px" }}>Notes</div>
        <div style={{ fontSize: "0.85em", marginBottom: "6px", minHeight: "1em" }} />
        <div style={{ fontSize: "0.95em", fontWeight: 700, marginBottom: "2px" }}>Action items</div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "2px" }}>
          <input type="checkbox" readOnly className="rounded border-[#5f6368]" style={{ width: "10px", height: "10px" }} />
          <span style={{ fontSize: "0.9em" }}>Action 1</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <input type="checkbox" readOnly className="rounded border-[#5f6368]" style={{ width: "10px", height: "10px" }} />
          <span style={{ fontSize: "0.9em" }}>Action 2</span>
        </div>
      </div>
    </div>
  );
}

export function TemplatePreviewTodo() {
  return (
    <div
      className="w-full h-full bg-white text-[#3c4043] overflow-hidden p-2"
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: `${10 / previewScale}px`,
        transform: `scale(${previewScale})`,
        transformOrigin: "top left",
        width: `${100 / previewScale}%`,
        height: `${100 / previewScale}%`,
      }}
    >
      <div style={{ padding: "8px 12px", lineHeight: 1.4 }}>
        <div style={{ fontSize: "1.2em", fontWeight: 700, marginBottom: "8px" }}>To-do list</div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <input type="checkbox" readOnly className="rounded border-[#5f6368]" style={{ width: "10px", height: "10px" }} />
          <span style={{ fontSize: "0.95em" }}>Task 1</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <input type="checkbox" readOnly className="rounded border-[#5f6368]" style={{ width: "10px", height: "10px" }} />
          <span style={{ fontSize: "0.95em" }}>Task 2</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
          <input type="checkbox" readOnly className="rounded border-[#5f6368]" style={{ width: "10px", height: "10px" }} />
          <span style={{ fontSize: "0.95em" }}>Task 3</span>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_MAP = {
  blank: TemplatePreviewBlank,
  resume: TemplatePreviewResume,
  letter: TemplatePreviewLetter,
  meeting: TemplatePreviewMeeting,
  todo: TemplatePreviewTodo,
} as const;

type TemplateId = keyof typeof PREVIEW_MAP;

export function TemplatePreview({
  templateId,
  className,
}: {
  templateId: TemplateId;
  className?: string;
}) {
  const Preview = PREVIEW_MAP[templateId] ?? TemplatePreviewBlank;
  return (
    <div
      className={cn(
        "w-full h-full min-h-0 bg-transparent overflow-hidden rounded-lg",
        className
      )}
    >
      <div className="w-full h-full flex items-center justify-center min-h-0">
        <div className="w-full h-full max-w-full max-h-full bg-white overflow-hidden min-h-0">
          <Preview />
        </div>
      </div>
    </div>
  );
}
