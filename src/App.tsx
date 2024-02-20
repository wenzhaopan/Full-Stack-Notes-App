import { useState, useEffect } from "react";
import "./App.css";

// Define the type for a note
type Note = {
  id: number;
  title: string;
  content: string;
};

// Component for the login page
const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  // State to hold the entered password
  const [password, setPassword] = useState("");

  // Function to handle the login attempt
  const handleLogin = () => {
    // Implement your authentication logic here
    // Make an HTTP POST request to your backend
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify({ password }), // Pass the password in the request body
    })
    .then(response => {
      if (response.ok) {
        // If the response is OK, call the onLogin function
        onLogin();
      } else {
        // If there's an error, show an alert
        alert("Incorrect password, try again");
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert("An error occurred. Please try again later.");
    });
  };

  // Render the login form
  return (
    <div className="login-page">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        required
      />
      <br></br>
      <button id="authButton" onClick={handleLogin}>Login</button> {/* Button to initiate the login attempt */}
    </div>
  );
};

// Main App Component
const App = () => {
  // State variables
  const [notes, setNotes] = useState<Note[]>([]); // State to hold the notes
  const [authenticated, setAuthenticated] = useState(false); // State to track authentication status
  const [title, setTitle] = useState(""); // State for the title of a note
  const [content, setContent] = useState(""); // State for the content of a note
  const [selectedNote, setSelectedNote] = useState<Note | null>(null); // State for the currently selected note
  const [secondPassword, setSecondPassword] = useState(""); // State to hold the second password

  // Effect to fetch notes from the server on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/notes"); // Fetch notes from the server
        const notes: Note[] = await response.json(); // Parse the response as JSON
        setNotes(notes); // Update the notes state with the fetched data
      } catch (e) {
        console.log(e); // Log any errors that occur during the fetch operation
      }
    };

    fetchNotes(); // Call the fetchNotes function when the component mounts
  }, []);

  // Function to handle a click on a note item
  const handleNoteClick = (note: Note) => {
    setSelectedNote(note); // Set the selected note
    setTitle(note.title); // Set the title of the selected note
    setContent(note.content); // Set the content of the selected note
  };

  // Function to handle adding a new note
  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior
    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST", // HTTP POST request to add a new note
        headers: {
          "Content-Type": "application/json", // Specify the content type as JSON
        },
        body: JSON.stringify({
          title,
          content,
          secondPassword, // Include the second password in the request body
        }), // Convert the note data to JSON and send it in the request body
      });

      const newNote = await response.json(); // Parse the response as JSON
      setNotes([newNote, ...notes]); // Add the new note to the notes list
      setTitle(""); // Clear the title input
      setContent(""); // Clear the content input
    } catch (e) {
      console.log(e); // Log any errors that occur during the request
    }
  };

  // Function to handle updating an existing note
  const handleUpdateNote = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent the default form submission behavior

    if (!selectedNote) {
      return; // If no note is selected, exit early
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/notes/${selectedNote.id}`,
        {
          method: "PUT", // HTTP PUT request to update the selected note
          headers: {
            "Content-Type": "application/json", // Specify the content type as JSON
          },
          body: JSON.stringify({
            title,
            content,
          }), // Convert the updated note data to JSON and send it in the request body
        }
      );

      const updatedNote = await response.json(); // Parse the response as JSON

      // Update the notes list with the updated note
      const updatedNotesList = notes.map((note) =>
        note.id === selectedNote.id ? updatedNote : note
      );

      setNotes(updatedNotesList); // Update the notes state with the updated list
      setTitle(""); // Clear the title input
      setContent(""); // Clear the content input
      setSelectedNote(null); // Deselect the note
    } catch (e) {
      console.log(e); // Log any errors that occur during the request
    }
  };

  // Function to handle canceling note update or addition
  const handleCancel = () => {
    setTitle(""); // Clear the title input
    setContent(""); // Clear the content input
    setSelectedNote(null); // Deselect the note
  };

  // Function to handle deleting a note
  const deleteNote = async (
    event: React.MouseEvent,
    noteId: number
  ) => {
    event.stopPropagation(); // Stop the event from propagating to parent elements

    try {
      await fetch(`http://localhost:5000/api/notes/${noteId}`, {
        method: "DELETE", // HTTP DELETE request to delete the specified note
      });

      // Update the notes list by filtering out the deleted note
      const updatedNotes = notes.filter(
        (note) => note.id !== noteId
      );

      setNotes(updatedNotes); // Update the notes state with the updated list
    } catch (e) {
      console.log(e); // Log any errors that occur during the request
    }
  };

  // Render the app
  // Render the app
  return (
    <div className="app-container">
      {!authenticated ? ( // If not authenticated, show the login page
        <LoginPage onLogin={() => setAuthenticated(true)} />
      ) : ( // If authenticated, show the notes app
        <>
          <form
            className="note-form"
            onSubmit={(event) =>
              selectedNote ? handleUpdateNote(event) : handleAddNote(event)
            }
          >
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title"
              required
            ></input>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Content"
              rows={10}
              required
            ></textarea>
            <input
              type="password"
              value={secondPassword}
              onChange={(event) => setSecondPassword(event.target.value)}
              placeholder="Enter second password"
              required
            ></input>
            {selectedNote ? ( // If a note is selected, show save and cancel buttons
              <div className="edit-buttons">
                <button type="submit">Save</button>
                <button onClick={handleCancel}>Cancel</button>
              </div>
            ) : ( // If no note is selected, show add note button
              <button type="submit">Add Note</button>
            )}
          </form>
          <div className="notes-grid">
            {notes.map((note) => ( // Map through notes to render each note item
              <div
                key={note.id}
                className="note-item"
                onClick={() => handleNoteClick(note)}
              >
                <div className="notes-header">
                  <button
                    onClick={(event) =>
                      deleteNote(event, note.id)
                    }
                  >
                    x
                  </button>
                </div>
                <h2>{note.title}</h2>
                <p>{note.content}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
