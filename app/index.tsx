import React, { useState } from "react";
import {
    FlatList, StyleSheet,
    Text, TextInput, TouchableOpacity,
    useColorScheme,
    View
} from "react-native";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  audioUri: string | null;
}

export default function Index() {
  const theme = useColorScheme(); // 'light' or 'dark'
  const isDark = theme === "dark";

  // State (Just like React Web)
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    if (!task) return;
    setTodos([...todos, { id: Date.now().toString(), text: task, completed: false, audioUri: null }]);
    setTask("");
  };

  const toggleComplete = (id: string) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Dynamic Styles
  const styles = getStyles(isDark);

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        placeholder="Add a task..." 
        placeholderTextColor={isDark ? "#ccc" : "#666"}
        value={task}
        onChangeText={setTask} 
      />
      
      <TouchableOpacity style={styles.addButton} onPress={addTodo}>
        <Text style={styles.addText}>Add Task</Text>
      </TouchableOpacity>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity onPress={() => toggleComplete(item.id)} style={styles.itemContent}>
              <View style={[styles.circle, item.completed && styles.circleFilled]} />
              <Text style={[styles.itemText, item.completed && styles.completedText]}>{item.text}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteTodo(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// Styles Factory (To handle Dual Theme)
const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: isDark ? "#121212" : "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? "#444" : "#ddd",
    padding: 15,
    borderRadius: 10,
    color: isDark ? "#fff" : "#000",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  addText: { color: "#fff", fontWeight: "bold" },
  item: {
    padding: 15,
    backgroundColor: isDark ? "#1e1e1e" : "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleFilled: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  itemText: { color: isDark ? "#fff" : "#000" },
  completedText: {
    textDecorationLine: 'line-through',
    color: isDark ? "#888" : "#999",
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 5,
  },
  deleteText: { color: "#fff", fontSize: 12 },
});