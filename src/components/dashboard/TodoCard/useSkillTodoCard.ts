import { useState } from "react";

export function useSkillTodoCard(){
    const [isEditing, setIsEditing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand  = ()=> setIsExpanded((prev)=> !prev);
    const startEdit = ()=> setIsEditing(true);
    const cancelEdit = ()=> setIsEditing(false);
    const finishEdit = ()=> setIsEditing(false);

    return {
      isEditing,
      isExpanded,
      toggleExpand,
      startEdit,
      cancelEdit,
      finishEdit
    }
}
