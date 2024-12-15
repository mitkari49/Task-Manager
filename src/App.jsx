import "react-tabulator/css/semantic-ui/tabulator_semantic-ui.min.css"; // semantic UI
import { ReactTabulator } from "react-tabulator";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";

export default function App() {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for new task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "To Do",
  });

  // State for status filter
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://jsonplaceholder.typicode.com/todos");
        const mappedData = response.data.slice(0, 20).map((task) => ({
          id: task.id,
          title: task.title,
          description: "Default Description", // Placeholder description
          status: task.completed ? "Done" : "To Do", // Map completed to status
        }));
        setData(mappedData);
      } catch (err) {
        setError("Failed to load tasks. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Status filter handler
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Filter the data based on the search query and status filter
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesSearch = Object.values(row).some(
        (value) => value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesStatus = statusFilter === "All" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, data]);

  // Add a new task
  const handleAddTask = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    if (!newTask.title || !newTask.description) return; // Validate empty fields

    const newTaskData = {
      id: data.length + 1, // Generate a new unique ID
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
    };
    setData((prevData) => [...prevData, newTaskData]);
    setNewTask({ title: "", description: "", status: "To Do" }); // Reset form
  };

  // Delete a task
  const handleDeleteTask = (taskId) => {
    setData((prevData) => prevData.filter((task) => task.id !== taskId));
  };

  // Columns definition
  const columns = [
    { title: "Task ID", field: "id", editable: false },
    { title: "Title", field: "title", editor: "input" }, // Make title editable
    { title: "Description", field: "description", editor: "input" }, // Make description editable
    {
      title: "Status",
      field: "status",
      editor: "select", // Dropdown editor for status
      editorParams: { values: ["To Do", "In Progress", "Done"] }, // Dropdown options
    },
    {
      title: "Actions",
      field: "actions",
      formatter: (cell) => {
        return `<button class="delete-button" style="background-color: red; color: white; border: none; padding: 5px; border-radius: 3px;">Delete</button>`;
      },
      cellClick: (e, cell) => {
        if (e.target.classList.contains("delete-button")) {
          handleDeleteTask(cell.getRow().getData().id);
        }
      },
    },
  ];

  const options = {
    pagination: "local",
    paginationSize: 5, // Number of rows per page
    movableColumns: true,
    resizableColumns: true,
    cellEdited: (cell) => {
      const updatedData = cell.getRow().getData();
      setData((prevData) => prevData.map(task => task.id === updatedData.id ? updatedData : task));
    },
  };

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="wrapper">
      <h1>Task List Manager</h1>
      {/* Search Input */}
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchQuery}
        name="search"
        onChange={handleSearch}
        style={{ marginBottom: "10px", padding: "5px", width: "200px" }}
      />
  
      {/* Status Filter Dropdown */}
      <select
        value={statusFilter}
        onChange={handleStatusFilter}
        style={{ marginBottom: "10px", padding: "5px", marginLeft: "10px" }}
      >
        <option value="All">All</option>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Done">Done</option>
      </select>
  
      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
          style={{ marginRight: "5px", padding: "5px" }}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          required
          style={{ marginRight: "5px", padding: "5px" }}
        />
        <select
          value={newTask.status}
          onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
          style={{ marginRight: "5px", padding: "5px" }}
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <button type="submit" style={{ padding: "5px 10px" }}>Add Task</button>
      </form>
  
      {/* Tabulator Table */}
      <ReactTabulator
        data={filteredData}
        columns={columns}
        options={options}
      />
    </div>
  );
  
}