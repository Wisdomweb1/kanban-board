import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Button from "./components/ui/button";
import Card from "./components/ui/card";
import CardContent from "./components/ui/cardContent";

const getStoredColumns = () => {
  const savedColumns = localStorage.getItem("kanbanColumns");
  return savedColumns ? JSON.parse(savedColumns) : {
    todo: { name: "To Do", tasks: [] },
    inProgress: { name: "In Progress", tasks: [] },
    done: { name: "Done", tasks: [] },
  };
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState(getStoredColumns);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    localStorage.setItem("kanbanColumns", JSON.stringify(columns));
  }, [columns]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceTasks = [...sourceColumn.tasks];
    const destTasks = [...destColumn.tasks];
    const [movedTask] = sourceTasks.splice(source.index, 1);
    
    let newPriority = "Low";
    if (destination.droppableId === "inProgress") newPriority = "Medium";
    if (destination.droppableId === "done") newPriority = "High";
    
    const updatedTask = { ...movedTask, priority: newPriority };
    destTasks.splice(destination.index, 0, updatedTask);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, tasks: sourceTasks },
      [destination.droppableId]: { ...destColumn, tasks: destTasks },
    });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const newTaskObj = { id: Date.now().toString(), text: newTask, priority: "Low", date: new Date().toLocaleString() };
    setColumns({
      ...columns,
      todo: { ...columns.todo, tasks: [...columns.todo.tasks, newTaskObj] },
    });
    setNewTask("");
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Add new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
        <Button onClick={addTask}>Add Task</Button>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-white p-4 rounded shadow w-full relative">
              <h2 className="text-lg font-semibold mb-2">{column.name}</h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[150px] border p-2 rounded"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 p-3 bg-blue-100 rounded shadow cursor-grab text-center relative pt-10"
                          >
                            <span className="absolute top-1 left-1 px-2 py-1 text-xs font-bold text-white bg-green-500 rounded-md m-1 text-[10px] whitespace-nowrap">
                              {task.priority}
                            </span>
                            <Card>
                              <CardContent className="whitespace-normal break-words">{task.text}</CardContent>
                            </Card>
                            <div className="absolute bottom-1 right-1 text-xs text-gray-500 mt-2">
                              {task.date}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
