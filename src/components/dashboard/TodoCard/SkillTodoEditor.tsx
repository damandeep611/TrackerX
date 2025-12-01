import { skillTodo } from '@/types/skillDashboardTypes';
import React, { useState } from 'react'
import TagInput from '../skilltodos/tag-input';


interface SkillTodoEditorProps {
  todo: skillTodo;
  onSave: (updatedTodo: Partial<skillTodo>)=> void;
  onCancel: ()=> void;
  isSaving: boolean;
}

export default function SkillTodoEditor({todo, onCancel, isSaving = false, onSave}:SkillTodoEditorProps) {
  const [title, setTitle]  = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [tags, setTags] = useState<string[]>(todo.tags || []);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim() || null,

      tags,
    });
  };

  return (
    <div className="   rounded-md p-4 shadow-sm hover:shadow-md border border-border transition-shadow">
      <div className="space-y-3 ">
        {/* title of todo being edited */}
        <div className="">
          <input
            type="text"
            id={`edit-title${todo.id}`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError("");
            }}
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              error ? "border-red-500" : ""
            }`}
            disabled={isSaving}
            autoFocus
          />
          {error && <p className="text-red-600">{error}</p>}
        </div>
        {/* editing the optinal tag */}
        <div>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <div>
          <textarea
            id={`edit-description-${todo.description}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg "
            disabled={isSaving}
          />
        </div>
        {/* editing action buttons */}
        <div className="flex  justify-end space-x-2">
          <button
            onClick={onCancel}
            className="bg-red-700 text-white rounded-md font-medium py-2 px-4 text-sm hover:bg-red-900"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white rounded-md font-medium py-2 px-4 text-sm hover:bg-green-800"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
