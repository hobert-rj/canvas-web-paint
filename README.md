# canvas-web-paint intro

canvas-web-paint is a simple canvas-based web-based paint application that allows users to create digital drawings and sketches. It provides a variety of tools and color options to facilitate the creative process.

## Features

- Draw using a pencil, pen, or eraser tool.
- Choose from a selection of predefined colors or pick a custom color using the color picker.
- Adjust the brush size to create thin lines or bold strokes.
- Manage multiple canvas views with tab support.
- Save your artwork as an image for sharing or future reference.
- Toggle the tool and color selection toolbar for a clutter-free drawing experience.
- Responsive design for various screen sizes.

## Demo

You can try out the canvas-web-paint by visiting [🔗 this link](https://hobert-rj.github.io/canvas-web-paint/).

## Installation

1. Fork this repository.
2. Clone the your fork:
```bash
git clone https://github.com/[your-user-name]/canvas-web-paint.git
```
###### &emsp; Remember to replace "[your-user-name]" with your actual GitHub username in the clone URL.
3. Open `index.html` in your web browser to use the paint application.
4. Integrate it into your app, if you're planning to use this canvas-web-paint app as part of a larger project.

## Developer Guide
This guide provides an overview of the main functions within the canvas-web-paint's JavaScript code. Understanding these functions will help you navigate and modify the app's behavior.

### `paintInit()`
This function initializes the paint application and should be called when the HTML element with the id="paintPage" is rendered. It sets up event listeners, initializes variables, and prepares the canvas for drawing. This function is responsible for the initial setup of the application.

### `paintSetJson(arr, startingId)`
The paintSetJson function allows you to set JSON data to the paint application. It takes two parameters:<br>
&emsp; `arr`: The JSON data as a string. This data typically represents saved canvas drawings and tab information.<br>
&emsp; `startingId` (optional): The ID to start creating tabs from. This is useful when you want to start tab creation from a specific ID.<br>
By calling this function with the appropriate JSON data, you can load previously saved drawings and tab configurations into the application.

### `paintGetJson()`
The paintGetJson function returns the JSON data representing the current state of the paint application. It collects data about canvas drawings and tab configurations, which can be saved externally, such as in a database or a local storage system.

### Other Key Functions
- `paintStartDraw(e)`: Begins the drawing process when the user interacts with the canvas. It sets up initial coordinates and starts drawing lines.
- `paintContinueDraw(e)`: Continues the drawing process as the user moves the cursor or finger. It handles the logic for drawing lines based on user input.
- `paintSelectColor()`, `paintPickColor()`, `paintSetTool()`: Manage color and tool selection based on user interactions.
- `paintSaveImg(e)`: Handles the process of saving the current canvas drawing as an image.
- `paintToggle()`: Toggles the visibility of the tool and color selection toolbar.
- `paintSelectTab(e, id)`: Selects a specific tab for drawing, allowing users to switch between canvas views.
- `paintNewTab()`: Creates a new tab for a fresh canvas drawing, supporting multiple drawings within the same application instance.
- `paintCreateTab(newId)`: Creates a new tab element with a specified ID.
- `paintClearTab(e)`: Clears the current canvas drawing, giving users a fresh canvas to work with.
- `paintDeleteTab(id)`: Deletes a specific tab, allowing users to remove canvas views as needed.
- `paintFindNextId(nextId, condition)`: Finds the next available tab ID based on the given condition.

Understanding these functions will enable you to modify, enhance, or troubleshoot the canvas-web-paint according to your requirements.

## Contributing

Contributions to the canvas-web-paint are welcome! If you find any issues or have suggestions for improvements, here are some areas you can contribute to:

- **Debugging and Documentation**: Help identify and fix bugs in the codebase. Additionally, enhance the documentation to make it more comprehensive and user-friendly.

- **Adding More Tools**: Expand the range of tools available in the paint application. You can introduce new brushes, shapes, or additional drawing features to enhance the creative experience.

- **Separating Namespace**: Consider refactoring the code to ensure a more modular and organized structure. Separating different functionalities into distinct namespaces can improve maintainability and extensibility.

- **Detecting `#paintPage` Load Programmatically**: Enhance the application by adding a mechanism to programmatically detect when the `#paintPage` element is loaded. This could help streamline the initialization process and handle any associated actions.

- **Initializing `#paintPage` Programmatically**: Implement the ability to initialize the paint application programmatically by providing a function that sets up the paint environment when called.

Feel free to open an issue or submit a pull request with your contributions. Your contributions will play a significant role in the growth and improvement of the canvas-web-paint.

## License

This project is licensed under the MIT License.

---

Developed by [Hossein Rajabi](https://github.com/hobert-rj).
